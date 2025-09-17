import { Injectable } from '@nestjs/common'

import { BloomreachService } from '../bloomreach/bloomreach.service'
import { NorisPaymentsDto } from '../noris/noris.dto'
import { NorisService } from '../noris/noris.service'
import {
  DeliveryMethod,
  IsInCityAccount,
  UpdateNorisDeliveryMethods,
} from '../noris/utils/noris.types'
import { PrismaService } from '../prisma/prisma.service'
import { addSlashToBirthNumber } from '../utils/functions/birthNumber'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { CityAccountSubservice } from '../utils/subservices/cityaccount.subservice'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import {
  NorisRequestGeneral,
  RequestAdminCreateTestingTaxDto,
  RequestAdminDeleteTaxDto,
  RequestPostNorisLoadDataDto,
  RequestUpdateNorisDeliveryMethodsDto,
} from './dtos/requests.dto'
import { CreateBirthNumbersResponseDto } from './dtos/responses.dto'
import { createTestingTaxMock } from './utils/testing-tax-mock'

@Injectable()
export class AdminService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly prismaService: PrismaService,
    private readonly cityAccountSubservice: CityAccountSubservice,
    private readonly bloomreachService: BloomreachService,
    private readonly norisService: NorisService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {
    this.logger = new LineLoggerSubservice(AdminService.name)
  }

  async loadDataFromNoris(
    data: RequestPostNorisLoadDataDto,
  ): Promise<CreateBirthNumbersResponseDto> {
    return this.norisService.getAndProcessNewNorisTaxDataByBirthNumberAndYear(
      data,
    )
  }

  async updateDataFromNoris(data: RequestPostNorisLoadDataDto) {
    return await this.norisService.getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(
      data,
    )
  }

  async updatePaymentsFromNoris(norisRequest: NorisRequestGeneral) {
    const norisPaymentData: Partial<NorisPaymentsDto>[] =
      norisRequest.type === 'fromToDate'
        ? await this.norisService.getPaymentDataFromNoris(norisRequest.data)
        : await this.norisService.getPaymentDataFromNorisByVariableSymbols(
            norisRequest.data,
          )
    return this.norisService.updatePaymentsFromNorisWithData(norisPaymentData)
  }

  async updateDeliveryMethodsInNoris({
    data,
  }: RequestUpdateNorisDeliveryMethodsDto) {
    /**
     * TODO - concurrency (if someone somehow changes his delivery method during its updating in Noris)
     */
    const deliveryGroups: Record<
      DeliveryMethod,
      { birthNumber: string; date: string | null }[]
    > = {
      [DeliveryMethod.EDESK]: [],
      [DeliveryMethod.CITY_ACCOUNT]: [],
      [DeliveryMethod.POSTAL]: [],
    }

    Object.entries(data).forEach(([birthNumber, methodInfo]) => {
      if (!(methodInfo.deliveryMethod in deliveryGroups)) {
        return
      }

      if (
        methodInfo.deliveryMethod === DeliveryMethod.CITY_ACCOUNT &&
        !methodInfo.date
      ) {
        // We must enforce that the date is present for CITY_ACCOUNT delivery method.
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          `Date must be provided for birth number ${birthNumber} when delivery method is CITY_ACCOUNT`,
        )
      }

      deliveryGroups[methodInfo.deliveryMethod].push({
        birthNumber: addSlashToBirthNumber(birthNumber),
        date:
          methodInfo.deliveryMethod === DeliveryMethod.CITY_ACCOUNT
            ? methodInfo.date
            : null,
      })
    })

    const updates: UpdateNorisDeliveryMethods[] = Object.entries(deliveryGroups)
      .filter(
        ([deliveryMethod, birthNumbers]) =>
          birthNumbers.length > 0 &&
          deliveryMethod !== DeliveryMethod.CITY_ACCOUNT,
      )
      .map(([deliveryMethod, birthNumbers]) => {
        return {
          birthNumbers: birthNumbers.map((item) => item.birthNumber),
          inCityAccount: IsInCityAccount.YES,
          deliveryMethod: deliveryMethod as DeliveryMethod,
          date: null, // date of confirmation of delivery method should be set only for city account notification
        }
      })

    deliveryGroups[DeliveryMethod.CITY_ACCOUNT].forEach((item) => {
      updates.push({
        birthNumbers: [item.birthNumber],
        inCityAccount: IsInCityAccount.YES,
        deliveryMethod: DeliveryMethod.CITY_ACCOUNT,
        date: item.date,
      })
    })

    if (updates.length > 0) {
      await this.norisService.updateDeliveryMethods(updates)
    }
  }

  async removeDeliveryMethodsFromNoris(birthNumber: string): Promise<void> {
    await this.norisService.updateDeliveryMethods([
      {
        birthNumbers: [addSlashToBirthNumber(birthNumber)],
        inCityAccount: IsInCityAccount.NO,
        deliveryMethod: null,
        date: null,
      },
    ])
  }

  /**
   * Creates a testing tax record with specified details for development and testing purposes.
   * WARNING! This tax should be removed after testing, with the endpoint `delete-testing-tax`.
   */
  async createTestingTax({
    year,
    norisData,
  }: RequestAdminCreateTestingTaxDto): Promise<void> {
    const taxAdministrator =
      await this.prismaService.taxAdministrator.findFirst({})
    if (!taxAdministrator) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'No tax administrator found in the database',
      )
    }

    // Generate the mock tax record
    const mockTaxRecord = createTestingTaxMock(
      norisData,
      taxAdministrator,
      year,
    )

    // Process the mock data to create the testing tax
    await this.norisService.processNorisTaxData([mockTaxRecord], year)
  }

  async deleteTax({
    year,
    birthNumber,
  }: RequestAdminDeleteTaxDto): Promise<void> {
    const birthNumberWithSlash = addSlashToBirthNumber(birthNumber)
    const taxPayer = await this.prismaService.taxPayer.findUnique({
      where: {
        birthNumber: birthNumberWithSlash,
      },
    })
    if (!taxPayer) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Tax payer not found',
      )
    }

    const tax = await this.prismaService.tax.findUnique({
      where: {
        taxPayerId_year: {
          taxPayerId: taxPayer.id,
          year,
        },
      },
    })
    if (!tax) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Tax not found',
      )
    }

    await this.prismaService.tax.delete({
      where: {
        taxPayerId_year: {
          taxPayerId: taxPayer.id,
          year,
        },
      },
    })

    const userDataFromCityAccount =
      await this.cityAccountSubservice.getUserDataAdmin(birthNumber)
    if (!userDataFromCityAccount) {
      return
    }

    const bloomreachResponse = await this.bloomreachService.trackEventTax(
      {
        year,
        amount: 0,
        delivery_method: null,
      },
      userDataFromCityAccount.externalId ?? undefined,
    )
    if (!bloomreachResponse) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          `Error in send Tax data to Bloomreach for tax payer with ID ${taxPayer.id} and year ${year}`,
        ),
      )
    }
  }
}

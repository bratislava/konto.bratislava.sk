import { Injectable } from '@nestjs/common'
import { TaxType } from '@prisma/client'

import { BloomreachService } from '../bloomreach/bloomreach.service'
import { ResponseCreatedAlreadyCreatedDto } from '../noris/dtos/response.dto'
import { NorisService } from '../noris/noris.service'
import {
  NorisTaxPayment,
} from '../noris/types/noris.types'
import { PrismaService } from '../prisma/prisma.service'
import { addSlashToBirthNumber } from '../utils/functions/birthNumber'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { CityAccountSubservice } from '../utils/subservices/cityaccount.subservice'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import {
  DateRangeDto,
  NorisRequestGeneral,
  RequestAdminCreateTestingTaxDto,
  RequestAdminDeleteTaxDto,
  RequestUpdateNorisDeliveryMethodsDto,
} from './dtos/requests.dto'
import {
  CreateBirthNumbersResponseDto,
  UpdateDeliveryMethodsInNorisResponseDto,
} from './dtos/responses.dto'
import { getTaxDefinitionByType } from '../tax-definitions/getTaxDefinitionByType'

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
    taxType: TaxType,
    year: number,
    birthNumbers: string[],
  ): Promise<CreateBirthNumbersResponseDto> {
    return this.norisService.getAndProcessNewNorisTaxDataByBirthNumberAndYear(
      taxType,
      year,
      birthNumbers,
    )
  }

  async updateDataFromNoris(
    taxType: TaxType,
    year: number,
    birthNumbers: string[],
  ) {
    return this.norisService.getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(
      taxType,
      year,
      birthNumbers,
    )
  }

  async updatePaymentsFromNoris(
    norisRequest: NorisRequestGeneral,
  ): Promise<ResponseCreatedAlreadyCreatedDto> {
    const norisPaymentData: NorisTaxPayment[] =
      norisRequest.type === 'fromToDate'
        ? await this.norisService.getPaymentDataFromNoris(norisRequest.data)
        : await this.norisService.getPaymentDataFromNorisByVariableSymbols(
            norisRequest.data,
          )
    return this.norisService.updatePaymentsFromNorisWithData(norisPaymentData)
  }

  /**
   * This function pull overpayments from Noris and update the local database.
   * ⚠️ **Warning:** This function will not send email to the user.
   * @param data - The date range to pull overpayments from Noris.
   * @returns The number of created and already created overpayments.
   */
  async updateOverpaymentsDataFromNorisByDateRange(
    data: DateRangeDto,
  ): Promise<ResponseCreatedAlreadyCreatedDto> {
    return this.norisService.updateOverpaymentsDataFromNorisByDateRange(data, {
      suppressEmail: true,
    })
  }

  async updateDeliveryMethodsInNoris({
    data,
  }: RequestUpdateNorisDeliveryMethodsDto): Promise<UpdateDeliveryMethodsInNorisResponseDto> {
    return this.norisService.updateDeliveryMethodsInNoris({ data })
  }

  async removeDeliveryMethodsFromNoris(birthNumber: string): Promise<void> {
    return this.norisService.removeDeliveryMethodsFromNoris(birthNumber)
  }

  /**
   * Creates a testing tax record with specified details for development and testing purposes.
   * WARNING! This tax should be removed after testing, with the endpoint `delete-testing-tax`.
   */
  async createTestingTax(
    { year, norisData }: RequestAdminCreateTestingTaxDto,
    taxType: TaxType,
  ): Promise<void> {
    const taxAdministrator =
      await this.prismaService.taxAdministrator.findFirst({})
    if (!taxAdministrator) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'No tax administrator found in the database',
      )
    }

    // Get tax definition for the tax type
    const taxDefinition = getTaxDefinitionByType(taxType)
    const mockTaxRecord = taxDefinition.createTestingTaxMock(
      norisData,
      taxAdministrator,
      year,
    )

    const taxesByVariableSymbolExist = await this.prismaService.tax.findFirst({
      where: {
        variableSymbol: mockTaxRecord.variabilny_symbol,
      },
    })

    if (taxesByVariableSymbolExist) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Tax with this variable symbol already exists',
      )
    }

    // Process the mock data to create the testing tax
    await this.norisService.processNorisTaxData(taxType, [mockTaxRecord], year)
  }

  async deleteTax({
    year,
    birthNumber,
    taxType,
    order,
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
        taxPayerId_year_type_order: {
          taxPayerId: taxPayer.id,
          year,
          type: taxType,
          order,
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
        taxPayerId_year_type_order: {
          taxPayerId: taxPayer.id,
          year,
          type: taxType,
          order,
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
        taxType,
        order,
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

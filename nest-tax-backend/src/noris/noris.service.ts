import { Injectable } from '@nestjs/common'

import {
  RequestPostNorisLoadDataDto,
  RequestPostNorisPaymentDataLoadByVariableSymbolsDto,
  RequestPostNorisPaymentDataLoadDto,
} from '../admin/dtos/requests.dto'
import {
  NorisPaymentsDto,
  NorisTaxPayersDto,
  NorisUpdateDto,
} from './noris.dto'
import { UpdateNorisDeliveryMethods } from './utils/noris.types'
import { NorisPaymentSubservice } from './subservices/noris-payment.subservice'
import { NorisTaxSubservice } from './subservices/noris-tax.subservice'
import { NorisDeliveryMethodSubservice } from './subservices/noris-delivery-method.subservice'
import { CreateBirthNumbersResponseDto } from '../admin/dtos/responses.dto'
import { TaxIdVariableSymbolYear } from '../utils/types/types.prisma'

@Injectable()
export class NorisService {
  constructor(
    private readonly paymentSubservice: NorisPaymentSubservice,
    private readonly taxSubservice: NorisTaxSubservice,
    private readonly deliverySubservice: NorisDeliveryMethodSubservice,
  ) {}

  async getTaxDataByYearAndBirthNumber(
    data: RequestPostNorisLoadDataDto,
  ): Promise<NorisTaxPayersDto[]> {
    return await this.taxSubservice.getTaxDataByYearAndBirthNumber(data)
  }

  async getPaymentDataFromNoris(data: RequestPostNorisPaymentDataLoadDto) {
    return await this.paymentSubservice.getPaymentDataFromNoris(data)
  }

  async getPaymentDataFromNorisByVariableSymbols(
    data: RequestPostNorisPaymentDataLoadByVariableSymbolsDto,
  ) {
    return await this.paymentSubservice.getPaymentDataFromNorisByVariableSymbols(
      data,
    )
  }

  async updateDeliveryMethods(
    data: UpdateNorisDeliveryMethods[],
  ): Promise<void> {
    return await this.deliverySubservice.updateDeliveryMethods(data)
  }

  async getDataForUpdate(
    variableSymbols: string[],
    years: number[],
  ): Promise<NorisUpdateDto[]> {
    return await this.taxSubservice.getDataForUpdate(variableSymbols, years)
  }

  async getAndProcessNewNorisTaxDataByBirthNumberAndYear(
    data: RequestPostNorisLoadDataDto,
  ): Promise<CreateBirthNumbersResponseDto> {
    return this.taxSubservice.getAndProcessNorisTaxDataByBirthNumberAndYear(
      data,
    )
  }

  async updatePaymentsFromNorisWithData(
    norisPaymentData: Partial<NorisPaymentsDto>[],
  ) {
    return await this.paymentSubservice.updatePaymentsFromNorisWithData(
      norisPaymentData,
    )
  }

  async processNorisTaxData(
    norisData: NorisTaxPayersDto[],
    year: number,
  ): Promise<string[]> {
    return await this.taxSubservice.processNorisTaxData(norisData, year)
  }

  async getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(
    data: RequestPostNorisLoadDataDto,
  ) {
    return await this.taxSubservice.getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(
      data,
    )
  }

  async updateTaxesFromNoris(taxes: TaxIdVariableSymbolYear[]) {
    return await this.taxSubservice.updateTaxesFromNoris(taxes)
  }
}

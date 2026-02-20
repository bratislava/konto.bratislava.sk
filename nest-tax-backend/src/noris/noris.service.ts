import { Injectable } from '@nestjs/common'

import { TaxType } from '../../prisma/generated/prisma/enums'
import {
  DateRangeDto,
  RequestPostNorisLoadDataOptionsDto,
  RequestPostNorisPaymentDataLoadByVariableSymbolsDto,
  RequestPostNorisPaymentDataLoadDto,
  RequestUpdateNorisDeliveryMethodsDto,
} from '../admin/dtos/requests.dto'
import { CreateBirthNumbersResponseDto } from '../admin/dtos/responses.dto'
import { ResponseCreatedAlreadyCreatedDto } from './dtos/response.dto'
import { NorisDeliveryMethodSubservice } from './subservices/noris-delivery-method.subservice'
import { NorisPaymentSubservice } from './subservices/noris-payment.subservice'
import { NorisTaxSubservice } from './subservices/noris-tax.subservice'
import { NorisTax, NorisTaxPayment } from './types/noris.types'

@Injectable()
export class NorisService {
  constructor(
    private readonly paymentSubservice: NorisPaymentSubservice,
    private readonly taxSubservice: NorisTaxSubservice,
    private readonly deliveryMethodSubservice: NorisDeliveryMethodSubservice,
  ) { }

  async getPaymentDataFromNoris(data: RequestPostNorisPaymentDataLoadDto) {
    return await this.paymentSubservice.getPaymentDataFromNoris(data)
  }

  async getPaymentDataFromNorisByVariableSymbols(
    data: RequestPostNorisPaymentDataLoadByVariableSymbolsDto,
  ) {
    return await this.paymentSubservice.getPaymentDataFromNorisByVariableSymbols(data)
  }

  async updateOverpaymentsDataFromNorisByDateRange(
    data: DateRangeDto,
    bloomreachSettings?: {
      suppressEmail?: boolean
    },
  ): Promise<ResponseCreatedAlreadyCreatedDto> {
    return await this.paymentSubservice.updateOverpaymentsDataFromNorisByDateRange(
      data,
      bloomreachSettings,
    )
  }

  async getAndProcessNewNorisTaxDataByBirthNumberAndYear(
    taxType: TaxType,
    year: number,
    birthNumbers: string[],
    options: RequestPostNorisLoadDataOptionsDto = {},
  ): Promise<CreateBirthNumbersResponseDto> {
    return await this.taxSubservice.getAndProcessNorisTaxDataByBirthNumberAndYear(
      taxType,
      year,
      birthNumbers,
      options,
    )
  }

  async updatePaymentsFromNorisWithData(
    norisPaymentData: NorisTaxPayment[],
  ): Promise<ResponseCreatedAlreadyCreatedDto> {
    return await this.paymentSubservice.updatePaymentsFromNorisWithData(
      norisPaymentData,
    )
  }

  async processNorisTaxData(
    taxType: TaxType,
    norisData: NorisTax[],
    year: number,
    options: RequestPostNorisLoadDataOptionsDto = {},
  ) {
    return await this.taxSubservice.processNorisTaxData(
      taxType,
      norisData,
      year,
      options,
    )
  }

  async getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(
    taxType: TaxType,
    year: number,
    birthNumbers: string[],
  ) {
    return await this.taxSubservice.getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(
      taxType,
      year,
      birthNumbers,
    )
  }

  async updateDeliveryMethodsInNoris({
    data,
  }: RequestUpdateNorisDeliveryMethodsDto) {
    return await this.deliveryMethodSubservice.updateDeliveryMethods({ data })
  }

  async removeDeliveryMethodsFromNoris(birthNumber: string): Promise<void> {
    await this.deliveryMethodSubservice.removeDeliveryMethodsFromNoris(
      birthNumber,
    )
  }
}

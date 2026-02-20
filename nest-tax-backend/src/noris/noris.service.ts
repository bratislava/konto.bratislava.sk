import { Injectable } from '@nestjs/common'
import { TaxType } from '@prisma/client'

import {
  DateRangeDto,
  RequestPostNorisLoadDataOptionsDto,
  RequestPostNorisPaymentDataLoadByVariableSymbolsDto,
  RequestPostNorisPaymentDataLoadDto,
  RequestUpdateNorisDeliveryMethodsDto,
} from '../admin/dtos/requests.dto.js'
import { CreateBirthNumbersResponseDto } from '../admin/dtos/responses.dto.js'
import { ResponseCreatedAlreadyCreatedDto } from './dtos/response.dto.js'
import { NorisDeliveryMethodSubservice } from './subservices/noris-delivery-method.subservice.js'
import { NorisPaymentSubservice } from './subservices/noris-payment.subservice.js'
import { NorisTaxSubservice } from './subservices/noris-tax.subservice.js'
import { NorisTax, NorisTaxPayment } from './types/noris.types.js'

@Injectable()
export class NorisService {
  constructor(
    private readonly paymentSubservice: NorisPaymentSubservice,
    private readonly taxSubservice: NorisTaxSubservice,
    private readonly deliveryMethodSubservice: NorisDeliveryMethodSubservice,
  ) {}

  async getPaymentDataFromNoris(data: RequestPostNorisPaymentDataLoadDto) {
    return this.paymentSubservice.getPaymentDataFromNoris(data)
  }

  async getPaymentDataFromNorisByVariableSymbols(
    data: RequestPostNorisPaymentDataLoadByVariableSymbolsDto,
  ) {
    return this.paymentSubservice.getPaymentDataFromNorisByVariableSymbols(data)
  }

  async updateOverpaymentsDataFromNorisByDateRange(
    data: DateRangeDto,
    bloomreachSettings?: {
      suppressEmail?: boolean
    },
  ): Promise<ResponseCreatedAlreadyCreatedDto> {
    return this.paymentSubservice.updateOverpaymentsDataFromNorisByDateRange(
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
    return this.taxSubservice.getAndProcessNorisTaxDataByBirthNumberAndYear(
      taxType,
      year,
      birthNumbers,
      options,
    )
  }

  async updatePaymentsFromNorisWithData(
    norisPaymentData: NorisTaxPayment[],
  ): Promise<ResponseCreatedAlreadyCreatedDto> {
    return this.paymentSubservice.updatePaymentsFromNorisWithData(
      norisPaymentData,
    )
  }

  async processNorisTaxData(
    taxType: TaxType,
    norisData: NorisTax[],
    year: number,
    options: RequestPostNorisLoadDataOptionsDto = {},
  ) {
    return this.taxSubservice.processNorisTaxData(
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
    return this.taxSubservice.getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(
      taxType,
      year,
      birthNumbers,
    )
  }

  async updateDeliveryMethodsInNoris({
    data,
  }: RequestUpdateNorisDeliveryMethodsDto) {
    return this.deliveryMethodSubservice.updateDeliveryMethods({ data })
  }

  async removeDeliveryMethodsFromNoris(birthNumber: string): Promise<void> {
    return this.deliveryMethodSubservice.removeDeliveryMethodsFromNoris(
      birthNumber,
    )
  }
}

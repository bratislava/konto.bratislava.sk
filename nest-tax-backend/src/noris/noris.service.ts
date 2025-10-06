import { Injectable } from '@nestjs/common'

import {
  RequestPostNorisLoadDataDto,
  RequestPostNorisPaymentDataLoadByVariableSymbolsDto,
  RequestPostNorisPaymentDataLoadDto,
  RequestUpdateNorisDeliveryMethodsDto,
} from '../admin/dtos/requests.dto'
import { CreateBirthNumbersResponseDto } from '../admin/dtos/responses.dto'
import { NorisPaymentsDto, NorisTaxPayersDto } from './noris.dto'
import { NorisDeliveryMethodSubservice } from './subservices/noris-delivery-method.subservice'
import { NorisPaymentSubservice } from './subservices/noris-payment.subservice'
import { NorisTaxSubservice } from './subservices/noris-tax.subservice'

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
    return this.paymentSubservice.updatePaymentsFromNorisWithData(
      norisPaymentData,
    )
  }

  async processNorisTaxData(
    norisData: NorisTaxPayersDto[],
    year: number,
  ): Promise<string[]> {
    return this.taxSubservice.processNorisTaxData(norisData, year)
  }

  async getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(
    data: RequestPostNorisLoadDataDto,
  ) {
    return this.taxSubservice.getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(
      data,
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

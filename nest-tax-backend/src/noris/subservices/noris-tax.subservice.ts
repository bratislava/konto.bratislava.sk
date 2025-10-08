import { Injectable } from '@nestjs/common'
import { TaxType } from '@prisma/client'

import { RequestPostNorisLoadDataDto } from '../../admin/dtos/requests.dto'
import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { NorisTaxPayersDto } from '../noris.dto'
import { NorisTaxCommunalWasteSubservice } from './noris-tax/noris-tax.communal-waste.subservice'
import { NorisTaxRealEstateSubservice } from './noris-tax/noris-tax.real-estate.subservice'
import { NorisTaxByType } from './noris-tax/noris-tax-by-type.interface'

@Injectable()
export class NorisTaxSubservice {
  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly norisTaxRealEstateSubservice: NorisTaxRealEstateSubservice,
    private readonly norisTaxCommunalWasteSubservice: NorisTaxCommunalWasteSubservice,
  ) {}

  private getImplementationByType(taxType: TaxType): NorisTaxByType {
    switch (taxType) {
      case TaxType.DZN:
        return this.norisTaxRealEstateSubservice

      case TaxType.KO:
        return this.norisTaxCommunalWasteSubservice

      default:
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          `Implementation for tax type ${taxType} not found`,
        )
    }
  }

  async processNorisTaxData(
    norisData: NorisTaxPayersDto[],
    year: number,
    taxType: TaxType,
  ): Promise<string[]> {
    return this.getImplementationByType(taxType).processNorisTaxData(
      norisData,
      year,
    )
  }

  async getAndProcessNorisTaxDataByBirthNumberAndYear(
    data: RequestPostNorisLoadDataDto,
  ) {
    return this.getImplementationByType(
      data.taxType,
    ).getAndProcessNorisTaxDataByBirthNumberAndYear(data)
  }

  async getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(
    data: RequestPostNorisLoadDataDto,
  ): Promise<{ updated: number }> {
    return this.getImplementationByType(
      data.taxType,
    ).getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(data)
  }
}

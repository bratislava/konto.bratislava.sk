import { Injectable } from '@nestjs/common'
import { TaxType } from '@prisma/client'

import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { NorisRealEstateTax } from '../types/noris.types'
import { NorisTaxCommunalWasteSubservice } from './noris-tax/noris-tax.communal-waste.subservice'
import { NorisTaxRealEstateSubservice } from './noris-tax/noris-tax.real-estate.subservice'
import { AbstractNorisTaxSubservice } from './noris-tax/noris-tax.subservice.abstract'

@Injectable()
export class NorisTaxSubservice {
  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly norisTaxRealEstateSubservice: NorisTaxRealEstateSubservice,
    private readonly norisTaxCommunalWasteSubservice: NorisTaxCommunalWasteSubservice,
  ) {}

  private getImplementationByType(
    taxType: TaxType,
  ): AbstractNorisTaxSubservice {
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
    taxType: TaxType,
    norisData: NorisRealEstateTax[],
    year: number,
  ): Promise<string[]> {
    return this.getImplementationByType(taxType).processNorisTaxData(
      norisData,
      year,
    )
  }

  async getAndProcessNorisTaxDataByBirthNumberAndYear(
    taxType: TaxType,
    year: number,
    birthNumbers: string[],
  ) {
    return this.getImplementationByType(
      taxType,
    ).getAndProcessNorisTaxDataByBirthNumberAndYear(year, birthNumbers)
  }

  async getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(
    taxType: TaxType,
    year: number,
    birthNumbers: string[],
  ): Promise<{ updated: number }> {
    return this.getImplementationByType(
      taxType,
    ).getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(
      year,
      birthNumbers,
    )
  }
}

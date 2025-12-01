import { Injectable } from '@nestjs/common'
import { TaxType } from '@prisma/client'

import { RequestPostNorisLoadDataOptionsDto } from '../../admin/dtos/requests.dto'
import { CreateBirthNumbersResponseDto } from '../../admin/dtos/responses.dto'
import { TaxTypeToNorisData } from '../../tax-definitions/taxDefinitionsTypes'
import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { NorisRealEstateTax } from '../types/noris.types'
import { NorisTaxCommunalWasteSubservice } from './noris-tax/noris-tax.communal-waste.subservice'
import { NorisTaxRealEstateSubservice } from './noris-tax/noris-tax.real-estate.subservice'

type TaxTypeToNorisSubservice = {
  [TaxType.DZN]: NorisTaxRealEstateSubservice
  [TaxType.KO]: NorisTaxCommunalWasteSubservice
}

@Injectable()
export class NorisTaxSubservice {
  private readonly subservices = {
    [TaxType.DZN]: this.norisTaxRealEstateSubservice,
    [TaxType.KO]: this.norisTaxCommunalWasteSubservice,
  } as const satisfies TaxTypeToNorisSubservice

  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly norisTaxRealEstateSubservice: NorisTaxRealEstateSubservice,
    private readonly norisTaxCommunalWasteSubservice: NorisTaxCommunalWasteSubservice,
  ) {}

  private getImplementationByType<TTaxType extends TaxType>(
    taxType: TTaxType,
  ): TaxTypeToNorisSubservice[TTaxType] {
    const service = this.subservices[taxType]
    if (!service) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        `Implementation for tax type ${taxType} not found`,
      )
    }
    return service
  }

  async processNorisTaxData<TTaxType extends TaxType>(
    taxType: TTaxType,
    norisData: TaxTypeToNorisData[TTaxType][],
    year: number,
    options: RequestPostNorisLoadDataOptionsDto = {},
  ): Promise<CreateBirthNumbersResponseDto> {
    // Use conditional branching to help TypeScript narrow types
    if (taxType === TaxType.DZN) {
      return this.subservices[TaxType.DZN].processNorisTaxData(
        norisData as NorisRealEstateTax[],
        year,
        options,
      )
    }

    if (taxType === TaxType.KO) {
      return this.subservices[TaxType.KO]
        .processNorisTaxData
        // norisData as NorisCommunalWasteTax[],
        // year,
        ()
    }

    // Fallback for exhaustiveness
    throw this.throwerErrorGuard.InternalServerErrorException(
      ErrorsEnum.INTERNAL_SERVER_ERROR,
      `Unknown tax type: ${taxType}`,
    )
  }

  async getAndProcessNorisTaxDataByBirthNumberAndYear(
    taxType: TaxType,
    year: number,
    birthNumbers: string[],
    options: RequestPostNorisLoadDataOptionsDto = {},
  ) {
    return this.getImplementationByType(
      taxType,
    ).getAndProcessNorisTaxDataByBirthNumberAndYear(year, birthNumbers, options)
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

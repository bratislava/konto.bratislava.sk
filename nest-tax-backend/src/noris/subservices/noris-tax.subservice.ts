import { Injectable } from '@nestjs/common'
import { TaxType } from '@prisma/client'
import { Request } from 'mssql'

import { RequestPostNorisLoadDataDto } from '../../admin/dtos/requests.dto'
import { PrismaService } from '../../prisma/prisma.service'
import { getTaxDefinitionByType } from '../../tax-definitions/getTaxDefinitionByType'
import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { TaxIdVariableSymbolYear } from '../../utils/types/types.prisma'
import { NorisTaxPayersDto, NorisUpdateDto } from '../noris.dto'
import { getNorisDataForUpdate } from '../utils/noris.queries'
import { NorisConnectionSubservice } from './noris-connection.subservice'
import { NorisTaxRealEstateSubservice } from './noris-tax/noris-tax.real-estate.subservice'
import { NorisTaxByType } from './noris-tax/noris-tax-by-type.interface'

@Injectable()
export class NorisTaxSubservice {
  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly connectionService: NorisConnectionSubservice,
    private readonly prismaService: PrismaService,
    private readonly norisTaxRealEstateSubservice: NorisTaxRealEstateSubservice,
  ) {}

  private getImplementationByType(taxType: TaxType): NorisTaxByType {
    // eslint-disable-next-line sonarjs/no-small-switch
    switch (taxType) {
      case TaxType.DZN:
        return this.norisTaxRealEstateSubservice

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

  async getRealEstateDataForUpdate(
    variableSymbols: string[],
    years: number[],
  ): Promise<NorisUpdateDto[]> {
    const connection = await this.connectionService.createOptimizedConnection()

    try {
      // Wait for connection to be fully established
      await this.connectionService.waitForConnection(connection)

      const request = new Request(connection)

      const variableSymbolsPlaceholders = variableSymbols
        .map((_, index) => `@variablesymbol${index}`)
        .join(',')
      variableSymbols.forEach((variableSymbol, index) => {
        request.input(`variablesymbol${index}`, variableSymbol)
      })

      const yearsPlaceholders = years
        .map((_, index) => `@year${index}`)
        .join(',')
      years.forEach((year, index) => {
        request.input(`year${index}`, year)
      })

      const queryWithPlaceholders = getNorisDataForUpdate
        .replaceAll('@variable_symbols', variableSymbolsPlaceholders)
        .replaceAll('@years', yearsPlaceholders)

      const norisData = await request.query(queryWithPlaceholders)
      return norisData.recordset
    } catch (error) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        `Failed to get data from Noris during tax update`,
        undefined,
        error instanceof Error ? undefined : <string>error,
        error instanceof Error ? error : undefined,
      )
    } finally {
      // Always close the connection
      await connection.close()
    }
  }

  async getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(
    data: RequestPostNorisLoadDataDto,
  ): Promise<{ updated: number }> {
    return this.getImplementationByType(
      data.taxType,
    ).getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(data)
  }

  async updateTaxesFromNoris(
    taxes: TaxIdVariableSymbolYear[],
    type: TaxType,
  ): Promise<void> {
    const variableSymbolToId = new Map(
      taxes.map((tax) => [tax.variableSymbol, tax.id]),
    )
    const variableSymbols = [...variableSymbolToId.keys()]
    const years = [...new Set(taxes.map((tax) => tax.year))]

    const taxDefinition = getTaxDefinitionByType(type)
    if (!taxDefinition) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        `Tax definition for tax type ${type} not found`,
      )
    }

    const data = await this[taxDefinition.getDataForUpdate](
      variableSymbols,
      years,
    )
    const variableSymbolsToNonNullDateFromNoris: Map<string, string> = new Map(
      data
        .filter((item) => item.datum_platnosti !== null)
        .map((item) => [
          item.variabilny_symbol,
          item.datum_platnosti as string,
        ]),
    )

    await this.prismaService.$transaction(
      [...variableSymbolsToNonNullDateFromNoris.entries()].map(
        ([variableSymbol, dateTaxRuling]) =>
          this.prismaService.tax.update({
            where: { id: variableSymbolToId.get(variableSymbol) },
            data: { dateTaxRuling },
          }),
      ),
    )
  }
}

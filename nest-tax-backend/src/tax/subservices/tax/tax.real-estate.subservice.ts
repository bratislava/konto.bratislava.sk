import { Injectable } from '@nestjs/common'
import { TaxType } from '@prisma/client'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import { PrismaService } from '../../../prisma/prisma.service'
import { getTaxDefinitionByType } from '../../../tax-definitions/getTaxDefinitionByType'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { QrCodeSubservice } from '../../../utils/subservices/qrcode.subservice'
import {
  ResponseInstallmentPaymentDetailDto,
  ResponseOneTimePaymentDetailsDto,
  ResponseTaxPayerReducedDto,
  ResponseTaxSummaryDetailDto,
} from '../../dtos/response.tax.dto'
import { getTaxStatus } from '../../utils/helpers/tax.helper'
import { getRealEstateTaxDetailPure } from '../../utils/unified-tax.util'
import {
  AbstractTaxSubservice,
  specificSymbol,
} from './tax.subservice.abstract'

dayjs.extend(utc)
dayjs.extend(timezone)

@Injectable()
export class TaxRealEstateSubservice extends AbstractTaxSubservice {
  constructor(
    throwerErrorGuard: ThrowerErrorGuard,
    prismaService: PrismaService,
    private readonly qrCodeSubservice: QrCodeSubservice,
  ) {
    const taxDefinition = getTaxDefinitionByType(TaxType.DZN)
    super(prismaService, throwerErrorGuard, taxDefinition)
  }

  async getTaxDetail(
    birthNumber: string,
    year: number,
    order: number,
  ): Promise<ResponseTaxSummaryDetailDto> {
    const today = dayjs().tz('Europe/Bratislava')

    const tax = await this.fetchTaxData(
      { birthNumber },
      {
        taxInstallments: true,
        taxPayer: {
          include: {
            taxAdministrator: true,
          },
        },
        taxDetails: true,
        taxPayments: true,
      },
      year,
      TaxType.DZN,
      order,
    )

    const detailWithoutQrCode = getRealEstateTaxDetailPure({
      taxYear: +year,
      today: today.toDate(),
      overallAmount: tax.amount,
      paymentCalendarThreshold: this.taxDefinition.paymentCalendarThreshold,
      variableSymbol: tax.variableSymbol,
      dateOfValidity: tax.dateTaxRuling,
      installments: tax.taxInstallments,
      taxDetails: tax.taxDetails,
      taxConstructions: tax.taxConstructions ?? 0,
      taxFlat: tax.taxFlat ?? 0,
      taxLand: tax.taxLand ?? 0,
      specificSymbol,
      taxPayments: tax.taxPayments,
    })

    let oneTimePaymentQrCode: string | undefined
    if (detailWithoutQrCode.oneTimePayment.qrCode) {
      oneTimePaymentQrCode = await this.qrCodeSubservice.createQrCode(
        detailWithoutQrCode.oneTimePayment.qrCode,
      )
    }
    const oneTimePayment: ResponseOneTimePaymentDetailsDto = {
      ...detailWithoutQrCode.oneTimePayment,
      qrCode: oneTimePaymentQrCode,
    }

    const installmentPayment: ResponseInstallmentPaymentDetailDto = {
      ...detailWithoutQrCode.installmentPayment,
      activeInstallment: detailWithoutQrCode.installmentPayment
        .activeInstallment
        ? {
            remainingAmount:
              detailWithoutQrCode.installmentPayment.activeInstallment
                .remainingAmount,
            variableSymbol:
              detailWithoutQrCode.installmentPayment.activeInstallment
                .variableSymbol,
            qrCode: await this.qrCodeSubservice.createQrCode(
              detailWithoutQrCode.installmentPayment.activeInstallment.qrCode,
            ),
          }
        : undefined,
    }

    const { taxAdministrator } = tax.taxPayer
    const taxPayer: ResponseTaxPayerReducedDto = {
      name: tax.taxPayer.name,
      permanentResidenceStreet: tax.taxPayer.permanentResidenceStreet,
      permanentResidenceZip: tax.taxPayer.permanentResidenceZip,
      permanentResidenceCity: tax.taxPayer.permanentResidenceCity,
      externalId: tax.taxPayer.externalId,
    }
    const paidStatus = getTaxStatus(
      detailWithoutQrCode.overallAmount,
      detailWithoutQrCode.overallPaid,
    )

    return {
      ...detailWithoutQrCode,
      year,
      paidStatus,
      oneTimePayment,
      installmentPayment,
      taxAdministrator,
      taxPayer,
    }
  }
}

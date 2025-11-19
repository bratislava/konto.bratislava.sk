import { Injectable } from '@nestjs/common'
import { TaxType } from '@prisma/client'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import { PrismaService } from '../../../prisma/prisma.service'
import { getTaxDefinitionByType } from '../../../tax-definitions/getTaxDefinitionByType'
import { ErrorsEnum } from '../../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { QrCodeSubservice } from '../../../utils/subservices/qrcode.subservice'
import {
  ResponseInstallmentPaymentDetailDto,
  ResponseOneTimePaymentDetailsDto,
  ResponseRealEstateTaxSummaryDetailDto,
  ResponseTaxPayerReducedDto,
} from '../../dtos/response.tax.dto'
import { getTaxStatus } from '../../utils/helpers/tax.helper'
import { getTaxDetailPure } from '../../utils/unified-tax.util'
import {
  AbstractTaxSubservice,
  specificSymbol,
} from './tax.subservice.abstract'

dayjs.extend(utc)
dayjs.extend(timezone)

@Injectable()
export class TaxRealEstateSubservice extends AbstractTaxSubservice<
  typeof TaxType.DZN
> {
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
  ): Promise<ResponseRealEstateTaxSummaryDetailDto> {
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

    if (tax.taxDetails.type !== TaxType.DZN) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        `Tax details type is not DZN: ${tax.taxDetails.type}`,
      )
    }

    const detailWithoutQrCode = getTaxDetailPure({
      type: TaxType.DZN,
      taxYear: +year,
      today: today.toDate(),
      overallAmount: tax.amount,
      paymentCalendarThreshold: this.taxDefinition.paymentCalendarThreshold,
      variableSymbol: tax.variableSymbol,
      dateOfValidity: tax.dateTaxRuling,
      installments: tax.taxInstallments,
      taxDetails: tax.taxDetails,
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
      order,
      type: 'REAL_ESTATE',
      paidStatus,
      oneTimePayment,
      installmentPayment,
      taxAdministrator,
      taxPayer,
    }
  }
}

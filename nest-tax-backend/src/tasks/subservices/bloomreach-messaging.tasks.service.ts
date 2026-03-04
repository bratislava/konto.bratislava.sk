import { Injectable, Logger } from '@nestjs/common'
import { DeliveryMethodNamed, PaymentStatus } from '@prisma/client'
import dayjs from 'dayjs'
import pLimit from 'p-limit'

import { BloomreachService } from '../../bloomreach/bloomreach.service'
import { PaymentService } from '../../payment/payment.service'
import { PrismaService } from '../../prisma/prisma.service'
import { CityAccountSubservice } from '../../utils/subservices/cityaccount.subservice'
import { TaxPaymentWithTaxAndTaxPayer } from '../../utils/types/types.prisma'

@Injectable()
export default class BloomreachMessagingTasksService {
  private readonly logger: Logger

  constructor(
    private readonly prismaService: PrismaService,
    private readonly bloomreachService: BloomreachService,
    private readonly cityAccountSubservice: CityAccountSubservice,
    private readonly paymentService: PaymentService,
  ) {
    this.logger = new Logger(BloomreachMessagingTasksService.name)
  }

  async sendUnpaidTaxReminders() {
    const FIFTEEN_DAYS_AGO = dayjs().subtract(15, 'day').toDate()
    const taxes = await this.prismaService.tax.findMany({
      select: {
        id: true,
        year: true,
        type: true,
        order: true,
        taxPayer: {
          select: {
            birthNumber: true,
          },
        },
      },
      where: {
        bloomreachUnpaidTaxReminderSent: false,
        isCancelled: false,
        taxPayments: {
          none: {
            status: PaymentStatus.SUCCESS,
          },
        },
        OR: [
          {
            deliveryMethod: DeliveryMethodNamed.CITY_ACCOUNT,
            createdAt: {
              lte: FIFTEEN_DAYS_AGO,
            },
          },
          {
            deliveryMethod: {
              not: DeliveryMethodNamed.CITY_ACCOUNT,
            },
            dateTaxRuling: {
              lte: FIFTEEN_DAYS_AGO,
            },
          },
          {
            deliveryMethod: null,
            dateTaxRuling: {
              lte: FIFTEEN_DAYS_AGO,
            },
          },
        ],
      },
      // need to spread this because of getUserDataAdminBatch will timeout if used on 700 records
      // 50 * 6 * 24 h = 7200 is max number of konto visitors in dayhours
      take: 50,
    })

    if (taxes.length === 0) {
      return
    }
    this.logger.log(
      `TasksService: Sending unpaid tax reminder events for taxes: ${JSON.stringify(
        taxes.map((tax) => ({
          id: tax.id,
        })),
      )}`,
    )

    const userDataFromCityAccount =
      await this.cityAccountSubservice.getUserDataAdminBatch(
        taxes.map((taxData) => taxData.taxPayer.birthNumber),
      )

    await Promise.all(
      taxes.map(async (tax) => {
        const userFromCityAccount =
          userDataFromCityAccount[tax.taxPayer.birthNumber] || null
        if (userFromCityAccount && userFromCityAccount.externalId) {
          await this.bloomreachService.trackEventUnpaidTaxReminder(
            { year: tax.year, tax_type: tax.type, order: tax.order! },
            userFromCityAccount.externalId,
          )
        }
      }),
    )

    await this.prismaService.tax.updateMany({
      where: {
        id: {
          in: taxes.map((tax) => tax.id),
        },
      },
      data: {
        bloomreachUnpaidTaxReminderSent: true,
      },
    })
  }

  async resendBloomreachEvents() {
    this.logger.log('Starting resendBloomreachEvents task')
    const payments = await this.prismaService.taxPayment.findMany({
      where: {
        status: PaymentStatus.SUCCESS,
        bloomreachEventSent: false,
      },
      include: {
        tax: {
          include: {
            taxPayer: true,
          },
        },
      },
    })

    if (payments.length === 0) {
      this.logger.log('No payments to resend bloomreach events for')
      return
    }

    const concurrency = Number(process.env.DB_CONCURRENCY ?? 10)
    const concurrencyLimit = pLimit(concurrency)

    const userDataFromCityAccount =
      await this.cityAccountSubservice.getUserDataAdminBatch(
        payments.map((payment) => payment.tax.taxPayer.birthNumber),
      )

    const trackPaymentWithConcurrencyLimit = async (
      payment: TaxPaymentWithTaxAndTaxPayer,
    ): Promise<boolean> => {
      try {
        await concurrencyLimit(async () => {
          const userFromCityAccount =
            userDataFromCityAccount[payment.tax.taxPayer.birthNumber] || null
          await this.paymentService.trackPaymentInBloomreach(
            payment,
            userFromCityAccount?.externalId ?? undefined,
          )
        })
        return true
      } catch (error) {
        // Throwing would cause the whole task to fail, so we just log the error
        this.logger.error(error)
        return false
      }
    }

    const results = await Promise.all(
      payments.map(async (payment) => {
        const success = await trackPaymentWithConcurrencyLimit(payment)
        return success
      }),
    )

    this.logger.log(
      `TasksService: Resent ${results.filter(Boolean).length} bloomreach payment events. Failed to resend ${results.filter((result) => !result).length} bloomreach payment events.`,
    )
  }
}

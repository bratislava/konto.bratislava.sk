import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { RequestUpdateNorisDeliveryMethodsDtoDataValue } from 'openapi-clients/tax'
import { ACTIVE_USER_FILTER, PrismaService } from '../../prisma/prisma.service'
import { GdprCategory, GdprSubType, GdprType } from '../../user/dtos/gdpr.user.dto'
import { addSlashToBirthNumber } from '../birthNumbers'
import { getTaxDeadlineDate } from '../constants/tax-deadline'
import HandleErrors from '../decorators/errorHandler.decorators'
import { ErrorsEnum, ErrorsResponseEnum } from '../guards/dtos/error.dto'
import ThrowerErrorGuard from '../guards/errors.guard'
import { DeliveryMethod } from '../types/tax.types'
import { LineLoggerSubservice } from './line-logger.subservice'
import { TaxSubservice } from './tax.subservice'
import { DeliveryMethodEnum } from '@prisma/client'
import { SubserviceErrorsEnum, SubserviceErrorsResponseEnum } from './subservice.errors.enum'

const UPLOAD_BIRTHNUMBERS_BATCH = 100
const UPLOAD_TAX_DELIVERY_METHOD_BATCH = 100

@Injectable()
export class TasksSubservice {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly prisma: PrismaService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly taxSubservice: TaxSubservice
  ) {
    this.logger = new LineLoggerSubservice(TasksSubservice.name)
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  @HandleErrors('Cron Error')
  async deleteOldUserVerificationData() {
    const today = new Date()
    const oneMonthAgo = new Date(today.setMonth(today.getMonth() - 1))

    await this.prisma.userIdCardVerify.deleteMany({
      where: {
        verifyStart: {
          lt: oneMonthAgo,
        },
      },
    })

    await this.prisma.legalPersonIcoIdCardVerify.deleteMany({
      where: {
        verifyStart: {
          lt: oneMonthAgo,
        },
      },
    })
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  @HandleErrors('Cron Error')
  async loadTaxesForUsers() {
    this.logger.log('Starting loadTaxesForUsers task')

    const year = new Date().getFullYear()
    const birthNumbersFromDb = await this.prisma.user.findMany({
      select: {
        birthNumber: true,
      },
      where: {
        birthNumber: {
          not: null,
        },
        OR: [{ lastTaxYear: null }, { lastTaxYear: { not: year } }],
        ...ACTIVE_USER_FILTER,
      },
      orderBy: {
        lastTaxBackendUploadTry: 'asc',
      },
      take: UPLOAD_BIRTHNUMBERS_BATCH,
    })
    const birthNumbers = birthNumbersFromDb
      .map((birthNumberFromDb) => birthNumberFromDb.birthNumber)
      .filter((item): item is string => item !== null)
      .map(addSlashToBirthNumber)

    if (birthNumbers.length === 0) {
      return
    }

    this.logger.log(`Found ${birthNumbers.length} birth numbers to be added to tax backend.`)

    const result = await this.taxSubservice.loadDataFromNoris({ year, birthNumbers })
    const addedBirthNumbers = result.data.birthNumbers.map((birthNumber) =>
      birthNumber.replaceAll('/', '')
    )

    this.logger.log(
      `${addedBirthNumbers.length} birth numbers are successfully added to tax backend.`
    )

    // Mark birth numbers which are in tax backend.
    await this.prisma.user.updateMany({
      where: {
        birthNumber: {
          in: addedBirthNumbers,
        },
        ...ACTIVE_USER_FILTER,
      },
      data: {
        lastTaxYear: year,
      },
    })

    // Set current datetime as the last try for the upload of the birth number to tax backend.
    await this.prisma.user.updateMany({
      where: {
        birthNumber: {
          in: birthNumbers.map((birthNumber) => birthNumber.replaceAll('/', '')),
        },
      },
      data: {
        lastTaxBackendUploadTry: new Date(),
      },
    })
  }

  mapToNorisDeliveryMethod(deliveryMethodEnum: DeliveryMethodEnum | null): DeliveryMethod {
    const deliveryMethodMap: Record<DeliveryMethodEnum, DeliveryMethod> = {
      [DeliveryMethodEnum.CITY_ACCOUNT]: DeliveryMethod.CITY_ACCOUNT,
      [DeliveryMethodEnum.EDESK]: DeliveryMethod.EDESK,
      [DeliveryMethodEnum.POSTAL]: DeliveryMethod.POSTAL,
    }

    return (deliveryMethodEnum && deliveryMethodMap[deliveryMethodEnum]) || DeliveryMethod.POSTAL
  }

  @Cron('*/5 * 2-30 4 *') // Every 5 minutes in April, starting from 2nd.
  @HandleErrors('Cron Error')
  async updateDeliveryMethodsInNoris() {
    const currentYear = new Date().getFullYear()
    const taxDeadlineDate = getTaxDeadlineDate()

    const users = await this.prisma.user.findMany({
      where: {
        birthNumber: {
          not: null,
        },
        taxDeliveryMethodAtLockDate: {
          not: null,
        },
        OR: [
          {
            lastTaxDeliveryMethodsUpdateYear: {
              not: currentYear,
            },
          },
          {
            lastTaxDeliveryMethodsUpdateYear: null,
          },
        ],
        lastVerificationIdentityCard: {
          not: null,
          lt: taxDeadlineDate,
        },
        ...ACTIVE_USER_FILTER,
      },
      select: {
        id: true,
        birthNumber: true,
        taxDeliveryMethodAtLockDate: true,
        taxDeliveryMethodCityAccountDate: true,
      },
      take: UPLOAD_TAX_DELIVERY_METHOD_BATCH,
    })

    if (users.length === 0) {
      return
    }

    const data = users.reduce<{ [key: string]: RequestUpdateNorisDeliveryMethodsDtoDataValue }>(
      (acc, user) => {
        // We know that birthNumber is not null from the query.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const birthNumber: string = user.birthNumber!
        const deliveryMethod = this.mapToNorisDeliveryMethod(user.taxDeliveryMethodAtLockDate)
        const date: string | undefined = user.taxDeliveryMethodCityAccountDate
          ? user.taxDeliveryMethodCityAccountDate.toISOString().substring(0, 10)
          : undefined
        if (date) {
          acc[birthNumber] = { deliveryMethod, date }
        } else {
          if (deliveryMethod === DeliveryMethod.CITY_ACCOUNT) {
            throw this.throwerErrorGuard.InternalServerErrorException(
              SubserviceErrorsEnum.CITY_ACCOUNT_DELIVERY_METHOD_WITHOUT_DATE,
              SubserviceErrorsResponseEnum.CITY_ACCOUNT_DELIVERY_METHOD_WITHOUT_DATE,
              undefined,
              user
            )
          }

          acc[birthNumber] = { deliveryMethod }
        }
        return acc
      },
      {}
    )

    await this.taxSubservice.updateDeliveryMethodsInNoris({ data })

    // Now we should check if some user was not deactivated during his update in Noris.
    // This would be a problem, since if we update the delivery method in Noris after removing the delivery method, we should manually remove them. However, it is an edge case.
    const deactivated = await this.prisma.user.findMany({
      select: {
        id: true,
      },
      where: {
        id: {
          in: users.map((user) => user.id),
        },
        birthNumber: null,
      },
    })
    // If someone was deactivated we should log the error with their birth numbers.
    if (deactivated.length > 0) {
      const deactivatedIds = deactivated.map((user) => user.id)
      const birthNumbersOfDeactivateUsers = users
        .filter((user) => deactivatedIds.includes(user.id))
        .map((user) => user.birthNumber)
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        ErrorsResponseEnum.INTERNAL_SERVER_ERROR,
        `Some users were deactivated during the update of the delivery methods in Noris. Their birth numbers are: ${birthNumbersOfDeactivateUsers.join(
          ', '
        )}. Remove their delivery methods in Noris manually.`
      )
    }

    // If OK we should set the Users to have updated delivery methods in Noris for current year. Otherwise, the error will be thrown.
    await this.prisma.user.updateMany({
      where: {
        id: {
          in: users.map((user) => user.id),
        },
      },
      data: {
        lastTaxDeliveryMethodsUpdateYear: currentYear,
      },
    })
  }

  @Cron('0 0 1 4 *')
  @HandleErrors('Cron')
  async lockDeliveryMethods(): Promise<void> {
    const users = await this.prisma.user.findMany({
      where: {
        cognitoTier: 'IDENTITY_CARD',
        birthNumber: { not: null },
      },
      include: {
        userGdprData: {
          orderBy: {
            createdAt: 'desc',
          },
          where: {
            category: GdprCategory.TAXES,
            type: GdprType.FORMAL_COMMUNICATION,
          },
          take: 1,
          select: {
            subType: true,
            createdAt: true,
          },
        },
        physicalEntity: {
          select: {
            activeEdesk: true,
          },
        },
      },
    })

    const data = users.map((user) => {
      // We know that birthNumber is not null from the query.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const birthNumber: string = user.birthNumber!

      if (user.physicalEntity?.activeEdesk) {
        return { birthNumber, deliveryMethod: DeliveryMethodEnum.EDESK, date: undefined }
      }
      if (user.userGdprData?.[0]?.subType === GdprSubType.SUB) {
        return {
          birthNumber,
          deliveryMethod: DeliveryMethodEnum.CITY_ACCOUNT,
          date: user.userGdprData[0].createdAt,
        }
      }
      return { birthNumber, deliveryMethod: DeliveryMethodEnum.POSTAL, date: undefined }
    }, {})
    this.logger.log(JSON.stringify(data, null, 2))

    const updatePromises = data.map((entry) => {
      return this.prisma.user.update({
        where: { birthNumber: entry.birthNumber },
        data: {
          taxDeliveryMethodAtLockDate: entry.deliveryMethod,
          taxDeliveryMethodCityAccountDate: entry.date,
        },
      })
    })

    await Promise.all(updatePromises)
  }
}

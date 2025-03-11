import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { RequestUpdateNorisDeliveryMethodsDtoDataValue } from '../../generated-clients/nest-tax-backend'
import { PrismaService } from '../../prisma/prisma.service'
import { GdprCategory, GdprSubType, GdprType } from '../../user/dtos/gdpr.user.dto'
import { addSlashToBirthNumber } from '../birthNumbers'
import { getTaxDeadlineDate } from '../constants/tax-deadline'
import { HandleErrors } from '../decorators/errorHandler.decorators'
import { ErrorsEnum, ErrorsResponseEnum } from '../guards/dtos/error.dto'
import ThrowerErrorGuard from '../guards/errors.guard'
import { DeliveryMethod } from '../types/tax.types'
import { LineLoggerSubservice } from './line-logger.subservice'
import { TaxSubservice } from './tax.subservice'

const UPLOAD_BIRTHNUMBERS_BATCH = 200
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

  @Cron(CronExpression.EVERY_30_MINUTES)
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
      `${addedBirthNumbers.length} birth numbers are succesfully added to tax backend.`
    )

    // Mark birth numbers which are in tax backend.
    await this.prisma.user.updateMany({
      where: {
        birthNumber: {
          in: addedBirthNumbers,
        },
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

  // @Cron('*/5 * 2-31 4-5 *') // Every 5 minutes from April to May, starting from 2nd. TODO put back after testing
  @Cron('*/5 * 2-31 3-5 *')
  @HandleErrors('Cron Error')
  async updateDeliveryMethodsInNoris() {
    if (process.env.UPDATE_DELIVERY_METHODS_IN_NORIS !== 'true') {
      return
    }
    const currentYear = new Date().getFullYear()
    const taxDeadlineDate = getTaxDeadlineDate()

    const users = await this.prisma.user.findMany({
      where: {
        birthNumber: {
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
      },
      include: {
        userGdprData: {
          orderBy: {
            createdAt: 'desc',
          },
          where: {
            category: GdprCategory.TAXES,
            type: GdprType.FORMAL_COMMUNICATION,
            createdAt: {
              lt: taxDeadlineDate,
            },
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

        if (user.physicalEntity?.activeEdesk) {
          acc[birthNumber] = { deliveryMethod: DeliveryMethod.EDESK }
          return acc
        }
        if (user.userGdprData?.[0]?.subType === GdprSubType.SUB) {
          acc[birthNumber] = {
            deliveryMethod: DeliveryMethod.CITY_ACCOUNT,
            date: user.userGdprData[0].createdAt.toISOString().slice(0, 10),
          }
          return acc
        }
        acc[birthNumber] = { deliveryMethod: DeliveryMethod.POSTAL }
        return acc
      },
      {}
    )

    await this.taxSubservice.updateDeliveryMethodsInNoris({ data })

    // Now we should check if some user was not deactivated during his update in Noris.
    // This would be a problem, since if we update the delivery method in Noris after removing the delivery method, we should manually remove them. However it is an edge case.
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

    // If OK we should set the Users to have updated delivery methods in Noris for current year. Otherwise the error will be thrown.
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
}

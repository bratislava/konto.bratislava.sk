// TODO - communication state to LEGAL_ENTITY
import { Injectable } from '@nestjs/common'

import {
  GdprDataDto,
  RequestPublicSubscriptionDto,
  ResponsePublicUnsubscribeDto,
  ResponseUserDataBasicDto,
  ResponseUserDataDto,
} from './dtos/gdpr.user.dto'

import { BloomreachService } from '../bloomreach/bloomreach.service'
import { PrismaService } from '../prisma/prisma.service'
import { UserErrorsEnum, UserErrorsResponseEnum } from './user.error.enum'
import { getTaxDeadlineDate } from '../utils/constants/tax-deadline'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import {
  ResponseLegalPersonDataDto,
  ResponseLegalPersonDataSimpleDto,
} from './dtos/gdpr.legalperson.dto'
import { DatabaseSubserviceUser } from './utils/subservice/database.subservice'
import { DeliveryMethodActiveAndLockedDto } from './dtos/deliveryMethod.dto'
import { GDPRSubTypeEnum } from '@prisma/client'

@Injectable()
export class UserService {
  constructor(
    private databaseSubservice: DatabaseSubserviceUser,
    private prisma: PrismaService,
    private throwerErrorGuard: ThrowerErrorGuard,
    private bloomreachService: BloomreachService
  ) {}

  private verificationDeadline(verificationDate: Date | null): boolean {
    const verificationDeadlineDate = getTaxDeadlineDate()
    if (verificationDate === null) {
      return false
    }
    return verificationDate < verificationDeadlineDate
  }

  async getOrCreateUserData(id: string, email: string): Promise<ResponseUserDataDto> {
    const user = await this.databaseSubservice.getOrCreateUser(id, email)
    const officialCorrespondenceChannel =
      await this.databaseSubservice.getOfficialCorrespondenceChannel(user.id)
    const showEmailCommunicationBanner =
      await this.databaseSubservice.getShowEmailCommunicationBanner(user.id)
    const getGdprData = await this.databaseSubservice.getUserGdprData(user.id)
    return {
      ...user,
      wasVerifiedBeforeTaxDeadline: this.verificationDeadline(user.lastVerificationIdentityCard),
      officialCorrespondenceChannel,
      showEmailCommunicationBanner,
      gdprData: getGdprData,
    }
  }

  async getOrCreateLegalPersonData(id: string, email: string): Promise<ResponseLegalPersonDataDto> {
    const user = await this.databaseSubservice.getOrCreateLegalPerson(id, email)
    const getGdprData = await this.databaseSubservice.getLegalPersonGdprData(user.id)
    return { ...user, gdprData: getGdprData }
  }

  async removeBirthNumber(id: string): Promise<ResponseUserDataDto> {
    const user = await this.databaseSubservice.removeBirthNumber(id)
    const officialCorrespondenceChannel =
      await this.databaseSubservice.getOfficialCorrespondenceChannel(user.id)
    const showEmailCommunicationBanner =
      await this.databaseSubservice.getShowEmailCommunicationBanner(user.id)
    const getGdprData = await this.databaseSubservice.getUserGdprData(user.id)
    return {
      ...user,
      wasVerifiedBeforeTaxDeadline: this.verificationDeadline(user.lastVerificationIdentityCard),
      officialCorrespondenceChannel,
      showEmailCommunicationBanner,
      gdprData: getGdprData,
    }
  }

  async removeLegalPersonBirthNumber(id: string) {
    const user = await this.databaseSubservice.removeLegalPersonBirthNumber(id)
    const getGdprData = await this.databaseSubservice.getUserGdprData(user.id)
    return {
      ...user,
      wasVerifiedBeforeTaxDeadline: false, // TODO add this for legal persons
      officialCorrespondenceChannel: null,
      gdprData: getGdprData,
      showEmailCommunicationBanner: false, // TODO add this for legal persons
    }
  }

  async subUnsubUser(
    externalId: string,
    gdprSubType: GDPRSubTypeEnum,
    email: string,
    gdprData: GdprDataDto[]
  ): Promise<ResponseUserDataDto> {
    const user = await this.databaseSubservice.getOrCreateUser(externalId, email)
    await this.databaseSubservice.changeUserGdprData(
      user.id,
      gdprData.map((elem) => ({ ...elem, subType: gdprSubType }))
    )
    // This is intentional not await, we don't want to wait for bloomreach integration if there will be error.
    // If there is error it isn't blocker for futher process.
    // TODO Data will be also uploaded from database to bloomreach every day.
    this.bloomreachService.trackEventConsent(gdprSubType, gdprData, user.externalId)
    const officialCorrespondenceChannel =
      await this.databaseSubservice.getOfficialCorrespondenceChannel(user.id)
    const showEmailCommunicationBanner =
      await this.databaseSubservice.getShowEmailCommunicationBanner(user.id)
    const getGdprData = await this.databaseSubservice.getUserGdprData(user.id)
    return {
      ...user,
      wasVerifiedBeforeTaxDeadline: this.verificationDeadline(user.lastVerificationIdentityCard),
      officialCorrespondenceChannel,
      showEmailCommunicationBanner,
      gdprData: getGdprData,
    }
  }

  async subUnsubLegalPerson(
    externalId: string,
    gdprSubType: GDPRSubTypeEnum,
    email: string,
    gdprData: GdprDataDto[]
  ): Promise<ResponseLegalPersonDataDto> {
    const user = await this.databaseSubservice.getOrCreateLegalPerson(externalId, email)
    await this.databaseSubservice.changeLegalPersonGdprData(
      user.id,
      gdprData.map((elem) => ({
        ...elem,
        subType: gdprSubType,
      }))
    )
    const getGdprData = await this.databaseSubservice.getLegalPersonGdprData(user.id)
    return { ...user, gdprData: getGdprData }
  }

  async subscribePublicUser(data: RequestPublicSubscriptionDto): Promise<ResponseUserDataDto> {
    const user = await this.databaseSubservice.getOrCreateUser(null, data.email)
    await this.databaseSubservice.changeUserGdprData(
      user.id,
      data.gdprData.map((elem) => ({ ...elem, subType: GDPRSubTypeEnum.subscribe }))
    )
    // This is intentional not await, we don't want to wait for bloomreach integration if there will be error.
    // If there is error it isn't blocker for futher process.
    // TODO Data will be also uploaded from database to bloomreach every day.
    this.bloomreachService.trackEventConsent(
      GDPRSubTypeEnum.subscribe,
      data.gdprData,
      user.externalId
    )
    const officialCorrespondenceChannel =
      await this.databaseSubservice.getOfficialCorrespondenceChannel(user.id)
    const showEmailCommunicationBanner =
      await this.databaseSubservice.getShowEmailCommunicationBanner(user.id)
    const getGdprData = await this.databaseSubservice.getUserGdprData(user.id)
    return {
      ...user,
      wasVerifiedBeforeTaxDeadline: this.verificationDeadline(user.lastVerificationIdentityCard),
      officialCorrespondenceChannel,
      showEmailCommunicationBanner,
      gdprData: getGdprData,
    }
  }

  async unsubscribePublicUser(
    id: string,
    gdprData: GdprDataDto[]
  ): Promise<ResponsePublicUnsubscribeDto> {
    await this.databaseSubservice.changeUserGdprData(
      id,
      gdprData.map((elem) => ({ ...elem, subType: GDPRSubTypeEnum.unsubscribe }))
    )
    const getGdprData = await this.databaseSubservice.getUserGdprData(id)
    const user = await this.databaseSubservice.getUserById(id)
    if (!user) {
      throw this.throwerErrorGuard.NotFoundException(
        UserErrorsEnum.USER_NOT_FOUND,
        UserErrorsResponseEnum.USER_NOT_FOUND
      )
    }
    // This is intentional not await, we don't want to wait for bloomreach integration if there will be error.
    // If there is error it isn't blocker for futher process.
    // TODO Data will be also uploaded from database to bloomreach every day.
    this.bloomreachService.trackEventConsent(GDPRSubTypeEnum.unsubscribe, gdprData, user.externalId)
    return { id: id, message: 'user was unsubscribed', gdprData: getGdprData, userData: user }
  }

  async unsubscribePublicUserByExternalId(
    externalId: string,
    gdprData: GdprDataDto[]
  ): Promise<ResponsePublicUnsubscribeDto> {
    const user = await this.databaseSubservice.getUserByExternalId(externalId)
    if (user) {
      const data = await this.unsubscribePublicUser(user.id, gdprData)
      return data
    }
    throw this.throwerErrorGuard.NotFoundException(
      UserErrorsEnum.USER_NOT_FOUND,
      UserErrorsResponseEnum.USER_NOT_FOUND
    )
  }

  async changeUserEmail(id: string, newEmail: string): Promise<ResponseUserDataBasicDto> {
    try {
      const user = await this.prisma.user.update({
        where: {
          externalId: id,
        },
        data: {
          email: newEmail,
        },
      })
      const officialCorrespondenceChannel =
        await this.databaseSubservice.getOfficialCorrespondenceChannel(user.id)
      const showEmailCommunicationBanner =
        await this.databaseSubservice.getShowEmailCommunicationBanner(user.id)
      return {
        ...user,
        wasVerifiedBeforeTaxDeadline: this.verificationDeadline(user.lastVerificationIdentityCard),
        officialCorrespondenceChannel,
        showEmailCommunicationBanner,
      }
    } catch (error) {
      throw this.throwerErrorGuard.NotFoundException(
        UserErrorsEnum.USER_NOT_FOUND,
        UserErrorsResponseEnum.USER_NOT_FOUND,
        undefined,
        error
      )
    }
  }

  async changeLegalPersonEmail(
    id: string,
    newEmail: string
  ): Promise<ResponseLegalPersonDataSimpleDto> {
    try {
      const user = await this.prisma.legalPerson.update({
        where: {
          externalId: id,
        },
        data: {
          email: newEmail,
        },
      })

      return user
    } catch (error) {
      throw this.throwerErrorGuard.NotFoundException(
        UserErrorsEnum.USER_NOT_FOUND,
        UserErrorsResponseEnum.USER_NOT_FOUND,
        undefined,
        error
      )
    }
  }

  async getDeliveryMethodsWithDateByBirthNumber(
    birthNumber: string
  ): Promise<DeliveryMethodActiveAndLockedDto> {
    return this.databaseSubservice.getActiveAndLockedDeliveryMethodsWithDates({ birthNumber })
  }
}

// TODO - communication state to LEGAL_ENTITY
import { Injectable } from '@nestjs/common'

import {
  GdprDataDto,
  GdprSubType,
  RequestPublicSubscriptionDto,
  ResponsePublicUnsubscribeDto,
  ResponseUserDataBasicDto,
  ResponseUserDataDto,
} from './dtos/gdpr.user.dto'

import { BloomreachService } from '../bloomreach/bloomreach.service'
import { PrismaService } from '../prisma/prisma.service'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import {
  ResponseLegalPersonDataDto,
  ResponseLegalPersonDataSimpleDto,
} from './dtos/gdpr.legalperson.dto'
import { DatabaseSubserviceUser } from './utils/subservice/database.subservice'
import { UserErrorsEnum, UserErrorsResponseEnum } from '../user/user.error.enum'

@Injectable()
export class UserService {
  constructor(
    private databaseSubservice: DatabaseSubserviceUser,
    private prisma: PrismaService,
    private throwerErrorGuard: ThrowerErrorGuard,
    private bloomreachService: BloomreachService
  ) {}

  private verificationDeadline(verificationDate: Date | null): boolean {
    try {
      if (verificationDate === null) {
        return false
      }
      // This date is variable every year, maybe do it by config?
      const year = new Date().getFullYear()
      if (verificationDate < new Date(`${year}-04-24`)) {
        return true
      }
      return false
    } catch (error) {
      return false
    }
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
    id: string,
    gdprSubType: GdprSubType,
    email: string,
    gdprData: GdprDataDto[]
  ): Promise<ResponseUserDataDto> {
    const user = await this.databaseSubservice.getOrCreateUser(id, email)
    await this.databaseSubservice.createUserGdprData(user.id, gdprSubType, gdprData)
    // this is attentional not await, we don't want to wait for bloomreach integration if there will be error. Data will be also integrated every day for updated from database
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
    id: string,
    gdprSubType: GdprSubType | null,
    email: string,
    gdprData?: GdprDataDto[]
  ): Promise<ResponseLegalPersonDataDto> {
    const user = await this.databaseSubservice.getOrCreateLegalPerson(id, email)
    await this.databaseSubservice.createLegalPersonGdprData(user.id, gdprSubType, gdprData)
    const getGdprData = await this.databaseSubservice.getLegalPersonGdprData(user.id)
    return { ...user, gdprData: getGdprData }
  }

  async subscribePublicUser(data: RequestPublicSubscriptionDto): Promise<ResponseUserDataDto> {
    const user = await this.databaseSubservice.getOrCreateUser(null, data.email)
    await this.databaseSubservice.createUserGdprData(user.id, GdprSubType.SUB, data.gdprData)
    // this is attentional not await, we don't want to wait for bloomreach integration if there will be error. Data will be also integrated every day for updated from database
    this.bloomreachService.trackEventConsent(GdprSubType.SUB, data.gdprData, user.externalId)
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
    await this.databaseSubservice.createUserGdprData(id, GdprSubType.UNSUB, gdprData)
    const getGdprData = await this.databaseSubservice.getUserGdprData(id)
    const user = await this.databaseSubservice.getUserById(id)
    if (!user) {
      throw this.throwerErrorGuard.NotFoundException(
        UserErrorsEnum.USER_NOT_FOUND,
        UserErrorsResponseEnum.USER_NOT_FOUND
      )
    }
    // this is attentional not await, we don't want to wait for bloomreach integration if there will be error. Data will be also integrated every day for updated from database
    this.bloomreachService.trackEventConsent(GdprSubType.UNSUB, gdprData, user.externalId)
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
        UserErrorsResponseEnum.USER_NOT_FOUND
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
        UserErrorsResponseEnum.USER_NOT_FOUND
      )
    }
  }
}
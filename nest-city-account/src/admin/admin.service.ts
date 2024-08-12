/* eslint-disable import/no-extraneous-dependencies */
import { HttpException, Injectable } from '@nestjs/common'
import { CognitoUserAttributesTierEnum, LegalPerson, User } from '@prisma/client'
import _ from 'lodash'
import { PhysicalEntityService } from 'src/physical-entity/physical-entity.service'
import { UpvsIdentity } from 'src/upvs-identity-by-uri/dtos/upvsSchema'
import { UpvsIdentityByUriService, UpvsIdentityByUriServiceCreateManyParam } from 'src/upvs-identity-by-uri/upvs-identity-by-uri.service'
import { BloomreachService } from '../bloomreach/bloomreach.service'
import { PrismaService } from '../prisma/prisma.service'
import { DatabaseSubserviceUser } from '../user-verification/utils/subservice/database.subservice'
import { decryptData } from '../utils/crypto'
import {
  CognitoUserAccountTypesEnum,
  CognitoUserAttributesEnum
} from '../utils/global-dtos/cognito.dto'
import { COGNITO_TYPE_ERROR } from '../utils/guards/dtos/error.dto'
import { ErrorThrowerGuard } from '../utils/guards/errors.guard'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { ManuallyVerifyUserRequestDto } from './dtos/requests.admin.dto'
import {
  DeactivateAccountResponseDto,
  OnlySuccessDto,
  ResponseUserByBirthNumberDto,
  UserVerifyState,
  VerificationDataForUserResponseDto,
} from './dtos/responses.admin.dto'
import { removeLegalPersonDataFromDatabase, removeUserDataFromDatabase } from './utils/account-deactivate.utils'

@Injectable()
export class AdminService {
  constructor(
    private databaseSubservice: DatabaseSubserviceUser,
    private cognitoSubservice: CognitoSubservice,
    private errorThrowerGuard: ErrorThrowerGuard,
    private prismaService: PrismaService,
    private readonly upvsIdentityByUriService: UpvsIdentityByUriService,
    private physicalEntityService: PhysicalEntityService,
    private readonly bloomreachService: BloomreachService
  ) {}

  async getUserDataByBirthNumber(birthNumber: string): Promise<ResponseUserByBirthNumberDto> {
    const user = await this.databaseSubservice.getUserByBirthNumber(birthNumber)
    if (!user) {
      throw this.errorThrowerGuard.adminDatabaseBirthNumberNotFound()
    }
    let cognitoUser = {}
    if (user.externalId) {
      try {
        cognitoUser = await this.cognitoSubservice.getDataFromCognito(user.externalId)
      } catch (error) {}
    }
    return {
      email: user.email,
      birthNumber: user.birthNumber,
      externalId: user.externalId,
      userAttribute: user.userAttribute,
      cognitoAttributes: cognitoUser,
    }
  }

  async checkUserVerifyState(email: string): Promise<UserVerifyState> {
    const result: UserVerifyState = {
      isInDatabase: false,
      isInCognito: false,
      cognitoTier: CognitoUserAttributesTierEnum.NEW,
      isVerified: false,
    }

    // Try if this is legal person. If yes go to legal person state.
    const legalPerson = await this.prismaService.legalPerson.findUnique({
      where: {
        email,
      },
    })
    if (legalPerson !== null) {
      return this.checkLegalPersonVerifyState(email)
    }

    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    })
    if (user !== null) {
      result.isInDatabase = true

      if (user.birthnumberAlreadyExistsLast)
        result.birthNumberAlreadyExists = user.birthnumberAlreadyExistsLast
      result.externalId = user.externalId

      if (user.externalId) {
        try {
          const cognitoUser = await this.cognitoSubservice.getDataFromCognito(user.externalId)
          result.isInCognito = true
          result.cognitoTier = cognitoUser['custom:tier']
          result.type = cognitoUser['custom:account_type']

          if (
            result.cognitoTier === CognitoUserAttributesTierEnum.EID ||
            result.cognitoTier === CognitoUserAttributesTierEnum.IDENTITY_CARD
          ) {
            result.isVerified = true
          }
        } catch (error) {
          result.isInCognito = false
        }
      }
    }

    return result
  }

  async checkLegalPersonVerifyState(email: string): Promise<UserVerifyState> {
    const result: UserVerifyState = {
      isInDatabase: false,
      isInCognito: false,
      cognitoTier: CognitoUserAttributesTierEnum.NEW,
      isVerified: false,
    }

    const legalPerson = await this.prismaService.legalPerson.findUnique({
      where: {
        email,
      },
    })
    if (legalPerson !== null) {
      result.isInDatabase = true

      if (legalPerson.birthnumberIcoAlreadyExistsLast)
        result.birthNumberIcoAlreadyExists = legalPerson.birthnumberIcoAlreadyExistsLast
      result.externalId = legalPerson.externalId

      if (legalPerson.externalId) {
        try {
          const cognitoUser = await this.cognitoSubservice.getDataFromCognito(
            legalPerson.externalId
          )
          result.isInCognito = true
          result.cognitoTier = cognitoUser['custom:tier']
          result.type = cognitoUser['custom:account_type']

          if (
            result.cognitoTier === CognitoUserAttributesTierEnum.EID ||
            result.cognitoTier === CognitoUserAttributesTierEnum.IDENTITY_CARD
          ) {
            result.isVerified = true
          }
        } catch (error) {
          result.isInCognito = false
        }
      }
    }

    return result
  }

  async deactivateAccount(externalId: string): Promise<DeactivateAccountResponseDto> {
    const cognitoUser = await this.cognitoSubservice.getDataFromCognito(externalId)
    await this.cognitoSubservice.cognitoDeactivateUser(externalId)
    await this.cognitoSubservice.deactivateCognitoMail(externalId, cognitoUser.email)

    // We also need to change the account to unverified, since we delete birthNumber from database
    await this.cognitoSubservice.changeCognitoTierAndInDatabase(externalId, CognitoUserAttributesTierEnum.NEW, cognitoUser['custom:account_type'])

    if (
      cognitoUser[CognitoUserAttributesEnum.ACCOUNT_TYPE] === CognitoUserAccountTypesEnum.PHYSICAL_ENTITY
    ) {
      await removeUserDataFromDatabase(this.prismaService, externalId)
    } else if (
      cognitoUser[CognitoUserAttributesEnum.ACCOUNT_TYPE] === CognitoUserAccountTypesEnum.LEGAL_ENTITY ||
      cognitoUser[CognitoUserAttributesEnum.ACCOUNT_TYPE] === CognitoUserAccountTypesEnum.SELF_EMPLOYED_ENTITY
    ) {
      await removeLegalPersonDataFromDatabase(this.prismaService, externalId)
    } else {
      throw new HttpException(COGNITO_TYPE_ERROR, 422)
    }

    const bloomreachRemovedStatus = await this.bloomreachService.anonymizeCustomer(externalId)

    return { success: true, bloomreachRemovedStatus }
  }

  async getVerificationDataForUser(email: string): Promise<VerificationDataForUserResponseDto> {
    const legalPerson = await this.prismaService.legalPerson.findUnique({
      where: {
        email,
      },
    })
    if (legalPerson) {
      return this.getVerificationDataForLegalPerson(legalPerson)
    }

    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    })

    if (!user) {
      throw this.errorThrowerGuard.userOrLegalPersonNotFound()
    }

    const verifyData = await this.prismaService.userIdCardVerify.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        verifyStart: 'desc',
      },
    })
    const verifyDataDecrypted = verifyData.map((record) => ({
      ...record,
      idCard: decryptData(record.idCard),
      birthNumber: decryptData(record.birthNumber),
    }))

    return {
      externalId: user.externalId,
      email,
      verificationDataLastMonth: verifyDataDecrypted,
    }
  }

  async getVerificationDataForLegalPerson(
    legalPerson: LegalPerson
  ): Promise<VerificationDataForUserResponseDto> {
    const verifyData = await this.prismaService.legalPersonIcoIdCardVerify.findMany({
      where: {
        legalPersonId: legalPerson.id,
      },
      orderBy: {
        verifyStart: 'desc',
      },
    })
    const verifyDataDecrypted = verifyData.map((record) => ({
      ...record,
      idCard: decryptData(record.idCard),
      birthNumber: decryptData(record.birthNumber),
      ico: decryptData(record.ico),
      userId: record.legalPersonId,
      legalPersonId: undefined,
    }))

    return {
      externalId: legalPerson.externalId,
      email: legalPerson.email,
      verificationDataLastMonth: verifyDataDecrypted,
    }
  }

  async manuallyVerifyUser(
    email: string,
    data: ManuallyVerifyUserRequestDto
  ): Promise<OnlySuccessDto> {
    let isLegalPerson = true
    let user: LegalPerson | User | null = await this.prismaService.legalPerson.findUnique({
      where: {
        email,
      },
    })
    if (!user) {
      isLegalPerson = false
      user = await this.prismaService.user.findUnique({
        where: {
          email,
        },
      })
    }
    if (!user) {
      throw this.errorThrowerGuard.userOrLegalPersonNotFound()
    }

    if (!user.externalId) {
      throw this.errorThrowerGuard.userOrLegalPersonNoExternalId()
    }

    // Update the database
    if (isLegalPerson) {
      if (!data.ico) {
        throw this.errorThrowerGuard.icoNotProvided()
      }

      await this.prismaService.legalPerson.update({
        where: {
          email,
        },
        data: {
          ico: data.ico,
          birthNumber: data.birthNumber,
          lastVerificationAttempt: new Date(),
        },
      })
    } else {
      if (!data.ifo) {
        throw this.errorThrowerGuard.ifoNotProvided()
      }

      await this.prismaService.user.update({
        where: {
          email,
        },
        data: {
          ifo: data.ifo,
          birthNumber: data.birthNumber,
          lastVerificationIdentityCard: new Date(),
        },
      })
    }

    // Update cognito
    const cognitoUser = await this.cognitoSubservice.getDataFromCognito(user.externalId)
    await this.cognitoSubservice.changeCognitoTierAndInDatabase(user.externalId, CognitoUserAttributesTierEnum.IDENTITY_CARD, cognitoUser['custom:account_type'])

    return { success: true }
  }

  async validateEdeskWithUriFromCognito(offset: number) {
    const physicalEntitiesWithoutUriVerificationAttempts =
      await this.prismaService.physicalEntity.findMany({
        where: { userId: { not: null }, uri: null, UpvsIdentityByUri: { none: {} } },
        take: 100,
        skip: offset,
      })

    const physicalEntitiesByBirthNumber = _.keyBy(
      physicalEntitiesWithoutUriVerificationAttempts,
      'birthNumber'
    )
    const physicalEntitiesByUserId = _.keyBy(
      physicalEntitiesWithoutUriVerificationAttempts,
      'userId'
    )

    if (
      Object.values(physicalEntitiesByBirthNumber).length !==
      physicalEntitiesWithoutUriVerificationAttempts.length
    ) {
      throw this.errorThrowerGuard.databaseError('Duplicate birth numbers in this batch, aborting')
    }

    const users = await this.prismaService.user.findMany({
      where: {
        id: {
          in: physicalEntitiesWithoutUriVerificationAttempts.map(
            (physicalEntity) => physicalEntity.userId
          ).filter((id) => id !== null) as string[],
        },
        externalId: {
          not: null
        }
      },
    })

    const cognitoUsers = await Promise.all(
      users.map((user) => {
        if (!user.externalId) {
          throw this.errorThrowerGuard.userOrLegalPersonNoExternalId()
        }
        return this.cognitoSubservice.getDataFromCognito(user.externalId).catch((e) => undefined)
      })
    )
    const usersMappedToTheirPhysicalEntities = users.map(
      (user) => physicalEntitiesByUserId[user.id]
    )
    const dbAndCognitoData = _.zip(usersMappedToTheirPhysicalEntities, cognitoUsers)
    const upvsIdentityByUriData = dbAndCognitoData
      .map(([dbData, cognitoData]) => {
        if (!cognitoData?.family_name || !cognitoData?.given_name) return null
        const processedFamilyName = cognitoData?.family_name
          .replace(/,.*/, '')
          .trim()
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .toLowerCase()
        const processedGivenName = cognitoData?.given_name
          .replace(/,.*/, '')
          .trim()
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .toLowerCase()
        const processedBirthNumber = dbData?.birthNumber?.replaceAll('/', '')
        return {
          physicalEntityId: dbData?.id,
          uri: `rc://sk/${processedBirthNumber}_${processedFamilyName}_${processedGivenName}`,
        }
      })
      .filter((data) => data !== null)
      .filter(_.identity) as UpvsIdentityByUriServiceCreateManyParam

    // TODO move this into physicalEntityService function and call that from here
    const result = await this.upvsIdentityByUriService.createMany(upvsIdentityByUriData)
    for (const success of result.success) {
      if (!success.physicalEntityId) continue
      await this.physicalEntityService.update({
        id: success.physicalEntityId,
        uri: success.uri,
        activeEdesk: (success.data as UpvsIdentity)?.upvs?.edesk_status === 'deliverable',
      })
    }

    return {
      validatedUsers: result.success.length,
      entities: result,
    }
  }
}

/* eslint-disable import/no-extraneous-dependencies */
import { Injectable } from '@nestjs/common'
import { CognitoUserAttributesTierEnum, LegalPerson, User } from '@prisma/client'
import _ from 'lodash'
import { PhysicalEntityService } from 'src/physical-entity/physical-entity.service'
import {
  UpvsIdentityByUriService,
  UpvsIdentityByUriServiceCreateManyParam,
} from 'src/upvs-identity-by-uri/upvs-identity-by-uri.service'
import { BloomreachService } from '../bloomreach/bloomreach.service'
import { ACTIVE_USER_FILTER, PrismaService } from '../prisma/prisma.service'
import {
  VerificationErrorsEnum,
  VerificationErrorsResponseEnum,
} from '../user-verification/verification.errors.enum'
import { UserErrorsEnum, UserErrorsResponseEnum } from '../user/user.error.enum'
import { decryptData } from '../utils/crypto'
import {
  CognitoUserAccountTypesEnum,
  CognitoUserAttributesEnum,
} from '../utils/global-dtos/cognito.dto'
import { ErrorsEnum, ErrorsResponseEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { TaxSubservice } from '../utils/subservices/tax.subservice'
import { AdminErrorsEnum, AdminErrorsResponseEnum } from './admin.errors.enum'
import { ManuallyVerifyUserRequestDto } from './dtos/requests.admin.dto'
import {
  DeactivateAccountResponseDto,
  GetNewVerifiedUsersBirthNumbersResponseDto,
  MarkDeceasedAccountResponseDto,
  OnlySuccessDto,
  ResponseUserByBirthNumberDto,
  UserVerifyState,
  VerificationDataForUserResponseDto,
} from './dtos/responses.admin.dto'
import {
  removeLegalPersonDataFromDatabase,
  removeUserDataFromDatabase,
} from './utils/account-deactivate.utils'
import { AnonymizeResponse } from '../bloomreach/bloomreach.dto'
import { UserService } from '../user/user.service'
import { COGNITO_SYNC_CONFIG_DB_KEY } from './utils/constants'
import { toLogfmt } from '../utils/logging'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { CustomErrorAdminTypesEnum, CustomErrorAdminTypesResponseEnum } from './dtos/error.dto'

const USER_REQUEST_LIMIT = 100

@Injectable()
export class AdminService {
  private readonly logger: LineLoggerSubservice = new LineLoggerSubservice(AdminService.name)

  constructor(
    private cognitoSubservice: CognitoSubservice,
    private throwerErrorGuard: ThrowerErrorGuard,
    private prismaService: PrismaService,
    private readonly upvsIdentityByUriService: UpvsIdentityByUriService,
    private physicalEntityService: PhysicalEntityService,
    private readonly bloomreachService: BloomreachService,
    private readonly taxSubservice: TaxSubservice,
    private readonly userService: UserService
  ) {}

  async getUserDataByBirthNumber(birthNumber: string): Promise<ResponseUserByBirthNumberDto> {
    const user = await this.prismaService.user.findUnique({
      where: { birthNumber, ...ACTIVE_USER_FILTER },
    })
    if (!user) {
      throw this.throwerErrorGuard.NotFoundException(
        AdminErrorsEnum.BIRTH_NUMBER_NOT_FOUND,
        AdminErrorsResponseEnum.BIRTH_NUMBER_NOT_FOUND
      )
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
      taxDeliveryMethodAtLockDate: user.taxDeliveryMethodAtLockDate,
    }
  }

  /**
   * Similar to function getUserDataByBirthNumber, returns data about users based on their birth number, but instead of separately, it does it in batch in one request.
   * @param birthNumbers Array of birth numbers without slash, for which users should be retrieved from database.
   * @returns A map of birth numbers (those which were found in database) to user information.
   */
  async getUsersDataByBirthNumbers(
    birthNumbers: string[]
  ): Promise<Record<string, ResponseUserByBirthNumberDto>> {
    const users = await this.prismaService.user.findMany({
      where: {
        birthNumber: {
          in: birthNumbers,
        },
        ...ACTIVE_USER_FILTER,
      },
    })
    const result: Record<string, ResponseUserByBirthNumberDto> = {}

    for (const user of users) {
      if (!user.birthNumber) {
        continue
      }
      let cognitoUser = {}
      if (user.externalId) {
        try {
          cognitoUser = await this.cognitoSubservice.getDataFromCognito(user.externalId)
        } catch (error) {}
      }

      result[user.birthNumber] = {
        email: user.email,
        birthNumber: user.birthNumber,
        externalId: user.externalId,
        userAttribute: user.userAttribute,
        cognitoAttributes: cognitoUser,
        taxDeliveryMethodAtLockDate: user.taxDeliveryMethodAtLockDate,
      }
    }

    return result
  }

  /**
   * Activates Cron job for sync of cognito users to db.
   * @returns void
   */
  async activateSyncCognitoToDb(): Promise<void> {
    await this.prismaService.config.update({
      where: { key: COGNITO_SYNC_CONFIG_DB_KEY },
      data: { value: { active: true } },
    })
  }

  /**
   * Gets all users from cognito and calls getOrCreate for each user.
   * @returns void
   */
  async syncCognitoToDb(): Promise<void> {
    const cognitoUsers = await this.cognitoSubservice.getAllCognitoUsers()
    if (!cognitoUsers) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        UserErrorsEnum.COGNITO_TYPE_ERROR,
        UserErrorsResponseEnum.COGNITO_TYPE_ERROR
      )
    }

    for (const user of cognitoUsers) {
      const accountType = user[CognitoUserAttributesEnum.ACCOUNT_TYPE]
      if (!accountType || !user.sub || !user.email) {
        throw this.throwerErrorGuard.UnprocessableEntityException(
          UserErrorsEnum.COGNITO_TYPE_ERROR,
          UserErrorsResponseEnum.COGNITO_TYPE_ERROR,
          toLogfmt(user)
        )
      }
      try {
        await this.userService.getOrCreateUserOrLegalPersonRaw(user)
      } catch (error) {
        this.logger.error(error)
      }
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
        ...ACTIVE_USER_FILTER,
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
    await this.cognitoSubservice.changeTier(
      externalId,
      CognitoUserAttributesTierEnum.NEW,
      cognitoUser['custom:account_type']
    )
    await this.bloomreachService.trackCustomer(externalId)

    let removedUser: User | null = null
    if (
      cognitoUser[CognitoUserAttributesEnum.ACCOUNT_TYPE] ===
      CognitoUserAccountTypesEnum.PHYSICAL_ENTITY
    ) {
      removedUser = await removeUserDataFromDatabase(this.prismaService, externalId)
    } else if (
      cognitoUser[CognitoUserAttributesEnum.ACCOUNT_TYPE] ===
        CognitoUserAccountTypesEnum.LEGAL_ENTITY ||
      cognitoUser[CognitoUserAttributesEnum.ACCOUNT_TYPE] ===
        CognitoUserAccountTypesEnum.SELF_EMPLOYED_ENTITY
    ) {
      await removeLegalPersonDataFromDatabase(this.prismaService, externalId)
    } else {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        UserErrorsEnum.COGNITO_TYPE_ERROR,
        UserErrorsResponseEnum.COGNITO_TYPE_ERROR
      )
    }

    const bloomreachRemoved = await this.bloomreachService.anonymizeCustomer(externalId)

    const taxDeliveryMethodsRemoved =
      removedUser && removedUser.birthNumber
        ? await this.taxSubservice.removeDeliveryMethodFromNoris(removedUser.birthNumber)
        : true

    return { success: true, bloomreachRemoved, taxDeliveryMethodsRemoved }
  }

  async markAccountsAsDeceased(birthNumberList: string[]): Promise<MarkDeceasedAccountResponseDto> {
    const users = await this.prismaService.user.updateManyAndReturn({
      where: {
        birthNumber: {
          in: birthNumberList,
        },
        ...ACTIVE_USER_FILTER,
      },
      data: {
        isDeceased: true,
        markedDeceasedAt: new Date(),
      },
      select: {
        externalId: true,
        birthNumber: true,
        email: true,
      },
    })

    const foundResults: {
      birthNumber: string
      databaseMarked: boolean
      cognitoArchived: boolean
      bloomreachRemoved?: AnonymizeResponse
    }[] = await Promise.all(
      users.map(async (item) => {
        if (!item.externalId || !item.email) {
          return { birthNumber: item.birthNumber!, databaseMarked: true, cognitoArchived: false }
        }

        let cognitoSuccess = true
        try {
          await this.cognitoSubservice.cognitoDeactivateUser(item.externalId)
        } catch (error) {
          cognitoSuccess = false
        }

        const bloomreachRemoved = await this.bloomreachService.anonymizeCustomer(item.externalId)
        return {
          birthNumber: item.birthNumber!,
          databaseMarked: true,
          cognitoArchived: cognitoSuccess,
          bloomreachRemoved,
        }
      })
    )

    const foundBirthNumbers = users.map((user) => user.birthNumber!)

    const notFoundBirthNumbers = birthNumberList.filter(
      (birthNumber) => !foundBirthNumbers.includes(birthNumber)
    )

    const notFoundResults = notFoundBirthNumbers.map((birthNumber) => ({
      birthNumber,
      databaseMarked: false,
      cognitoArchived: false,
    }))

    return { results: [...foundResults, ...notFoundResults] }
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
        ...ACTIVE_USER_FILTER,
      },
    })

    if (!user) {
      throw this.throwerErrorGuard.NotFoundException(
        UserErrorsEnum.USER_NOT_FOUND,
        UserErrorsResponseEnum.USER_NOT_FOUND
      )
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
          ...ACTIVE_USER_FILTER,
        },
      })
    }
    if (!user) {
      throw this.throwerErrorGuard.NotFoundException(
        UserErrorsEnum.USER_NOT_FOUND,
        UserErrorsResponseEnum.USER_NOT_FOUND
      )
    }

    if (!user.externalId) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        UserErrorsEnum.NO_EXTERNAL_ID,
        UserErrorsResponseEnum.NO_EXTERNAL_ID
      )
    }

    // Update the database
    if (isLegalPerson) {
      if (!data.ico) {
        throw this.throwerErrorGuard.BadRequestException(
          VerificationErrorsEnum.ICO_NOT_PROVIDED,
          VerificationErrorsResponseEnum.ICO_NOT_PROVIDED
        )
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
        throw this.throwerErrorGuard.BadRequestException(
          VerificationErrorsEnum.IFO_NOT_PROVIDED,
          VerificationErrorsResponseEnum.IFO_NOT_PROVIDED
        )
      }

      await this.prismaService.user.update({
        where: {
          email,
          ...ACTIVE_USER_FILTER,
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
    await this.cognitoSubservice.changeTier(
      user.externalId,
      CognitoUserAttributesTierEnum.IDENTITY_CARD,
      cognitoUser['custom:account_type']
    )
    await this.bloomreachService.trackCustomer(user.externalId)

    return { success: true }
  }

  async validateEdeskWithUriFromCognito(offset: number) {
    const physicalEntitiesWithoutUriVerificationAttempts =
      await this.prismaService.physicalEntity.findMany({
        where: {
          userId: { not: null },
          uri: null,
          activeEdeskUpdatedAt: null,
          activeEdeskUpdateFailCount: 0,
          activeEdeskUpdateFailedAt: null,
        },
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
      throw this.throwerErrorGuard.UnprocessableEntityException(
        ErrorsEnum.DATABASE_ERROR,
        ErrorsResponseEnum.DATABASE_ERROR,
        'Duplicate birth numbers in this batch, aborting'
      )
    }

    const users = await this.prismaService.user.findMany({
      where: {
        id: {
          in: physicalEntitiesWithoutUriVerificationAttempts
            .map((physicalEntity) => physicalEntity.userId)
            .filter((id) => id !== null) as string[],
        },
        externalId: {
          not: null,
        },
        ...ACTIVE_USER_FILTER,
      },
    })

    const cognitoUsers = await Promise.all(
      users.map((user) => {
        if (!user.externalId) {
          throw this.throwerErrorGuard.UnprocessableEntityException(
            UserErrorsEnum.NO_EXTERNAL_ID,
            UserErrorsResponseEnum.NO_EXTERNAL_ID
          )
        }
        return this.cognitoSubservice.getDataFromCognito(user.externalId).catch(() => undefined)
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
        activeEdesk: success.data.upvs?.edesk_status === 'deliverable',
      })
    }

    return {
      validatedUsers: result.success.length,
      entities: result,
    }
  }

  async getNewVerifiedUsersBirthNumbers(
    since: Date,
    take?: number
  ): Promise<GetNewVerifiedUsersBirthNumbersResponseDto> {
    // Take one more, so that we can return nextSince for the next user
    // We can't do date+1, because two users can have the same timestamp
    // This should be sufficient, if we do not expect 100+ users with the same timestamp
    const limitedTake = Math.min(take ?? USER_REQUEST_LIMIT, USER_REQUEST_LIMIT) + 1
    const users = await this.prismaService.user.findMany({
      select: {
        birthNumber: true,
        lastVerificationIdentityCard: true,
      },
      where: {
        lastVerificationIdentityCard: { gte: since },
        birthNumber: {
          not: null,
        },
        ...ACTIVE_USER_FILTER,
      },
      orderBy: {
        lastVerificationIdentityCard: 'asc',
      },
      take: limitedTake,
    })

    if (
      users.length === limitedTake &&
      limitedTake >= 2 &&
      users[0].lastVerificationIdentityCard?.getTime() ===
        users[users.length - 1].lastVerificationIdentityCard?.getTime()
    ) {
      // If this happens because of manual edit in the database, please add random jitter to the dates
      throw this.throwerErrorGuard.InternalServerErrorException(
        CustomErrorAdminTypesEnum.TOO_MANY_USERS_VERIFIED_WITH_THE_SAME_TIMESTAMP,
        CustomErrorAdminTypesResponseEnum.TOO_MANY_USERS_VERIFIED_WITH_THE_SAME_TIMESTAMP
      )
    }

    const lastVerify = users.at(-1)?.lastVerificationIdentityCard
    // Default: no users -> return request timestamp
    let nextSince: Date = since
    if (users.length > 0) {
      if (users.length < limitedTake) {
        // End of list for now, advance timestamp one millisecond
        nextSince = new Date(lastVerify!.getTime() + 1)
      } else {
        // Last entry is one over take. We want to return the timestamp of this
        // entry for the next call, but not the entry itself
        nextSince = lastVerify!
        users.pop()
      }
    }

    const birthNumbers = users.map((user) => user.birthNumber!)

    return { birthNumbers, nextSince }
  }
}

import {
  CatchDatabaseError,
  ErrorFactoryService,
  HasErrorFactoryService,
} from '@bratislava/log-nest'
import { Injectable } from '@nestjs/common'

import { LegalPersonAccount, User } from '../../../generated/prisma/client'
import {
  CompanyIdentity,
  LegalPersonService,
  RepresentativeIdentity,
} from '../../../legal-person/legal-person.service'
import { ACTIVE_USER_FILTER, PrismaService } from '../../../prisma/prisma.service'
import { CognitoGetUserData } from '../../../utils/global-dtos/cognito.dto'
import { VerificationReturnType } from '../../types'
import { VerificationErrorsEnum } from '../../verification.errors.enum'

@Injectable()
export class VerificationDataSubservice implements HasErrorFactoryService {
  constructor(
    private prisma: PrismaService,
    private readonly legalPersonService: LegalPersonService,
    public readonly errorFactoryService: ErrorFactoryService
  ) {}

  @CatchDatabaseError()
  async findUserByEmailOrExternalId(email: string, externalId: string): Promise<User | null> {
    let user: User | null
    user = await this.prisma.user.findUnique({
      where: {
        email,
        ...ACTIVE_USER_FILTER,
      },
    })
    if (!user) {
      user = await this.prisma.user.findUnique({
        where: {
          externalId,
          ...ACTIVE_USER_FILTER,
        },
      })
    }
    return user
  }

  @CatchDatabaseError()
  async findLegalPersonByEmailOrExternalId(
    email: string,
    externalId: string
  ): Promise<LegalPersonAccount | null> {
    let legalPerson: LegalPersonAccount | null
    legalPerson = await this.prisma.legalPersonAccount.findUnique({
      where: {
        email,
      },
    })
    if (!legalPerson) {
      legalPerson = await this.prisma.legalPersonAccount.findUnique({
        where: {
          externalId,
        },
      })
    }
    return legalPerson
  }

  @CatchDatabaseError()
  async checkAndCreateUserIfoAndBirthNumber(
    cognitoUser: CognitoGetUserData,
    ifo: string | null,
    birthNumber: string,
    oldMagproxyDatabase: number
  ): Promise<VerificationReturnType> {
    const checkUser = await this.prisma.user.findUnique({
      where: {
        birthNumber,
      },
    })
    const user = await this.findUserByEmailOrExternalId(cognitoUser.email, cognitoUser.idUser)

    // TODO this is a weird situation. We should look more into this.
    if (checkUser && user && checkUser.externalId !== cognitoUser.idUser) {
      await this.prisma.user.update({
        where: {
          id: user.id,
          ...ACTIVE_USER_FILTER,
        },
        data: {
          lastVerificationIdentityCard: new Date(),
          oldMagproxyDatabase: {
            increment: oldMagproxyDatabase,
          },
          birthnumberAlreadyExistsCounter: {
            increment: 1,
          },
          birthnumberAlreadyExistsLast: birthNumber,
          externalId: cognitoUser.idUser,
        },
      })
      return { success: false, reason: VerificationErrorsEnum.BIRTHNUMBER_IFO_DUPLICITY }
    }

    if (checkUser && !user && checkUser.externalId !== cognitoUser.idUser) {
      await this.prisma.user.create({
        data: {
          externalId: cognitoUser.idUser,
          lastVerificationIdentityCard: new Date(),
          birthnumberAlreadyExistsCounter: 1,
          birthnumberAlreadyExistsLast: birthNumber,
          email: cognitoUser.email,
        },
      })
      return { success: false, reason: VerificationErrorsEnum.BIRTHNUMBER_IFO_DUPLICITY }
    }

    if (user) {
      await this.prisma.user.update({
        where: {
          id: user.id,
          ...ACTIVE_USER_FILTER,
        },
        data: {
          ifo,
          birthNumber,
          lastVerificationIdentityCard: new Date(),
          externalId: cognitoUser.idUser,
          oldMagproxyDatabase: {
            increment: oldMagproxyDatabase,
          },
        },
      })
      return { success: true }
    }

    await this.prisma.user.create({
      data: {
        externalId: cognitoUser.idUser,
        ifo,
        lastVerificationIdentityCard: new Date(),
        birthNumber,
        email: cognitoUser.email,
      },
    })
    return { success: true }
  }

  @CatchDatabaseError()
  async checkAndCreateLegalPersonIcoAndBirthNumber(
    cognitoUser: CognitoGetUserData,
    company: CompanyIdentity,
    representative: RepresentativeIdentity
  ): Promise<VerificationReturnType> {
    const { ico } = company
    const { birthNumber } = representative
    const checkUser = await this.legalPersonService.findAccountByCompanyAndRepresentative(
      ico,
      birthNumber
    )
    const legalPerson = await this.findLegalPersonByEmailOrExternalId(
      cognitoUser.email,
      cognitoUser.idUser
    )

    // TODO this is a weird situation. We should look more into this.
    if (checkUser && legalPerson && checkUser.externalId !== cognitoUser.idUser) {
      await this.prisma.legalPersonAccount.update({
        where: {
          id: legalPerson.id,
        },
        data: {
          lastVerificationAttempt: new Date(),
          birthnumberIcoAlreadyExistsCounter: {
            increment: 1,
          },
          birthnumberIcoAlreadyExistsLast: `${birthNumber}-${ico}`,
          externalId: cognitoUser.idUser,
        },
      })
      return {
        success: false,
        reason: VerificationErrorsEnum.BIRTHNUMBER_ICO_DUPLICITY,
      }
    }

    let accountId: string
    if (checkUser && !legalPerson && checkUser.externalId !== cognitoUser.idUser) {
      // The (ico, birthNumber) account exists under a different Cognito user: take it over.
      const account = await this.prisma.legalPersonAccount.update({
        where: { id: checkUser.id },
        data: {
          externalId: cognitoUser.idUser,
          email: cognitoUser.email,
        },
      })
      accountId = account.id
    } else if (legalPerson) {
      const account = await this.prisma.legalPersonAccount.update({
        where: { id: legalPerson.id },
        data: { externalId: cognitoUser.idUser },
      })
      accountId = account.id
    } else {
      const account = await this.prisma.legalPersonAccount.create({
        data: {
          externalId: cognitoUser.idUser,
          email: cognitoUser.email,
        },
      })
      accountId = account.id
    }

    await this.legalPersonService.linkVerifiedAccount(accountId, company, representative)
    return { success: true }
  }

  @CatchDatabaseError()
  async requeuedInVerificationIncrement(cognitoUser: CognitoGetUserData) {
    const user = await this.findUserByEmailOrExternalId(cognitoUser.email, cognitoUser.idUser)
    if (user) {
      return await this.prisma.user.update({
        where: {
          id: user.id,
          ...ACTIVE_USER_FILTER,
        },
        data: {
          requeuedInVerification: {
            increment: 1,
          },
        },
      })
    }
    return await this.prisma.user.create({
      data: {
        externalId: cognitoUser.idUser,
        email: cognitoUser.email,
        requeuedInVerification: 1,
      },
    })
  }

  @CatchDatabaseError()
  async createVerificationUserInQueue(cognitoUser: CognitoGetUserData) {
    const user = await this.findUserByEmailOrExternalId(cognitoUser.email, cognitoUser.idUser)
    if (user) {
      return await this.prisma.user.update({
        where: {
          id: user.id,
          ...ACTIVE_USER_FILTER,
        },
        data: {
          requeuedInVerification: 0,
        },
      })
    }
    return await this.prisma.user.create({
      data: {
        externalId: cognitoUser.idUser,
        email: cognitoUser.email,
        requeuedInVerification: 0,
      },
    })
  }
}

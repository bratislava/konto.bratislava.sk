import { Injectable } from '@nestjs/common'

import { LegalPerson, User } from '@prisma/client'
import { ACTIVE_USER_FILTER, PrismaService } from '../../../prisma/prisma.service'
import { CognitoGetUserData } from '../../../utils/global-dtos/cognito.dto'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { VerificationErrorsEnum } from '../../verification.errors.enum'
import {
  CatchDatabaseError,
  IHasThrowerErrorGuard,
} from '../../../utils/decorators/CatchDatabaseError.decorators'
import { VerificationReturnType } from '../../types'

@Injectable()
export class VerificationDataSubservice implements IHasThrowerErrorGuard {
  constructor(
    private prisma: PrismaService,
    public readonly throwerErrorGuard: ThrowerErrorGuard
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
  ): Promise<LegalPerson | null> {
    let legalPerson: LegalPerson | null
    legalPerson = await this.prisma.legalPerson.findUnique({
      where: {
        email,
      },
    })
    if (!legalPerson) {
      legalPerson = await this.prisma.legalPerson.findUnique({
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
    ico: string,
    birthNumber: string
  ): Promise<VerificationReturnType> {
    const checkUser = await this.prisma.legalPerson.findUnique({
      where: {
        ico_birthNumber: {
          ico,
          birthNumber,
        },
      },
    })
    const legalPerson = await this.findLegalPersonByEmailOrExternalId(
      cognitoUser.email,
      cognitoUser.idUser
    )

    // TODO this is a weird situation. We should look more into this.
    if (checkUser && legalPerson && checkUser.externalId !== cognitoUser.idUser) {
      await this.prisma.legalPerson.update({
        where: {
          id: legalPerson.id,
        },
        data: {
          lastVerificationAttempt: new Date(),
          birthnumberIcoAlreadyExistsCounter: {
            increment: 1,
          },
          birthnumberIcoAlreadyExistsLast: birthNumber + '-' + ico,
          externalId: cognitoUser.idUser,
        },
      })
      return {
        success: false,
        reason: VerificationErrorsEnum.BIRTHNUMBER_ICO_DUPLICITY,
      }
    }

    if (checkUser && !legalPerson && checkUser.externalId !== cognitoUser.idUser) {
      await this.prisma.legalPerson.update({
        where: {
          ico_birthNumber: {
            ico,
            birthNumber,
          },
        },
        data: {
          externalId: cognitoUser.idUser,
          email: cognitoUser.email,
          lastVerificationAttempt: new Date(),
        },
      })
      return { success: true }
    }

    if (legalPerson) {
      await this.prisma.legalPerson.update({
        where: {
          id: legalPerson.id,
        },
        data: {
          externalId: cognitoUser.idUser,
          ico,
          birthNumber,
          lastVerificationAttempt: new Date(),
        },
      })
      return { success: true }
    }

    await this.prisma.legalPerson.create({
      data: {
        externalId: cognitoUser.idUser,
        ico,
        birthNumber,
        lastVerificationAttempt: new Date(),
        email: cognitoUser.email,
      },
    })
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

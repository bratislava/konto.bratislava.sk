import { HttpStatus, Injectable } from '@nestjs/common'

import { LegalPerson, User } from '@prisma/client'
import { ACTIVE_USER_FILTER, PrismaService } from '../../../prisma/prisma.service'
import { CognitoGetUserData } from '../../../utils/global-dtos/cognito.dto'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { ResponseVerificationIdentityCardDto } from '../../dtos/requests.verification.dto'
import {
  VerificationErrorsEnum,
  VerificationErrorsResponseEnum,
} from '../../verification.errors.enum'

@Injectable()
export class DatabaseSubserviceUser {
  constructor(
    private prisma: PrismaService,
    private throwerErrorGuard: ThrowerErrorGuard
  ) {}

  async findUserByEmailOrExternalId(email: string, externalId: string): Promise<User | null> {
    let user: User | null
    try {
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
    } catch (error) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        VerificationErrorsEnum.DATABASE_ERROR,
        VerificationErrorsResponseEnum.DATABASE_ERROR,
        undefined,
        error
      )
    }
  }

  async findLegalPersonByEmailOrExternalId(
    email: string,
    externalId: string
  ): Promise<LegalPerson | null> {
    let legalPerson: LegalPerson | null
    try {
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
    } catch (error) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        VerificationErrorsEnum.DATABASE_ERROR,
        VerificationErrorsResponseEnum.DATABASE_ERROR,
        undefined,
        error
      )
    }
  }

  async checkAndCreateUserIfoAndBirthNumber(
    cognitoUser: CognitoGetUserData,
    ifo: string | null,
    birthNumber: string,
    oldMagproxyDatabase: number
  ): Promise<{ success: boolean }> {
    try {
      const checkUser = await this.prisma.user.findUnique({
        where: {
          birthNumber,
        },
      })
      if (checkUser && checkUser.externalId !== cognitoUser.idUser) {
        const user = await this.findUserByEmailOrExternalId(cognitoUser.email, cognitoUser.idUser)
        if (user) {
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
        } else {
          await this.prisma.user.create({
            data: {
              externalId: cognitoUser.idUser,
              lastVerificationIdentityCard: new Date(),
              birthnumberAlreadyExistsCounter: 1,
              birthnumberAlreadyExistsLast: birthNumber,
              email: cognitoUser.email,
            },
          })
        }
        return { success: false }
      } else {
        const user = await this.findUserByEmailOrExternalId(cognitoUser.email, cognitoUser.idUser)
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
        } else {
          await this.prisma.user.create({
            data: {
              externalId: cognitoUser.idUser,
              ifo,
              lastVerificationIdentityCard: new Date(),
              birthNumber,
              email: cognitoUser.email,
            },
          })
        }

        return { success: true }
      }
    } catch (error) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        VerificationErrorsEnum.DATABASE_ERROR,
        VerificationErrorsResponseEnum.DATABASE_ERROR,
        undefined,
        error
      )
    }
  }

  async checkAndCreateLegalPersonIcoAndBirthNumber(
    cognitoUser: CognitoGetUserData,
    ico: string,
    birthNumber: string
  ): Promise<{ success: boolean }> {
    try {
      const checkUser = await this.prisma.legalPerson.findUnique({
        where: {
          ico_birthNumber: {
            ico,
            birthNumber,
          },
        },
      })
      if (checkUser && checkUser.externalId !== cognitoUser.idUser) {
        const legalPerson = await this.findLegalPersonByEmailOrExternalId(
          cognitoUser.email,
          cognitoUser.idUser
        )
        if (legalPerson) {
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
          return { success: false }
        } else {
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
        }
      } else {
        const legalPerson = await this.findLegalPersonByEmailOrExternalId(
          cognitoUser.email,
          cognitoUser.idUser
        )
        if (legalPerson) {
          await this.prisma.legalPerson.update({
            where: {
              id: legalPerson.id,
            },
            data: {
              ico,
              birthNumber,
              lastVerificationAttempt: new Date(),
              externalId: cognitoUser.idUser,
            },
          })
        } else {
          await this.prisma.legalPerson.create({
            data: {
              externalId: cognitoUser.idUser,
              ico,
              lastVerificationAttempt: new Date(),
              birthNumber,
              email: cognitoUser.email,
            },
          })
        }
      }

      return { success: true }
    } catch (error) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        VerificationErrorsEnum.DATABASE_ERROR,
        VerificationErrorsResponseEnum.DATABASE_ERROR,
        undefined,
        error
      )
    }
  }

  async requeuedInVerificationIncrement(cognitoUser: CognitoGetUserData) {
    try {
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
      } else {
        return await this.prisma.user.create({
          data: {
            externalId: cognitoUser.idUser,
            email: cognitoUser.email,
            requeuedInVerification: 1,
          },
        })
      }
    } catch (error) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        VerificationErrorsEnum.DATABASE_ERROR,
        VerificationErrorsResponseEnum.DATABASE_ERROR,
        undefined,
        error
      )
    }
  }

  async createVerificationUserInQueue(cognitoUser: CognitoGetUserData) {
    try {
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
      } else {
        return await this.prisma.user.create({
          data: {
            externalId: cognitoUser.idUser,
            email: cognitoUser.email,
            requeuedInVerification: 0,
          },
        })
      }
    } catch (error) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        VerificationErrorsEnum.DATABASE_ERROR,
        VerificationErrorsResponseEnum.DATABASE_ERROR,
        undefined,
        error
      )
    }
  }
}

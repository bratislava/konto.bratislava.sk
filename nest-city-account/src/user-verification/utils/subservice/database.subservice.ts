import { Injectable } from '@nestjs/common'

import { LegalPerson, User } from '@prisma/client'
import { PrismaService } from '../../../prisma/prisma.service'
import { CognitoGetUserData } from '../../../utils/global-dtos/cognito.dto'
import ThrowerErrorGuard, { ErrorMessengerGuard } from '../../../utils/guards/errors.guard'
import { ResponseVerificationIdentityCardDto } from '../../dtos/requests.verification.dto'
import {
  VerificationErrorsEnum,
  VerificationErrorsResponseEnum,
} from '../../verification.errors.enum'

@Injectable()
export class DatabaseSubserviceUser {
  constructor(
    private prisma: PrismaService,
    private errorMessengerGuard: ErrorMessengerGuard,
    private throwerErrorGuard: ThrowerErrorGuard
  ) {}

  async findUserByEmailOrExternalId(email: string, externalId: string): Promise<User | null> {
    let user: User | null
    try {
      user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      })
      if (!user) {
        user = await this.prisma.user.findUnique({
          where: {
            externalId,
          },
        })
      }
      return user
    } catch (error) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        VerificationErrorsEnum.DATABASE_ERROR,
        VerificationErrorsResponseEnum.DATABASE_ERROR,
        JSON.stringify(error)
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
        JSON.stringify(error)
      )
    }
  }

  async checkAndCreateUserIfoAndBirthNumber(
    cognitoUser: CognitoGetUserData,
    ifo: string | null,
    birthNumber: string,
    oldMagproxyDatabase: number
  ): Promise<ResponseVerificationIdentityCardDto> {
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
        return this.errorMessengerGuard.birthNumberDuplicity()
      } else {
        const user = await this.findUserByEmailOrExternalId(cognitoUser.email, cognitoUser.idUser)
        if (user) {
          await this.prisma.user.update({
            where: {
              id: user.id,
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

        return {
          statusCode: 200,
          status: 'OK',
          message: 'upserted',
        }
      }
    } catch (error) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        VerificationErrorsEnum.DATABASE_ERROR,
        VerificationErrorsResponseEnum.DATABASE_ERROR,
        JSON.stringify(error)
      )
    }
  }

  async checkAndCreateLegalPersonIcoAndBirthNumber(
    cognitoUser: CognitoGetUserData,
    ico: string,
    birthNumber: string
  ): Promise<ResponseVerificationIdentityCardDto> {
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
          return this.errorMessengerGuard.birthNumberIcoDuplicity()
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

      return {
        statusCode: 200,
        status: 'OK',
        message: 'upserted',
      }
    } catch (error) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        VerificationErrorsEnum.DATABASE_ERROR,
        VerificationErrorsResponseEnum.DATABASE_ERROR,
        JSON.stringify(error)
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
        JSON.stringify(error)
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
        JSON.stringify(error)
      )
    }
  }
}

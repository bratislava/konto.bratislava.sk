import { AmqpConnection, Nack, RabbitRPC } from '@golevelup/nestjs-rabbitmq'
import { Injectable } from '@nestjs/common'
import { Channel, ConsumeMessage } from 'amqplib'

import { CognitoUserAttributesTierEnum } from '@prisma/client'
import { NasesService } from '../nases/nases.service'
import { PrismaService } from '../prisma/prisma.service'
import { encryptData } from '../utils/crypto'
import TokenSubservice from './utils/subservice/token.subservice'
import {
  CognitoGetUserData,
  CognitoUserAccountTypesEnum,
  CognitoUserAttributesEnum,
} from '../utils/global-dtos/cognito.dto'
import {
  SendToQueueErrorsEnum,
  SendToQueueErrorsResponseEnum,
  VerificationErrorsEnum,
  VerificationErrorsResponseEnum,
} from './verification.errors.enum'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { rabbitmqRequeueDelay } from '../utils/handlers/rabbitmq.handlers'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { MailgunService } from '../mailgun/mailgun.service'
import { RABBIT_MQ } from './constants'
import { RabbitMessageDto } from './dtos/rabbit.dto'
import {
  RequestBodyVerifyIdentityCardDto,
  RequestBodyVerifyWithRpoDto,
  ResponseVerificationDto,
  ResponseVerificationIdentityCardMessageEnum,
  ResponseVerificationIdentityCardToQueueDto,
} from './dtos/requests.verification.dto'
import { VerificationDataSubservice } from './utils/subservice/verification-data.subservice'
import { VerificationSubservice } from './utils/subservice/verification.subservice'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { BloomreachService } from '../bloomreach/bloomreach.service'
import { CustomErrorEnums, ErrorsEnum } from '../utils/guards/dtos/error.dto'
import { VerificationReturnType } from './types'
import { extractBirthNumberFromUri, extractIcoFromUri } from './utils/utils'
import { UserTierService } from '../user/user-tier.service'

@Injectable()
export class VerificationService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private cognitoSubservice: CognitoSubservice,
    private databaseSubservice: VerificationDataSubservice,
    private nasesService: NasesService,
    private throwerErrorGuard: ThrowerErrorGuard,
    private mailgunService: MailgunService,
    private readonly amqpConnection: AmqpConnection,
    private verificationSubservice: VerificationSubservice,
    private readonly prisma: PrismaService,
    private readonly bloomreachService: BloomreachService,
    private readonly tokenSubservice: TokenSubservice,
    private readonly userTierService: UserTierService
  ) {
    if (!process.env.CRYPTO_SECRET_KEY) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Secret key for crypto must be set in env! (CRYPTO_SECRET_KEY)'
      )
    }
    this.logger = new LineLoggerSubservice(VerificationService.name)
  }

  async sendToQueue(
    user: CognitoGetUserData,
    data: RequestBodyVerifyIdentityCardDto | RequestBodyVerifyWithRpoDto,
    type: CognitoUserAccountTypesEnum
  ): Promise<ResponseVerificationIdentityCardToQueueDto> {
    if (
      user[CognitoUserAttributesEnum.TIER] === CognitoUserAttributesTierEnum.EID ||
      user[CognitoUserAttributesEnum.TIER] === CognitoUserAttributesTierEnum.IDENTITY_CARD
    ) {
      return {
        statusCode: 200,
        status: 'OK',
        message: ResponseVerificationIdentityCardMessageEnum.ALREADY_VERIFIED,
      }
    } else {
      try {
        await this.userTierService.changeTier(
          user.idUser,
          CognitoUserAttributesTierEnum.QUEUE_IDENTITY_CARD,
          user['custom:account_type']
        )
        await this.bloomreachService.trackCustomer(user.idUser)
      } catch (error) {
        throw this.throwerErrorGuard.UnprocessableEntityException(
          SendToQueueErrorsEnum.COGNITO_CHANGE_TIER_ERROR,
          SendToQueueErrorsResponseEnum.COGNITO_CHANGE_TIER_ERROR,
          undefined,
          error
        )
      }

      try {
        await this.databaseSubservice.createVerificationUserInQueue(user)
        await this.amqpConnection.publish(RABBIT_MQ.EXCHANGE, RABBIT_MQ.ROUTING_KEY, {
          msg: { data, user, type },
        })

        await this.addEncryptedVerificationDataToDatabase(user, data, type)
      } catch (error) {
        throw this.throwerErrorGuard.UnprocessableEntityException(
          SendToQueueErrorsEnum.RABBIT_PUSH_DATA_ERROR,
          SendToQueueErrorsResponseEnum.RABBIT_PUSH_DATA_ERROR,
          undefined,
          error
        )
      }

      return {
        statusCode: 200,
        status: 'OK',
        message: ResponseVerificationIdentityCardMessageEnum.SEND_TO_QUEUE,
      }
    }
  }

  @RabbitRPC({
    exchange: RABBIT_MQ.EXCHANGE,
    routingKey: RABBIT_MQ.ROUTING_KEY,
    queue: RABBIT_MQ.QUEUE,
    errorHandler: async (channel: Channel, message: ConsumeMessage) => {
      channel.reject(message, false)
      try {
        const data = JSON.parse(message.content.toString()) as RabbitMessageDto
        const throwerErrorGuard: ThrowerErrorGuard = new ThrowerErrorGuard()
        const prismaService = new PrismaService()
        const cognitoSubservice = new CognitoSubservice(throwerErrorGuard)
        const userTierService = new UserTierService(cognitoSubservice, prismaService)
        await userTierService.changeTier(
          data.msg.user.idUser,
          CognitoUserAttributesTierEnum.NOT_VERIFIED_IDENTITY_CARD,
          data.msg.type
        )

        const bloomreachService = new BloomreachService(cognitoSubservice, throwerErrorGuard)

        await bloomreachService.trackCustomer(data.msg.user.idUser)
      } catch (errorCatch) {
        const logger = new LineLoggerSubservice('RabbitRPC')
        logger.error('RabbitMQ error handler - catch cognito/parser error', errorCatch)
      }
    },
  })
  // eslint-disable-next-line sonarjs/cognitive-complexity
  public async onQueueConsumption(_: unknown, amqpMessage: ConsumeMessage) {
    const data = JSON.parse(amqpMessage.content.toString()) as RabbitMessageDto
    let verification: VerificationReturnType
    try {
      if (data.msg.type === CognitoUserAccountTypesEnum.PHYSICAL_ENTITY) {
        const body = data.msg.data as RequestBodyVerifyIdentityCardDto
        verification = await this.verificationSubservice.verifyIdentityCard(data.msg.user, body)
      } else if (
        data.msg.type === CognitoUserAccountTypesEnum.LEGAL_ENTITY ||
        data.msg.type === CognitoUserAccountTypesEnum.SELF_EMPLOYED_ENTITY
      ) {
        const body = data.msg.data as RequestBodyVerifyWithRpoDto
        verification = await this.verificationSubservice.verifyIcoIdentityCard(data.msg.user, body)
      } else {
        this.logger.error('Not exists type of RPO or RFO verification', data.msg.user.sub)
        return new Nack()
      }
    } catch (error) {
      // All errors that are thrown should be retryable. Otherwise, return {success: false}.
      return await this.handleVerificationError({ error, data })
    }

    if (verification.success) {
      return await this.handleVerificationSuccess(data)
    }
    return await this.handleVerificationFailed(data, verification)
  }

  private async handleVerificationSuccess(data: RabbitMessageDto) {
    await this.userTierService.changeTier(
      data.msg.user.idUser,
      CognitoUserAttributesTierEnum.IDENTITY_CARD,
      data.msg.type
    )
    await this.bloomreachService.trackCustomer(data.msg.user.idUser)
    const newUserData = await this.cognitoSubservice.getDataFromCognito(data.msg.user.idUser)
    if (
      newUserData[CognitoUserAttributesEnum.TIER] ===
      CognitoUserAttributesTierEnum.QUEUE_IDENTITY_CARD
    ) {
      this.logger.error('COGNITO_ERROR - WRITE TIER IDENTITY_CARD', data.msg.user)
      const userFromDb = await this.databaseSubservice.requeuedInVerificationIncrement(
        data.msg.user
      )
      const delay = rabbitmqRequeueDelay(userFromDb.requeuedInVerification)
      await this.amqpConnection.publish(RABBIT_MQ.EXCHANGE, RABBIT_MQ.QUEUE, data, {
        headers: {
          'x-delay': delay,
        },
      })
      return new Nack()
    } else {
      try {
        const firstName = data.msg.user?.given_name
        const email = data.msg.user?.email
        if (!email) {
          this.logger.error(
            "Error - no email sent, couldn't find email in user object: ",
            JSON.stringify(data.msg.user)
          )
        } else {
          await this.mailgunService.sendEmail('2023-identity-check-successful', {
            to: email,
            variables: {
              firstName: firstName ?? null,
            },
          })
        }
      } catch (error) {
        this.logger.error('Error while sending verification success email: ', error)
      }
      this.logger.log({
        type: 'ALL GOOD - 200',
        user: data.msg.user,
        cognitoData: newUserData[CognitoUserAttributesEnum.TIER],
      })
      return new Nack()
    }
  }

  private async handleVerificationFailed(
    data: RabbitMessageDto,
    verification: { success: false; reason: CustomErrorEnums }
  ) {
    await this.userTierService.changeTier(
      data.msg.user.idUser,
      CognitoUserAttributesTierEnum.NOT_VERIFIED_IDENTITY_CARD,
      data.msg.type
    )
    await this.bloomreachService.trackCustomer(data.msg.user.idUser)
    const newUserData = await this.cognitoSubservice.getDataFromCognito(data.msg.user.idUser)
    if (
      newUserData[CognitoUserAttributesEnum.TIER] ===
      CognitoUserAttributesTierEnum.QUEUE_IDENTITY_CARD
    ) {
      this.logger.error('COGNITO_ERROR - WRITE TIER NOT_VERIFIED', data.msg.user)
      const userFromDb = await this.databaseSubservice.requeuedInVerificationIncrement(
        data.msg.user
      )
      const delay = rabbitmqRequeueDelay(userFromDb.requeuedInVerification)
      await this.amqpConnection.publish(RABBIT_MQ.EXCHANGE, RABBIT_MQ.QUEUE, data, {
        headers: {
          'x-delay': delay,
        },
      })
      return new Nack()
    } else {
      try {
        const firstName = data.msg.user?.given_name
        const email = data.msg.user?.email
        if (!email) {
          this.logger.error(
            "Error - no email sent, couldn't find given_name or email in user object: ",
            JSON.stringify(data.msg.user)
          )
        } else {
          await this.mailgunService.sendEmail('2023-identity-check-rejected', {
            to: email,
            variables: {
              firstName: firstName ?? null,
            },
          })
        }
        return new Nack()
      } catch (error) {
        this.logger.error('Error while sending verification failed email: ', error)
      }
      this.logger.error({
        type: 'Not Verified without error - 200',
        user: data.msg.user,
        error: verification,
      })
      return new Nack()
    }
  }

  private async handleVerificationError(options: {
    data: RabbitMessageDto
    message?: string
    error?: unknown
    reason?: CustomErrorEnums
  }) {
    this.logger.error({ options })
    const userFromDb = await this.databaseSubservice.requeuedInVerificationIncrement(
      options.data.msg.user
    )
    const delay = rabbitmqRequeueDelay(userFromDb.requeuedInVerification)
    await this.amqpConnection.publish(RABBIT_MQ.EXCHANGE, RABBIT_MQ.QUEUE, options.data, {
      headers: {
        'x-delay': delay,
      },
    })
    return new Nack()
  }

  async verifyUserWithEid(
    user: CognitoGetUserData,
    oboToken: string
  ): Promise<ResponseVerificationDto> {
    const jwtToken = this.tokenSubservice.createUserJwtToken(oboToken)
    try {
      // we do this only to verify that the token is valid, we don't need the result
      await this.nasesService.getUpvsIdentity(jwtToken)
    } catch (error) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        VerificationErrorsEnum.VERIFY_EID_ERROR,
        VerificationErrorsResponseEnum.VERIFY_EID_ERROR,
        undefined,
        error
      )
    }

    const base64Payload = oboToken.split('.')[1]
    const payloadBuffer = Buffer.from(base64Payload, 'base64')
    const payload = JSON.parse(payloadBuffer.toString())
    const type = payload.sub.split(':')[0]

    const birthNumber = extractBirthNumberFromUri(payload.actor.sub)
    if (!birthNumber) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        VerificationErrorsEnum.VERIFY_EID_ERROR,
        VerificationErrorsResponseEnum.VERIFY_EID_ERROR,
        'Failed to retrieve birth number from URI'
      )
    }

    if (
      user[CognitoUserAttributesEnum.ACCOUNT_TYPE] ===
        CognitoUserAccountTypesEnum.PHYSICAL_ENTITY &&
      type !== 'rc'
    ) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        VerificationErrorsEnum.VERIFY_EID_ERROR,
        VerificationErrorsResponseEnum.BIRTH_NUMBER_NOT_PROVIDED
      )
    }
    if (
      (user[CognitoUserAttributesEnum.ACCOUNT_TYPE] === CognitoUserAccountTypesEnum.LEGAL_ENTITY ||
        user[CognitoUserAttributesEnum.ACCOUNT_TYPE] ===
          CognitoUserAccountTypesEnum.SELF_EMPLOYED_ENTITY) &&
      type !== 'ico'
    ) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        VerificationErrorsEnum.VERIFY_EID_ERROR,
        VerificationErrorsResponseEnum.ICO_NOT_PROVIDED
      )
    }

    if (type === 'rc') {
      const response = await this.databaseSubservice.checkAndCreateUserIfoAndBirthNumber(
        user,
        null,
        birthNumber,
        0
      )
      if (!response.success) {
        throw this.throwerErrorGuard.UnprocessableEntityException(
          VerificationErrorsEnum.VERIFY_EID_ERROR,
          VerificationErrorsResponseEnum.VERIFY_EID_ERROR,
          'Failed to verify FO with birth number'
        )
      }
    }

    if (type === 'ico') {
      const ico = extractIcoFromUri(payload.sub)
      if (!ico) {
        throw this.throwerErrorGuard.UnprocessableEntityException(
          VerificationErrorsEnum.VERIFY_EID_ERROR,
          VerificationErrorsResponseEnum.VERIFY_EID_ERROR,
          'Failed to retrieve ico from URI'
        )
      }
      const response = await this.databaseSubservice.checkAndCreateLegalPersonIcoAndBirthNumber(
        user,
        ico,
        birthNumber
      )
      if (!response.success) {
        throw this.throwerErrorGuard.UnprocessableEntityException(
          VerificationErrorsEnum.VERIFY_EID_ERROR,
          VerificationErrorsResponseEnum.VERIFY_EID_ERROR,
          'Failed to verify PO with ico and birth number'
        )
      }
    }

    await this.userTierService.changeTier(
      user.idUser,
      CognitoUserAttributesTierEnum.EID,
      user['custom:account_type']
    )
    await this.bloomreachService.trackCustomer(user.idUser)

    const newUserData = await this.cognitoSubservice.getDataFromCognito(user.idUser)
    if (newUserData[CognitoUserAttributesEnum.TIER] !== CognitoUserAttributesTierEnum.EID) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        SendToQueueErrorsEnum.COGNITO_CHANGE_TIER_ERROR,
        SendToQueueErrorsResponseEnum.COGNITO_CHANGE_TIER_ERROR
      )
    }

    return {
      statusCode: 200,
      status: 'OK',
      message: 'Successfully verified user with EID.',
    }
  }

  private async addEncryptedVerificationDataToDatabase(
    user: CognitoGetUserData,
    data: RequestBodyVerifyIdentityCardDto | RequestBodyVerifyWithRpoDto,
    type: CognitoUserAccountTypesEnum
  ): Promise<void> {
    if (type === CognitoUserAccountTypesEnum.PHYSICAL_ENTITY) {
      await this.addEncryptedIdentityCardToDatabase(user, data)
    } else if (
      type === CognitoUserAccountTypesEnum.LEGAL_ENTITY ||
      type === CognitoUserAccountTypesEnum.SELF_EMPLOYED_ENTITY
    ) {
      await this.addEncryptedIdentityCardIcoToDatabase(user, data as RequestBodyVerifyWithRpoDto)
    }
  }

  private async addEncryptedIdentityCardToDatabase(
    user: CognitoGetUserData,
    data: RequestBodyVerifyIdentityCardDto
  ): Promise<void> {
    const userFromDb = await this.prisma.user.findUnique({
      where: {
        externalId: user.sub,
      },
    })

    if (userFromDb === null) {
      return // We do not want to throw any error here!
    }

    const birthNumberEncrypted = encryptData(data.birthNumber)
    const idCardEncrypted = encryptData(data.identityCard)

    await this.prisma.userIdCardVerify.create({
      data: { userId: userFromDb.id, birthNumber: birthNumberEncrypted, idCard: idCardEncrypted },
    })
  }

  private async addEncryptedIdentityCardIcoToDatabase(
    user: CognitoGetUserData,
    data: RequestBodyVerifyWithRpoDto
  ): Promise<void> {
    const legalPerson = await this.prisma.legalPerson.findUnique({
      where: {
        externalId: user.sub,
      },
    })

    if (legalPerson === null) {
      return // We do not want to throw any error here!
    }

    const birthNumberEncrypted = encryptData(data.birthNumber)
    const idCardEncrypted = encryptData(data.identityCard)
    const icoEncrypted = encryptData(data.ico)

    await this.prisma.legalPersonIcoIdCardVerify.create({
      data: {
        legalPersonId: legalPerson.id,
        birthNumber: birthNumberEncrypted,
        idCard: idCardEncrypted,
        ico: icoEncrypted,
      },
    })
  }
}

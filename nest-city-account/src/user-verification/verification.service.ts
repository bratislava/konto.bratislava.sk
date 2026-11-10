import { ErrorFactoryService, LineLoggerService } from '@bratislava/log-nest'
import { AmqpConnection, Nack, RabbitRPC } from '@golevelup/nestjs-rabbitmq'
import { Injectable } from '@nestjs/common'
import { Channel, ConsumeMessage } from 'amqplib'

import { ManuallyVerifyUserRequestDto } from '../admin/dtos/requests.admin.dto'
import { OnlySuccessDto, UserVerifyState } from '../admin/dtos/responses.admin.dto'
import ApiJwtTokensService from '../api-jwt-tokens/api-jwt-tokens.service'
import { BloomreachOutboxService } from '../bloomreach/bloomreach-outbox.service'
import { BloomreachOutboxWriterService } from '../bloomreach/bloomreach-outbox-writer.service'
import { BloomreachPayloadBuilder } from '../bloomreach/bloomreach-payload.builder'
import { getBloomreachContactDatabase } from '../bloomreach/contact-database/bloomreach-contact-database.provider'
import { BloomreachContactDatabaseService } from '../bloomreach/contact-database/bloomreach-contact-database.service'
import getBaConfigInstance from '../config/ba-config.instance'
import BaConfigService from '../config/ba-config.service'
import { CognitoUserAttributesTierEnum, LegalPerson, User } from '../generated/prisma/client'
import { MailgunService } from '../mailgun/mailgun.service'
import { NasesService } from '../nases/nases.service'
import { ACTIVE_USER_FILTER, PrismaService } from '../prisma/prisma.service'
import { UserErrorsEnum, UserErrorsResponseEnum } from '../user/user.error.enum'
import { UserTierService } from '../user/user-tier.service'
import alertReporting from '../utils/constants/error.alerts'
import { decryptData, encryptData } from '../utils/crypto'
import {
  CognitoGetUserData,
  CognitoUserAccountTypesEnum,
  CognitoUserAttributesEnum,
} from '../utils/global-dtos/cognito.dto'
import { CustomErrorEnums } from '../utils/guards/dtos/error.dto'
import { rabbitmqRequeueDelay } from '../utils/handlers/rabbitmq.handlers'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { UserIdentitySubservice } from '../utils/subservices/user-identity.subservice'
import { RABBIT_MQ } from './constants'
import { IdentityCardVerificationQueueMessage } from './dtos/identity-card-verification-queue.dto'
import {
  RequestBodyVerifyIdentityCardDto,
  ResponseVerificationDto,
  ResponseVerificationIdentityCardMessageEnum,
  ResponseVerificationIdentityCardToQueueDto,
} from './dtos/requests.verification.dto'
import { VerificationDataForUserResponseDto } from './dtos/verification-response.dto'
import { VerificationReturnType } from './types'
import { VerificationSubservice } from './utils/subservice/verification.subservice'
import { VerificationDataSubservice } from './utils/subservice/verification-data.subservice'
import { extractBirthNumberFromUri, extractIcoFromUri } from './utils/utils'
import {
  SendToQueueErrorsEnum,
  SendToQueueErrorsResponseEnum,
  VerificationErrorsEnum,
  VerificationErrorsResponseEnum,
} from './verification.errors.enum'

const NAME_NOT_SET = 'not-set'
const decryptName = (value: string): string => (value === NAME_NOT_SET ? value : decryptData(value))

@Injectable()
export class VerificationService {
  constructor(
    private cognitoSubservice: CognitoSubservice,
    private verificationDataSubservice: VerificationDataSubservice,
    private nasesService: NasesService,
    private errorFactoryService: ErrorFactoryService,
    private mailgunService: MailgunService,
    private readonly amqpConnection: AmqpConnection,
    private verificationSubservice: VerificationSubservice,
    private readonly prisma: PrismaService,
    private readonly bloomreachOutboxService: BloomreachOutboxService,
    private readonly apiJwtTokensService: ApiJwtTokensService,
    private readonly userTierService: UserTierService,
    private readonly baConfigService: BaConfigService,
    private readonly logger: LineLoggerService
  ) {}

  async sendToQueue(
    user: CognitoGetUserData,
    data: RequestBodyVerifyIdentityCardDto
  ): Promise<ResponseVerificationIdentityCardToQueueDto> {
    if (
      user[CognitoUserAttributesEnum.ACCOUNT_TYPE] !== CognitoUserAccountTypesEnum.PHYSICAL_ENTITY
    ) {
      throw this.errorFactoryService.UnprocessableEntityException({
        errorEnum: VerificationErrorsEnum.IDENTITY_CARD_VERIFICATION_NOT_ALLOWED,
        message: VerificationErrorsResponseEnum.IDENTITY_CARD_VERIFICATION_NOT_ALLOWED,
        console: { userSub: user.sub, accountType: user[CognitoUserAttributesEnum.ACCOUNT_TYPE] },
      })
    }

    if (
      user[CognitoUserAttributesEnum.TIER] === CognitoUserAttributesTierEnum.EID ||
      user[CognitoUserAttributesEnum.TIER] === CognitoUserAttributesTierEnum.IDENTITY_CARD
    ) {
      return {
        statusCode: 200,
        status: 'OK',
        message: ResponseVerificationIdentityCardMessageEnum.ALREADY_VERIFIED,
      }
    }
    try {
      await this.userTierService.changeTier(
        user.idUser,
        CognitoUserAttributesTierEnum.QUEUE_IDENTITY_CARD,
        CognitoUserAccountTypesEnum.PHYSICAL_ENTITY
      )
      await this.bloomreachOutboxService.trackCustomer(user.idUser)
    } catch (error) {
      throw this.errorFactoryService.UnprocessableEntityException({
        errorEnum: SendToQueueErrorsEnum.COGNITO_CHANGE_TIER_ERROR,
        message: SendToQueueErrorsResponseEnum.COGNITO_CHANGE_TIER_ERROR,
        console: {
          userSub: user.sub,
          tier: user[CognitoUserAttributesEnum.TIER],
          targetTier: CognitoUserAttributesTierEnum.QUEUE_IDENTITY_CARD,
        },
        error,
      })
    }

    try {
      await this.verificationDataSubservice.createVerificationUserInQueue(user)
      await this.amqpConnection.publish(RABBIT_MQ.EXCHANGE, RABBIT_MQ.ROUTING_KEY, {
        msg: { data, user, type: CognitoUserAccountTypesEnum.PHYSICAL_ENTITY },
      })

      await this.addEncryptedIdentityCardToDatabase(user, data)
    } catch (error) {
      throw this.errorFactoryService.UnprocessableEntityException({
        errorEnum: SendToQueueErrorsEnum.RABBIT_PUSH_DATA_ERROR,
        message: SendToQueueErrorsResponseEnum.RABBIT_PUSH_DATA_ERROR,
        console: { userSub: user.sub },
        error,
      })
    }

    return {
      statusCode: 200,
      status: 'OK',
      message: ResponseVerificationIdentityCardMessageEnum.SEND_TO_QUEUE,
    }
  }

  @RabbitRPC({
    exchange: RABBIT_MQ.EXCHANGE,
    routingKey: RABBIT_MQ.ROUTING_KEY,
    queue: RABBIT_MQ.QUEUE,
    errorHandler: async (channel: Channel, message: ConsumeMessage) => {
      channel.reject(message, false)
      let userSub: string | undefined
      try {
        const data = JSON.parse(message.content.toString()) as IdentityCardVerificationQueueMessage
        userSub = data.msg.user.sub
        const errorFactoryService = new ErrorFactoryService({ alertReporting })
        const prismaService = new PrismaService(
          getBaConfigInstance(),
          new LineLoggerService(PrismaService.name)
        )
        const cognitoSubservice = new CognitoSubservice(errorFactoryService, getBaConfigInstance())
        const userTierService = new UserTierService(cognitoSubservice, prismaService)
        await userTierService.changeTier(
          data.msg.user.idUser,
          CognitoUserAttributesTierEnum.NOT_VERIFIED_IDENTITY_CARD,
          CognitoUserAccountTypesEnum.PHYSICAL_ENTITY
        )

        const bloomreachContactDatabaseService = new BloomreachContactDatabaseService(
          errorFactoryService,
          getBloomreachContactDatabase(),
          new LineLoggerService(BloomreachContactDatabaseService.name)
        )

        const userIdentitySubservice = new UserIdentitySubservice(prismaService)
        const bloomreachPayloadBuilder = new BloomreachPayloadBuilder(
          cognitoSubservice,
          bloomreachContactDatabaseService,
          userIdentitySubservice
        )

        const bloomreachOutboxWriterService = new BloomreachOutboxWriterService(
          prismaService,
          bloomreachPayloadBuilder,
          errorFactoryService,
          new LineLoggerService(BloomreachOutboxWriterService.name)
        )
        const bloomreachOutboxService = new BloomreachOutboxService(
          bloomreachOutboxWriterService,
          errorFactoryService,
          getBaConfigInstance(),
          new LineLoggerService(BloomreachOutboxService.name)
        )

        await bloomreachOutboxService.trackCustomer(data.msg.user.idUser)
      } catch (errorCatch) {
        const logger = new LineLoggerService('RabbitRPC')
        logger.error(
          'RabbitMQ error handler - catch cognito/parser error',
          {
            userSub,
            redelivered: message.fields.redelivered,
            deliveryTag: message.fields.deliveryTag,
          },
          errorCatch
        )
      }
    },
  })
  public async onQueueConsumption(_: unknown, amqpMessage: ConsumeMessage) {
    const data = JSON.parse(amqpMessage.content.toString()) as IdentityCardVerificationQueueMessage

    // TODO: Remove once the ico-rpo removal is fully deployed, together with `type` in IdentityCardVerificationRequest.
    // Messages from the removed ico-rpo verification can still arrive from pods running older code
    // or from delayed requeues. They must not go through the physical entity verification.
    if (data.msg.type !== CognitoUserAccountTypesEnum.PHYSICAL_ENTITY) {
      this.logger.error('Dropping verification message of removed ico-rpo verification', {
        userSub: data.msg.user.sub,
        accountType: data.msg.type,
      })
      await this.userTierService.changeTier(
        data.msg.user.idUser,
        CognitoUserAttributesTierEnum.NOT_VERIFIED_IDENTITY_CARD,
        data.msg.type
      )
      await this.bloomreachOutboxService.trackCustomer(data.msg.user.idUser)
      return new Nack()
    }

    let verification: VerificationReturnType
    try {
      verification = await this.verificationSubservice.verifyIdentityCard(data.msg)
    } catch (error) {
      // All errors that are thrown should be retryable. Otherwise, return {success: false}.
      return await this.handleVerificationError({ error, data })
    }

    if (verification.success) {
      return await this.handleVerificationSuccess(data)
    }
    return await this.handleVerificationFailed(data, verification)
  }

  private async handleVerificationSuccess(data: IdentityCardVerificationQueueMessage) {
    await this.userTierService.changeTier(
      data.msg.user.idUser,
      CognitoUserAttributesTierEnum.IDENTITY_CARD,
      CognitoUserAccountTypesEnum.PHYSICAL_ENTITY
    )
    await this.bloomreachOutboxService.trackCustomer(data.msg.user.idUser)
    const newUserData = await this.cognitoSubservice.getDataFromCognito(data.msg.user.idUser)
    if (
      newUserData[CognitoUserAttributesEnum.TIER] ===
      CognitoUserAttributesTierEnum.QUEUE_IDENTITY_CARD
    ) {
      this.logger.error('COGNITO_ERROR - WRITE TIER IDENTITY_CARD', {
        userSub: data.msg.user.sub,
        oldTier: data.msg.user[CognitoUserAttributesEnum.TIER],
        newTier: newUserData[CognitoUserAttributesEnum.TIER],
      })
      const userFromDb = await this.verificationDataSubservice.requeuedInVerificationIncrement(
        data.msg.user
      )
      const delay = rabbitmqRequeueDelay(userFromDb.requeuedInVerification)
      await this.amqpConnection.publish(RABBIT_MQ.EXCHANGE, RABBIT_MQ.QUEUE, data, {
        headers: {
          'x-delay': delay,
        },
      })
      return new Nack()
    }
    try {
      const firstName = data.msg.user.given_name
      const email = data.msg.user.email
      if (!email) {
        this.logger.error("Error - no email sent, couldn't find email in user object", {
          userSub: data.msg.user.sub,
          tier: newUserData[CognitoUserAttributesEnum.TIER],
        })
      } else {
        await this.mailgunService.sendEmail(
          '2023-identity-check-successful',
          {
            to: email,
            variables: {
              firstName: firstName ?? null,
            },
          },
          { userSub: data.msg.user.sub }
        )
      }
    } catch (error) {
      this.logger.error(
        'Error while sending verification success email: ',
        {
          userSub: data.msg.user.sub,
          tier: newUserData[CognitoUserAttributesEnum.TIER],
        },
        error
      )
    }
    this.logger.log({
      type: 'ALL GOOD - 200',
      userSub: data.msg.user.sub,
      cognitoData: newUserData[CognitoUserAttributesEnum.TIER],
    })
    return new Nack()
  }

  private async handleVerificationFailed(
    data: IdentityCardVerificationQueueMessage,
    verification: { success: false; reason: CustomErrorEnums }
  ) {
    await this.userTierService.changeTier(
      data.msg.user.idUser,
      CognitoUserAttributesTierEnum.NOT_VERIFIED_IDENTITY_CARD,
      CognitoUserAccountTypesEnum.PHYSICAL_ENTITY
    )
    await this.bloomreachOutboxService.trackCustomer(data.msg.user.idUser)
    const newUserData = await this.cognitoSubservice.getDataFromCognito(data.msg.user.idUser)
    if (
      newUserData[CognitoUserAttributesEnum.TIER] ===
      CognitoUserAttributesTierEnum.QUEUE_IDENTITY_CARD
    ) {
      this.logger.error('COGNITO_ERROR - WRITE TIER NOT_VERIFIED', {
        userSub: data.msg.user.sub,
        oldTier: data.msg.user[CognitoUserAttributesEnum.TIER],
        newTier: newUserData[CognitoUserAttributesEnum.TIER],
        reason: verification.reason,
      })
      const userFromDb = await this.verificationDataSubservice.requeuedInVerificationIncrement(
        data.msg.user
      )
      const delay = rabbitmqRequeueDelay(userFromDb.requeuedInVerification)
      await this.amqpConnection.publish(RABBIT_MQ.EXCHANGE, RABBIT_MQ.QUEUE, data, {
        headers: {
          'x-delay': delay,
        },
      })
      return new Nack()
    }
    try {
      const firstName = data.msg.user.given_name
      const email = data.msg.user.email
      if (!email) {
        this.logger.error("Error - no email sent, couldn't find email in user object", {
          userSub: data.msg.user.sub,
          tier: newUserData[CognitoUserAttributesEnum.TIER],
        })
      } else {
        await this.mailgunService.sendEmail(
          '2023-identity-check-rejected',
          {
            to: email,
            variables: {
              firstName: firstName ?? null,
            },
          },
          { userSub: data.msg.user.sub }
        )
      }
      return new Nack()
    } catch (error) {
      this.logger.error(
        'Error while sending verification failed email: ',
        {
          userSub: data.msg.user.sub,
          tier: newUserData[CognitoUserAttributesEnum.TIER],
          reason: verification.reason,
        },
        error
      )
    }
    this.logger.error({
      type: 'Not Verified without error - 200',
      userSub: data.msg.user.sub,
      reason: verification.reason,
      cognitoData: newUserData[CognitoUserAttributesEnum.TIER],
    })
    return new Nack()
  }

  private async handleVerificationError(options: {
    data: IdentityCardVerificationQueueMessage
    message?: string
    error?: unknown
    reason?: CustomErrorEnums
  }) {
    // `options.data` is the whole queue message (birth number, identity card,
    // Cognito profile), so log only ids and the reason.
    this.logger.error(
      {
        message: options.message,
        reason: options.reason,
        userSub: options.data.msg.user.sub,
        // tier when the message was queued, i.e. before QUEUE_IDENTITY_CARD was set
        tierBeforeQueue: options.data.msg.user[CognitoUserAttributesEnum.TIER],
      },
      options.error
    )
    const userFromDb = await this.verificationDataSubservice.requeuedInVerificationIncrement(
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
    const jwtToken = this.apiJwtTokensService.createUserJwtToken(
      oboToken,
      this.baConfigService.nases.apiTokenPrivate
    )
    const eidLogContext = {
      userSub: user.sub,
      accountType: user[CognitoUserAttributesEnum.ACCOUNT_TYPE],
      tier: user[CognitoUserAttributesEnum.TIER],
    }
    try {
      // we do this only to verify that the token is valid, we don't need the result
      await this.nasesService.getUpvsIdentity(jwtToken, { userSub: user.sub })
    } catch (error) {
      throw this.errorFactoryService.UnprocessableEntityException({
        errorEnum: VerificationErrorsEnum.VERIFY_EID_ERROR,
        message: VerificationErrorsResponseEnum.VERIFY_EID_ERROR,
        console: eidLogContext,
        error,
      })
    }

    const base64Payload = oboToken.split('.')[1]
    const payloadBuffer = Buffer.from(base64Payload, 'base64')
    const payload = JSON.parse(payloadBuffer.toString()) as { sub: string; actor: { sub: string } }
    const type = payload.sub.split(':')[0]

    const birthNumber = extractBirthNumberFromUri(payload.actor.sub)
    if (!birthNumber) {
      throw this.errorFactoryService.UnprocessableEntityException({
        errorEnum: VerificationErrorsEnum.VERIFY_EID_ERROR,
        message: VerificationErrorsResponseEnum.VERIFY_EID_ERROR,
        console: {
          message: 'Failed to retrieve birth number from URI',
          ...eidLogContext,
          uriType: type,
        },
      })
    }

    if (
      user[CognitoUserAttributesEnum.ACCOUNT_TYPE] ===
        CognitoUserAccountTypesEnum.PHYSICAL_ENTITY &&
      type !== 'rc'
    ) {
      throw this.errorFactoryService.UnprocessableEntityException({
        errorEnum: VerificationErrorsEnum.VERIFY_EID_ERROR,
        message: VerificationErrorsResponseEnum.BIRTH_NUMBER_NOT_PROVIDED,
        console: { ...eidLogContext, uriType: type },
      })
    }
    if (
      (user[CognitoUserAttributesEnum.ACCOUNT_TYPE] === CognitoUserAccountTypesEnum.LEGAL_ENTITY ||
        user[CognitoUserAttributesEnum.ACCOUNT_TYPE] ===
          CognitoUserAccountTypesEnum.SELF_EMPLOYED_ENTITY) &&
      type !== 'ico'
    ) {
      throw this.errorFactoryService.UnprocessableEntityException({
        errorEnum: VerificationErrorsEnum.VERIFY_EID_ERROR,
        message: VerificationErrorsResponseEnum.ICO_NOT_PROVIDED,
        console: { ...eidLogContext, uriType: type },
      })
    }

    if (type === 'rc') {
      const response = await this.verificationDataSubservice.checkAndCreateUserIfoAndBirthNumber(
        user,
        null,
        birthNumber,
        0
      )
      if (!response.success) {
        throw this.errorFactoryService.UnprocessableEntityException({
          errorEnum: VerificationErrorsEnum.VERIFY_EID_ERROR,
          message: VerificationErrorsResponseEnum.VERIFY_EID_ERROR,
          console: {
            message: 'Failed to verify FO with birth number',
            ...eidLogContext,
            reason: response.reason,
          },
        })
      }
    }

    if (type === 'ico') {
      const ico = extractIcoFromUri(payload.sub)
      if (!ico) {
        throw this.errorFactoryService.UnprocessableEntityException({
          errorEnum: VerificationErrorsEnum.VERIFY_EID_ERROR,
          message: VerificationErrorsResponseEnum.VERIFY_EID_ERROR,
          console: { message: 'Failed to retrieve ico from URI', ...eidLogContext, uriType: type },
        })
      }
      const response =
        await this.verificationDataSubservice.checkAndCreateLegalPersonIcoAndBirthNumber(
          user,
          ico,
          birthNumber
        )
      if (!response.success) {
        throw this.errorFactoryService.UnprocessableEntityException({
          errorEnum: VerificationErrorsEnum.VERIFY_EID_ERROR,
          message: VerificationErrorsResponseEnum.VERIFY_EID_ERROR,
          console: {
            message: 'Failed to verify PO with ico and birth number',
            ...eidLogContext,
            reason: response.reason,
          },
        })
      }
    }

    await this.userTierService.changeTier(
      user.idUser,
      CognitoUserAttributesTierEnum.EID,
      user['custom:account_type']
    )
    await this.bloomreachOutboxService.trackCustomer(user.idUser)

    const newUserData = await this.cognitoSubservice.getDataFromCognito(user.idUser)
    if (newUserData[CognitoUserAttributesEnum.TIER] !== CognitoUserAttributesTierEnum.EID) {
      throw this.errorFactoryService.UnprocessableEntityException({
        errorEnum: SendToQueueErrorsEnum.COGNITO_CHANGE_TIER_ERROR,
        message: SendToQueueErrorsResponseEnum.COGNITO_CHANGE_TIER_ERROR,
        console: {
          ...eidLogContext,
          targetTier: CognitoUserAttributesTierEnum.EID,
          tierAfterUpdate: newUserData[CognitoUserAttributesEnum.TIER],
        },
      })
    }

    return {
      statusCode: 200,
      status: 'OK',
      message: 'Successfully verified user with EID.',
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

    // TODO this should not be undefined at this point
    const givenNameEncrypted = encryptData(user.given_name ?? 'not-set')
    const familyNameEncrypted = encryptData(user.family_name ?? 'not-set')

    await this.prisma.userIdCardVerify.create({
      data: {
        userId: userFromDb.id,
        birthNumber: birthNumberEncrypted,
        idCard: idCardEncrypted,
        givenName: givenNameEncrypted,
        familyName: familyNameEncrypted,
      },
    })
  }

  async checkUserVerifyState(email: string): Promise<UserVerifyState> {
    const result: UserVerifyState = {
      isInDatabase: false,
      isInCognito: false,
      cognitoTier: CognitoUserAttributesTierEnum.NEW,
      isVerified: false,
    }

    // Try if this is legal person. If yes go to legal person state.
    const legalPerson = await this.prisma.legalPerson.findUnique({
      where: {
        email,
      },
    })
    if (legalPerson !== null) {
      return this.checkLegalPersonVerifyState(email)
    }

    const user = await this.prisma.user.findUnique({
      where: {
        email,
        ...ACTIVE_USER_FILTER,
      },
    })
    if (user !== null) {
      result.isInDatabase = true

      if (user.birthnumberAlreadyExistsLast) {
        result.birthNumberAlreadyExists = user.birthnumberAlreadyExistsLast
      }
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
        } catch {
          result.isInCognito = false
        }
      }
    }

    return result
  }

  // ========== Verification State (delegates to VerificationService) ==========
  async checkLegalPersonVerifyState(email: string): Promise<UserVerifyState> {
    const result: UserVerifyState = {
      isInDatabase: false,
      isInCognito: false,
      cognitoTier: CognitoUserAttributesTierEnum.NEW,
      isVerified: false,
    }

    const legalPerson = await this.prisma.legalPerson.findUnique({
      where: {
        email,
      },
    })
    if (legalPerson !== null) {
      result.isInDatabase = true

      if (legalPerson.birthnumberIcoAlreadyExistsLast) {
        result.birthNumberIcoAlreadyExists = legalPerson.birthnumberIcoAlreadyExistsLast
      }
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
        } catch {
          result.isInCognito = false
        }
      }
    }

    return result
  }

  async getVerificationDataForUser(email: string): Promise<VerificationDataForUserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
        ...ACTIVE_USER_FILTER,
      },
    })

    if (!user) {
      throw this.errorFactoryService.NotFoundException({
        errorEnum: UserErrorsEnum.USER_NOT_FOUND,
        message: UserErrorsResponseEnum.USER_NOT_FOUND,
      })
    }

    const verifyData = await this.prisma.userIdCardVerify.findMany({
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
      givenName: decryptName(record.givenName),
      familyName: decryptName(record.familyName),
    }))

    return {
      externalId: user.externalId,
      email,
      verificationDataLastMonth: verifyDataDecrypted,
    }
  }

  async manuallyVerifyUser(
    email: string,
    data: ManuallyVerifyUserRequestDto
  ): Promise<OnlySuccessDto> {
    let isLegalPerson = true
    let user: LegalPerson | User | null = await this.prisma.legalPerson.findUnique({
      where: {
        email,
      },
    })
    if (!user) {
      isLegalPerson = false
      user = await this.prisma.user.findUnique({
        where: {
          email,
          ...ACTIVE_USER_FILTER,
        },
      })
    }
    if (!user) {
      throw this.errorFactoryService.NotFoundException({
        errorEnum: UserErrorsEnum.USER_NOT_FOUND,
        message: UserErrorsResponseEnum.USER_NOT_FOUND,
      })
    }

    if (!user.externalId) {
      throw this.errorFactoryService.UnprocessableEntityException({
        errorEnum: UserErrorsEnum.NO_EXTERNAL_ID,
        message: UserErrorsResponseEnum.NO_EXTERNAL_ID,
        console: { id: user.id, isLegalPerson },
      })
    }

    // Update the database
    if (isLegalPerson) {
      if (!data.ico) {
        throw this.errorFactoryService.BadRequestException({
          errorEnum: VerificationErrorsEnum.ICO_NOT_PROVIDED,
          message: VerificationErrorsResponseEnum.ICO_NOT_PROVIDED,
          console: { legalPersonId: user.id, externalId: user.externalId },
        })
      }

      await this.prisma.legalPerson.update({
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
        throw this.errorFactoryService.BadRequestException({
          errorEnum: VerificationErrorsEnum.IFO_NOT_PROVIDED,
          message: VerificationErrorsResponseEnum.IFO_NOT_PROVIDED,
          console: { userId: user.id, externalId: user.externalId },
        })
      }

      await this.prisma.user.update({
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
    await this.userTierService.changeTier(
      user.externalId,
      CognitoUserAttributesTierEnum.IDENTITY_CARD,
      cognitoUser['custom:account_type']
    )
    await this.bloomreachOutboxService.trackCustomer(user.externalId)

    return { success: true }
  }
}

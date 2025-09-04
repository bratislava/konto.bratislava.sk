import { AmqpConnection, Nack, RabbitRPC } from '@golevelup/nestjs-rabbitmq'
import { Injectable } from '@nestjs/common'
import { Channel, ConsumeMessage } from 'amqplib'

import { CognitoUserAttributesTierEnum } from '@prisma/client'
import { NasesService } from '../nases/nases.service'
import { PrismaService } from '../prisma/prisma.service'
import { encryptData } from '../utils/crypto'
import { createUserJwtToken } from '../utils/eid'
import {
  CognitoGetUserData,
  CognitoUserAccountTypesEnum,
  CognitoUserAttributesEnum,
} from '../utils/global-dtos/cognito.dto'
import { MagproxyErrorsEnum } from '../magproxy/magproxy.errors.enum'
import {
  SendToQueueErrorsEnum,
  SendToQueueErrorsResponseEnum,
  VerificationErrorsEnum,
  VerificationErrorsResponseEnum,
} from './verification.errors.enum'
import ThrowerErrorGuard, { ErrorMessengerGuard } from '../utils/guards/errors.guard'
import { rabbitmqRequeueDelay } from '../utils/handlers/rabbitmq.handlers'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { MailgunSubservice } from '../utils/subservices/mailgun.subservice'
import { RABBIT_MQ } from './constants'
import { RabbitMessageDto } from './dtos/rabbit.dto'
import {
  RequestBodyVerifyIdentityCardDto,
  RequestBodyVerifyWithRpoDto,
  ResponseVerificationDto,
  ResponseVerificationIdentityCardDto,
  ResponseVerificationIdentityCardMessageEnum,
  ResponseVerificationIdentityCardToQueueDto,
} from './dtos/requests.verification.dto'
import { DatabaseSubserviceUser } from './utils/subservice/database.subservice'
import { VerificationSubservice } from './utils/subservice/verification.subservice'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { BloomreachService } from '../bloomreach/bloomreach.service'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'

@Injectable()
export class VerificationService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private cognitoSubservice: CognitoSubservice,
    private databaseSubservice: DatabaseSubserviceUser,
    private nasesService: NasesService,
    private errorMessengerGuard: ErrorMessengerGuard,
    private throwerErrorGuard: ThrowerErrorGuard,
    private mailgunSubservice: MailgunSubservice,
    private readonly amqpConnection: AmqpConnection,
    private verificationSubservice: VerificationSubservice,
    private readonly prisma: PrismaService,
    private readonly bloomreachService: BloomreachService
  ) {
    if (!process.env.CRYPTO_SECRET_KEY) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Secret key for crypto must be set in env! (CRYPTO_SECRET_KEY)'
      )
    }
    this.logger = new LineLoggerSubservice(VerificationService.name)
  }

  /**
   * Sends user verification data to a message queue for asynchronous processing
   *
   * This function handles the initial step of user identity verification by placing
   * verification requests in a RabbitMQ queue. It performs pre-validation, updates
   * user status, and queues the verification data for background processing.
   *
   * @param user - Cognito user data containing user information and current verification tier
   * @param data - Verification data (identity card or legal entity information)
   * @param type - Type of account being verified (physical, legal, or self-employed entity)
   * @returns Promise with queue status response
   *
   * @throws UnprocessableEntityException when Cognito tier change fails
   * @throws UnprocessableEntityException when queue publishing fails
   *
   * Flow:
   * 1. Check if user is already verified → Return "ALREADY_VERIFIED" if true
   * 2. Update Cognito user tier to "QUEUE_IDENTITY_CARD" (waiting in queue)
   * 3. Track user activity in Bloomreach analytics
   * 4. Create verification record in database
   * 5. Publish message to RabbitMQ queue for background verification
   * 6. Store encrypted verification data in database
   * 7. Return "SEND_TO_QUEUE" success response
   */
  async sendToQueue(
    user: CognitoGetUserData,
    data: RequestBodyVerifyIdentityCardDto | RequestBodyVerifyWithRpoDto,
    type: CognitoUserAccountTypesEnum
  ): Promise<ResponseVerificationIdentityCardToQueueDto> {
    // 1. Check if user is already verified - skip queue if already verified with EID or identity card
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
        // 2. Update user's verification tier in Cognito to indicate they're in queue
        await this.cognitoSubservice.changeTier(
          user.idUser,
          CognitoUserAttributesTierEnum.QUEUE_IDENTITY_CARD,
          user['custom:account_type']
        )

        // Step 3. Track user activity for analytics/marketing purposes
        await this.bloomreachService.trackCustomer(user.idUser)
      } catch (error) {
        // Handle Cognito or Bloomreach service failures
        throw this.throwerErrorGuard.UnprocessableEntityException(
          SendToQueueErrorsEnum.COGNITO_CHANGE_TIER_ERROR,
          SendToQueueErrorsResponseEnum.COGNITO_CHANGE_TIER_ERROR,
          undefined,
          error
        )
      }

      try {
        // 4. Create verification user record in database (for tracking queue status)
        await this.databaseSubservice.createVerificationUserInQueue(user)

        // 5. Publish verification message to RabbitMQ queue for background processing
        // The queue consumer will handle the actual verification logic asynchronously
        await this.amqpConnection.publish(RABBIT_MQ.EXCHANGE, RABBIT_MQ.ROUTING_KEY, {
          msg: { data, user, type },
        })

        // 6. Store encrypted verification data in database
        await this.addEncryptedVerificationDataToDatabase(user, data, type)
      } catch (error) {
        // Handle database or RabbitMQ failures
        throw this.throwerErrorGuard.UnprocessableEntityException(
          SendToQueueErrorsEnum.RABBIT_PUSH_DATA_ERROR,
          SendToQueueErrorsResponseEnum.RABBIT_PUSH_DATA_ERROR,
          undefined,
          error
        )
      }

      // 7. Return success response indicating data was queued for verification
      return {
        statusCode: 200,
        status: 'OK',
        message: ResponseVerificationIdentityCardMessageEnum.SEND_TO_QUEUE,
      }
    }
  }

  /**
   * RabbitMQ message consumer that processes identity verification requests asynchronously
   *
   * This function is the core message handler that consumes verification requests from the queue
   * and performs the actual identity verification against external Slovak government services
   * (RFO for individuals, RPO for legal entities). It handles three main outcomes:
   * successful verification, verification failure, and external service errors.
   *
   * @param _ - Unused parameter (RabbitMQ context)
   * @param amqpMessage - The AMQP message containing verification request data
   * @returns Nack() - Always returns Nack to acknowledge message processing
   *
   * @RabbitRPC Decorator configures this method as a RabbitMQ consumer with:
   * - Exchange: RABBIT_MQ.EXCHANGE
   * - Routing Key: RABBIT_MQ.ROUTING_KEY
   * - Queue: RABBIT_MQ.QUEUE
   * - Error Handler: Sets user tier to NOT_VERIFIED_IDENTITY_CARD on critical failures
   *
   * Flow:
   * 1. Parse message data from queue
   * 2. Route to appropriate verification service (Physical/Legal entity)
   * 3. Handle three verification outcomes:
   *    - SUCCESS: Update tier to IDENTITY_CARD, send success email
   *    - EXTERNAL_ERROR: Requeue with exponential backoff delay
   *    - VERIFICATION_FAILED: Update tier to NOT_VERIFIED, send rejection email
   * 4. Handle Cognito sync failures with requeuing logic
   */
  @RabbitRPC({
    exchange: RABBIT_MQ.EXCHANGE,
    routingKey: RABBIT_MQ.ROUTING_KEY,
    queue: RABBIT_MQ.QUEUE,
    errorHandler: async (channel: Channel, message: ConsumeMessage) => {
      // Critical error handler - executed when the main function throws unhandled exceptions
      channel.reject(message, false) // Don't requeue on critical failures
      try {
        const data = JSON.parse(message.content.toString()) as RabbitMessageDto
        const throwerErrorGuard: ThrowerErrorGuard = new ThrowerErrorGuard()
        const prismaService = new PrismaService()
        const cognitoSubservice = new CognitoSubservice(throwerErrorGuard, prismaService)

        // Set user to NOT_VERIFIED state when critical errors occur
        await cognitoSubservice.changeTier(
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
    // Step 1: Parse the verification request data from the queue message
    const data = JSON.parse(amqpMessage.content.toString()) as RabbitMessageDto

    // Step 2: Perform identity verification based on entity type
    let verification: ResponseVerificationIdentityCardDto
    try {
      verification = await this.performVerificationByEntityType(data)
    } catch (error) {
      // Step 3A: Handle verification service exceptions with exponential backoff retry
      this.logger.error(error, { congnitoId: data.msg.user.sub })

      // Increment retry counter and calculate delay for next attempt
      const userFromDb = await this.databaseSubservice.requeuedInVerificationIncrement(
        data.msg.user
      )
      const delay = rabbitmqRequeueDelay(userFromDb.requeuedInVerification)

      // Requeue message with delay header for retry
      await this.amqpConnection.publish(RABBIT_MQ.EXCHANGE, RABBIT_MQ.QUEUE, data, {
        headers: {
          'x-delay': delay, // Exponential backoff delay
        },
      })
      return new Nack()
    }

    // Step 4: Process verification results based on outcome

    //  - OUTCOME 1: Verification successful (statusCode: 200)
    if (verification.statusCode === 200) {
      return await this.ProcessVerificationSuccess(data, verification)
    }

    //  - OUTCOME 2: External service errors (temporary failures)
    //    These are retryable errors from government services (RFO/RPO)
    if (
      verification.errorName === MagproxyErrorsEnum.RFO_UNEXPECTED_RESPONSE ||
      verification.errorName === MagproxyErrorsEnum.RFO_ACCESS_ERROR ||
      verification.errorName === VerificationErrorsEnum.RFO_NOT_RESPONDING ||
      verification.errorName === VerificationErrorsEnum.RFO_ACCESS_ERROR
    ) {
      return await this.ProcessVerificationFailedWithoutError(data, verification)
    }

    //  - OUTCOME 3: Verification failed (user data invalid/doesn't match)
    return await this.processFailedVerification(data, verification)
  }

  /**
   * Performs identity verification based on the entity type
   * Routes to appropriate verification service (RFO for physical entities, RPO for legal entities)
   */
  private async performVerificationByEntityType(
    data: RabbitMessageDto
  ): Promise<ResponseVerificationIdentityCardDto> {
    const { type, user, data: requestData } = data.msg

    switch (type) {
      case CognitoUserAccountTypesEnum.PHYSICAL_ENTITY:
        return await this.verificationSubservice.verifyIdentityCard(
          user,
          body as RequestBodyVerifyIdentityCardDto
        )

      case CognitoUserAccountTypesEnum.LEGAL_ENTITY:
      case CognitoUserAccountTypesEnum.SELF_EMPLOYED_ENTITY:
        return await this.verificationSubservice.verifyIcoIdentityCard(
          user,
          body as RequestBodyVerifyWithRpoDto
        )

      default:
        this.logger.error('Not exists type of RPO or RFO verification', data.msg.user.sub)
        return new Nack()
    }
  }

  private async processFailedVerification(
    data: RabbitMessageDto,
    verification: ResponseVerificationIdentityCardDto
  ) {
    // Update user tier to failed verification status
    await this.cognitoSubservice.changeTier(
      data.msg.user.idUser,
      CognitoUserAttributesTierEnum.NOT_VERIFIED_IDENTITY_CARD,
      data.msg.type
    )
    // Track failed verification attempt
    await this.bloomreachService.trackCustomer(data.msg.user.idUser)

    // Verify Cognito update was successful
    const newUserData = await this.cognitoSubservice.getDataFromCognito(data.msg.user.idUser)
    if (
      newUserData[CognitoUserAttributesEnum.TIER] ===
      CognitoUserAttributesTierEnum.QUEUE_IDENTITY_CARD
    ) {
      // Cognito sync failed - requeue for retry
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
      // Send verification rejection email to user
      try {
        const firstName = data.msg.user?.given_name
        const email = data.msg.user?.email
        if (!email) {
          this.logger.error(
            "Error - no email sent, couldn't find given_name or email in user object: ",
            JSON.stringify(data.msg.user)
          )
        } else {
          await this.mailgunSubservice.sendEmail('2023-identity-check-rejected', {
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
      // Log verification failure for audit
      this.logger.error({
        type: 'Not Verified without error - 200',
        user: data.msg.user,
        error: verification,
      })
      return new Nack()
    }
  }

  private async ProcessVerificationFailedWithoutError(
    data: RabbitMessageDto,
    verification: ResponseVerificationIdentityCardDto
  ) {
    // Log external service failure
    this.logger.error(
      this.throwerErrorGuard.InternalServerErrorException(
        VerificationErrorsEnum.NOT_VERIFIED_WITHOUT_ERROR,
        VerificationErrorsResponseEnum.NOT_VERIFIED_WITHOUT_ERROR,
        { user: data.msg.user, error: verification }
      )
    )

    // Requeue with exponential backoff for retry when services recover
    const userFromDb = await this.databaseSubservice.requeuedInVerificationIncrement(data.msg.user)
    const delay = rabbitmqRequeueDelay(userFromDb.requeuedInVerification)
    await this.amqpConnection.publish(RABBIT_MQ.EXCHANGE, RABBIT_MQ.QUEUE, data, {
      headers: {
        'x-delay': delay,
      },
    })
    return new Nack()
  }

  private async ProcessVerificationSuccess(
    data: RabbitMessageDto,
    verification: ResponseVerificationIdentityCardDto
  ) {
    // Update user tier to verified status in Cognito
    await this.cognitoSubservice.changeTier(
      data.msg.user.idUser,
      CognitoUserAttributesTierEnum.IDENTITY_CARD,
      data.msg.type
    )
    // Track successful verification for analytics
    await this.bloomreachService.trackCustomer(data.msg.user.idUser)

    // Verify that Cognito update was successful
    const newUserData = await this.cognitoSubservice.getDataFromCognito(data.msg.user.idUser)
    if (
      newUserData[CognitoUserAttributesEnum.TIER] ===
      CognitoUserAttributesTierEnum.QUEUE_IDENTITY_CARD
    ) {
      // Cognito sync failed - requeue for retry
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
      // Success: Send verification success email to user
      try {
        const firstName = data.msg.user?.given_name
        const email = data.msg.user?.email
        if (!email) {
          this.logger.error(
            "Error - no email sent, couldn't find email in user object: ",
            JSON.stringify(data.msg.user)
          )
        } else {
          await this.mailgunSubservice.sendEmail('2023-identity-check-successful', {
            to: email,
            variables: {
              firstName: firstName ?? null,
            },
          })
        }
      } catch (error) {
        this.logger.error('Error while sending verification success email: ', error)
      }
      // Log verification success for audit purposes
      this.errorMessengerGuard.verificationQueueLog(
        data.msg.user,
        verification,
        newUserData[CognitoUserAttributesEnum.TIER]
      )
      return new Nack()
    }
  }

  async verifyUserWithEid(
    user: CognitoGetUserData,
    oboToken: string
  ): Promise<ResponseVerificationDto> {
    const jwtToken = createUserJwtToken(oboToken)
    try {
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

    if (type === 'rc') {
      let birthNumber: string = payload.sub.split('_')[0].split('/').at(-1)
      birthNumber = birthNumber.replaceAll('/', '')

      const response = await this.databaseSubservice.checkAndCreateUserIfoAndBirthNumber(
        user,
        null,
        birthNumber,
        0
      )
      if (response.statusCode !== 200) {
        throw this.throwerErrorGuard.UnprocessableEntityException(
          VerificationErrorsEnum.VERIFY_EID_ERROR,
          VerificationErrorsResponseEnum.VERIFY_EID_ERROR,
          'Failed to verify FO with birth number'
        )
      }
    }

    if (type === 'ico') {
      const ico = payload.sub.split('/').at(-1)
      let birthNumber: string = payload.actor.sub.split('_')[0].split('/').at(-1)
      birthNumber = birthNumber.replaceAll('/', '')
      const response = await this.databaseSubservice.checkAndCreateLegalPersonIcoAndBirthNumber(
        user,
        ico,
        birthNumber
      )
      if (response.statusCode !== 200) {
        throw this.throwerErrorGuard.UnprocessableEntityException(
          VerificationErrorsEnum.VERIFY_EID_ERROR,
          VerificationErrorsResponseEnum.VERIFY_EID_ERROR,
          'Failed to verify PO with ico and birth number'
        )
      }
    }

    await this.cognitoSubservice.changeTier(
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

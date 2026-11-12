import {
  CognitoGetUserData,
  CognitoUserAccountTypesEnum,
} from '../../utils/global-dtos/cognito.dto'
import { RequestBodyVerifyIdentityCardDto } from './requests.verification.dto'

export interface IdentityCardVerificationRequest {
  user: CognitoGetUserData
  data: RequestBodyVerifyIdentityCardDto
  // TODO: Remove in the release after the one that removed the ico-rpo guard from
  // VerificationService.onQueueConsumption, together with `type` in VerificationService.sendToQueue.
  // Not read anymore, only physical entities are queued. Still sent, because older pods Nack messages
  // without `type`: prod3.34.1 marks the user NOT_VERIFIED_IDENTITY_CARD, prod3.34.0 and older leave
  // the user stuck in QUEUE_IDENTITY_CARD. This can happen during the rollout, after a rollback,
  // or with requeues delayed by up to an hour.
  type: CognitoUserAccountTypesEnum.PHYSICAL_ENTITY
}

/** RabbitMQ message with a request to verify a user by identity card. */
export interface IdentityCardVerificationQueueMessage {
  msg: IdentityCardVerificationRequest
}

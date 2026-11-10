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
  // Not read anymore, only physical entities are queued. Still sent, because pods running prod3.34.1
  // or older drop messages without `type` (and mark the user NOT_VERIFIED_IDENTITY_CARD) during
  // the rollout, after a rollback, or from requeues delayed by up to an hour.
  type: CognitoUserAccountTypesEnum
}

/** RabbitMQ message with a request to verify a user by identity card. */
export interface IdentityCardVerificationQueueMessage {
  msg: IdentityCardVerificationRequest
}

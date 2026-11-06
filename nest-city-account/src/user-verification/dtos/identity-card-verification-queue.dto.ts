import {
  CognitoGetUserData,
  CognitoUserAccountTypesEnum,
} from '../../utils/global-dtos/cognito.dto'
import { RequestBodyVerifyIdentityCardDto } from './requests.verification.dto'

export interface IdentityCardVerificationRequest {
  user: CognitoGetUserData
  data: RequestBodyVerifyIdentityCardDto
  // TODO: Only physical entities are queued since the removal of ico-rpo verification.
  // Still sent, because pods running older code Nack messages without it during the deploy.
  // Read only by the guard in VerificationService.onQueueConsumption dropping leftover ico-rpo messages.
  // Remove together with that guard once the ico-rpo removal is fully deployed.
  type: CognitoUserAccountTypesEnum
}

/** RabbitMQ message with a request to verify a user by identity card. */
export interface IdentityCardVerificationQueueMessage {
  msg: IdentityCardVerificationRequest
}

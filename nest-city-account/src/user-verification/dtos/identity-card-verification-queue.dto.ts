import {
  CognitoGetUserData,
  CognitoUserAccountTypesEnum,
} from '../../utils/global-dtos/cognito.dto'
import { RequestBodyVerifyIdentityCardDto } from './requests.verification.dto'

export interface IdentityCardVerificationRequest {
  user: CognitoGetUserData
  data: RequestBodyVerifyIdentityCardDto
  // TODO: Not read since the removal of ico-rpo verification, only physical entities are queued.
  // Still sent, because pods running older code Nack messages without it during the deploy.
  // Remove once the ico-rpo removal is fully deployed.
  type: CognitoUserAccountTypesEnum
}

/** RabbitMQ message with a request to verify a user by identity card. */
export interface IdentityCardVerificationQueueMessage {
  msg: IdentityCardVerificationRequest
}

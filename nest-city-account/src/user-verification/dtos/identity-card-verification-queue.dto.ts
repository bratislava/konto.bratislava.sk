import { CognitoGetUserData } from '../../utils/global-dtos/cognito.dto'
import { RequestBodyVerifyIdentityCardDto } from './requests.verification.dto'

export interface IdentityCardVerificationRequest {
  user: CognitoGetUserData
  data: RequestBodyVerifyIdentityCardDto
}

/** RabbitMQ message with a request to verify a user by identity card. */
export interface IdentityCardVerificationQueueMessage {
  msg: IdentityCardVerificationRequest
}

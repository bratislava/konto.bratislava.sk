import {
  CognitoGetUserData,
  CognitoUserAccountTypesEnum,
} from '../../utils/global-dtos/cognito.dto'
import {
  RequestBodyVerifyIdentityCardDto,
  RequestBodyVerifyWithRpoDto,
} from './requests.verification.dto'

export interface RabbitMessageDto {
  msg: {
    user: CognitoGetUserData
    data: RequestBodyVerifyWithRpoDto | RequestBodyVerifyIdentityCardDto
    type: CognitoUserAccountTypesEnum
  }
}

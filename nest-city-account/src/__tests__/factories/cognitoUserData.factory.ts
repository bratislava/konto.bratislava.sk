import {
  CognitoGetUserData,
  CognitoUserAccountTypesEnum,
  CognitoUserAttributesEnum,
} from '../../utils/global-dtos/cognito.dto'

export const cognitoUserDataFactory = (
  overrides: Partial<CognitoGetUserData> = {}
): CognitoGetUserData => ({
  sub: 'sub-id',
  idUser: 'sub-id',
  email: 'test@example.com',
  Enabled: true,
  [CognitoUserAttributesEnum.ACCOUNT_TYPE]: CognitoUserAccountTypesEnum.PHYSICAL_ENTITY,
  ...overrides,
})

export enum UserErrorsEnum {
  COGNITO_TYPE_ERROR = 'COGNITO_TYPE_ERROR',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  NO_EXTERNAL_ID = 'NO_EXTERNAL_ID',
}

export enum UserErrorsResponseEnum {
  COGNITO_TYPE_ERROR = 'Unexpected Cognito User Account Type',
  USER_NOT_FOUND = 'User not found in database',
  NO_EXTERNAL_ID = 'User does not have cognito external id',
}

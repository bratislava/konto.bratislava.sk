export enum VerificationErrorsEnum {
  RFO_ACCESS_ERROR = 'RFO_ACCESS_ERROR',
  RFO_NOT_RESPONDING = 'RFO_NOT_RESPONDING',
  RPO_NOT_RESPONDING = 'RPO_NOT_RESPONDING',
  DEAD_PERSON = 'DEAD_PERSON',
  BIRTH_NUMBER_AND_IDENTITY_CARD_INCONSISTENCY = 'BIRTH_NUMBER_AND_IDENTITY_CARD_INCONSISTENCY',
  BIRTHNUMBER_IFO_DUPLICITY = 'BIRTHNUMBER_IFO_DUPLICITY',
  BIRTHNUMBER_ICO_DUPLICITY = 'BIRTHNUMBER_ICO_DUPLICITY',
  BIRTH_NUMBER_NOT_EXISTS = 'BIRTH_NUMBER_NOT_EXISTS',
  BIRTH_NUMBER_WRONG_FORMAT = 'BIRTH_NUMBER_WRONG_FORMAT',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INVALID_CAPTCHA = 'INVALID_CAPTCHA',
  VERIFY_EID_ERROR = 'VERIFY_EID_ERROR',
  UNEXPECTED_UPVS_RESPONSE = 'UNEXPECTED_UPVS_RESPONSE',
  RPO_FIELD_NOT_EXISTS = 'RPO_FIELD_NOT_EXISTS',
  ICO_NOT_PROVIDED = 'ICO_NOT_PROVIDED',
  IFO_NOT_PROVIDED = 'IFO_NOT_PROVIDED',
  EMPTY_RFO_RESPONSE = 'EMPTY_RFO_RESPONSE',
  EMPTY_RPO_RESPONSE = 'EMPTY_RPO_RESPONSE',
}

export enum VerificationErrorsResponseEnum {
  ICO_NOT_PROVIDED = 'Unable to verify LEGAL_ENTITY or SELF_EMPLOYED_ENTITY, ico not provided',
  IFO_NOT_PROVIDED = 'Ifo for verification was not provided',
  BIRTH_NUMBER_NOT_PROVIDED = 'Unable to verify PHYSICAL_ENTITY, birth number (rc) not provided',
  BIRTHNUMBER_IFO_DUPLICITY = 'Duplicity of birth number. This user is already registered with a different account.',
  VERIFY_EID_ERROR = 'Failed to verify user with eid.',
  UNEXPECTED_UPVS_RESPONSE = 'Unexpected UPVS response.',
  INVALID_CAPTCHA = 'Invalid captcha token. Please try again. If the problem persists and you are not robot, please contact support.',
  DATABASE_ERROR = 'Error to write or update or read from/to database',
}

export enum SendToQueueErrorsEnum {
  COGNITO_CHANGE_TIER_ERROR = 'COGNITO_CHANGE_TIER_ERROR',
  RABBIT_PUSH_DATA_ERROR = 'RABBIT_PUSH_DATA_ERROR',
}

export enum SendToQueueErrorsResponseEnum {
  COGNITO_CHANGE_TIER_ERROR = 'Error in change cognito tier.',
  RABBIT_PUSH_DATA_ERROR = 'Error to push data to rabbit',
}

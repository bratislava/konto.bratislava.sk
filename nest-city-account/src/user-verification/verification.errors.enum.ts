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
  RFO_RESPONSE_MISSING_DOKLADY = 'RFO_RESPONSE_MISSING_DOKLADY',
  EMPTY_RPO_RESPONSE = 'EMPTY_RPO_RESPONSE',
  NOT_VERIFIED_WITHOUT_ERROR = 'NOT_VERIFIED_WITHOUT_ERROR',
}

export enum VerificationErrorsResponseEnum {
  ICO_NOT_PROVIDED = 'Ico for verification was not provided.',
  IFO_NOT_PROVIDED = 'Ifo for verification was not provided.',
  BIRTHNUMBER_IFO_DUPLICITY = 'Duplicity of birth number. This user is already registered with a different account.',
  VERIFY_EID_ERROR = 'Failed to verify user with eid.',
  UNEXPECTED_UPVS_RESPONSE = 'Unexpected UPVS response.',
  INVALID_CAPTCHA = 'Invalid captcha token. Please try again. If the problem persists and you are not robot, please contact support.',
  DATABASE_ERROR = 'Error to write or update or read from/to database.',
  RFO_RESPONSE_MISSING_DOKLADY = 'Fro returned empty doklady field for identity card.',
  DEAD_PERSON = 'User is not alive in registry.',
  BIRTH_NUMBER_AND_IDENTITY_CARD_INCONSISTENCY = 'This identity card number is not matching identity card for birthNumber',
  NOT_VERIFIED_WITHOUT_ERROR = 'User not verified without error (Error from external service).',
  BIRTHNUMBER_ICO_DUPLICITY = 'Duplicity of ICO - birth number pair. This user is already registered with different account.',
  BIRTH_NUMBER_NOT_EXISTS = 'Birth number does not exists in registry.',
  BIRTH_NUMBER_WRONG_FORMAT = 'Birth number has wrong format.',
}

export enum SendToQueueErrorsEnum {
  COGNITO_CHANGE_TIER_ERROR = 'COGNITO_CHANGE_TIER_ERROR',
  RABBIT_PUSH_DATA_ERROR = 'RABBIT_PUSH_DATA_ERROR',
}

export enum SendToQueueErrorsResponseEnum {
  COGNITO_CHANGE_TIER_ERROR = 'Error in change cognito tier.',
  RABBIT_PUSH_DATA_ERROR = 'Error to push data to rabbit.',
}

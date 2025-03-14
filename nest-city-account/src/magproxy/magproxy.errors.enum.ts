export enum MagproxyErrorsEnum {
  AXIOS_ERROR = 'AXIOS_ERROR',
  BIRTH_NUMBER_NOT_EXISTS = 'BIRTH_NUMBER_NOT_EXISTS',
  RFO_UNEXPECTED_RESPONSE = 'RFO_UNEXPECTED_RESPONSE',
  RPO_UNEXPECTED_RESPONSE = 'RPO_UNEXPECTED_RESPONSE',
  RFO_ACCESS_ERROR = 'RFO_ACCESS_ERROR',
  RFO_DATA_ARRAY_EXPECTED = 'RFO_DATA_ARRAY_EXPECTED',
}

export enum MagproxyErrorsResponseEnum {
  AXIOS_ERROR = 'Axios error.',
  BIRTHNUMBER_NOT_EXISTS = 'Birth number does not exists in registry.',
  RFO_UNEXPECTED_RESPONSE = 'There is problem with unexpected RFO registry response. More details in app logs.',
  RPO_UNEXPECTED_RESPONSE = 'There is problem with unexpected RPO registry response. More details in app logs.',
  RFO_ACCESS_ERROR = 'There is problem with authentication to registry. More details in app logs.',
  RFO_DATA_ARRAY_EXPECTED = 'Invalid data received (expected array), aborting.',
}

export enum SharepointErrorsEnum {
  UNKNOWNN_TYPE_IN_SHAREPOINT_DATA = 'UNKNOWNN_TYPE_IN_SHAREPOINT_DATA',
  ACCESS_TOKEN_ERROR = 'ACCESS_TOKEN_ERROR',
  UNKNOWN_COLUMN = 'UNKNOWN_COLUMN',
  SHAREPOINT_DATA_NOT_PROVIDED = 'SHAREPOINT_DATA_NOT_PROVIDED',
  POST_DATA_TO_SHAREPOINT_ERROR = 'POST_DATA_TO_SHAREPOINT_ERROR',
  GENERAL_ERROR = 'GENERAL_ERROR',
}

export enum SharepointErrorsResponseEnum {
  UNKNOWNN_TYPE_IN_SHAREPOINT_DATA = 'Type provided in columnMap in sharepoint data is unknown.',
  ACCESS_TOKEN_ERROR = 'There was an error when getting access token from sharepoint.',
  UNKNOWN_COLUMN = 'Specified column was not found in the sharepoint table.',
  SHAREPOINT_DATA_NOT_PROVIDED = 'Some necessary fields are missing from sharepointData.',
  POST_DATA_TO_SHAREPOINT_ERROR = 'Error when posting data to Sharepoint.',
  GENERAL_ERROR = 'An error occurred while posting data to Sharepoint. Probably caused by a different error.',
}

export enum FormSenderErrorsEnum {
  SEND_POLICY_NOT_POSSIBLE = 'SEND_POLICY_NOT_POSSIBLE',
  SEND_POLICY_NOT_ALLOWED_FOR_USER = 'SEND_POLICY_NOT_ALLOWED_FOR_USER',
  FORM_VERSION_NOT_COMPATIBLE = 'FORM_VERSION_NOT_COMPATIBLE',
  UNABLE_ADD_FORM_TO_RABBIT = 'UNABLE_ADD_FORM_TO_RABBIT',
  INFECTED_FILE = 'INFECTED_FILE',
  FILE_NOT_SCANNED = 'FILE_NOT_SCANNED',
  FORM_SUMMARY_GENERATION_ERROR = 'FORM_SUMMARY_GENERATION_ERROR',
  CREATE_PDF_IMAGE_ERROR = 'CREATE_PDF_IMAGE_ERROR',
  SEND_TO_GINIS_ERROR = 'SEND_TO_GINIS_ERROR',
}

export enum FormSenderErrorsResponseEnum {
  SEND_POLICY_NOT_POSSIBLE = 'Sending is not possible for this form.',
  SEND_POLICY_NOT_ALLOWED_FOR_USER = 'Sending is not allowed for this user.',
  FORM_VERSION_NOT_COMPATIBLE = 'Form version is not compatible for sending.',
  UNABLE_ADD_FORM_TO_RABBIT = 'There was an issue sending form to rabbitmq.',
  INFECTED_FILE = 'This form contains an infected file.',
  FILE_NOT_SCANNED = "This form contains a file that hasn't been scanned.",
  FORM_SUMMARY_GENERATION_ERROR = 'Error while generating form summary.',
  CREATE_PDF_IMAGE_ERROR = 'Error while creating pdf image.',
  SEND_TO_GINIS_ERROR = 'There was an error when sending to Ginis.',
}

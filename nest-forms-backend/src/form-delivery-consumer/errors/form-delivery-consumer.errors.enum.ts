export enum FormDeliveryConsumerErrorsEnum {
  MAX_TRIES_REACHED = 'MAX_TRIES_REACHED',
  SENDING_EMAIL_FAILED = 'SENDING_EMAIL_FAILED',
  WEBHOOK_ERROR = 'WEBHOOK_ERROR',
}

export enum FormDeliveryConsumerErrorsResponseEnum {
  MAX_TRIES_REACHED = 'Max tries reached for form.',
  SENDING_EMAIL_FAILED = 'Sending email of form has failed.',
  WEBHOOK_ERROR = 'Sending webhook of form has failed.',
}

export enum FormsErrorsEnum {
  FORM_NOT_FOUND_ERROR = 'FORM_NOT_FOUND_ERROR',
  FORM_OR_USER_NOT_FOUND_ERROR = 'FORM_OR_USER_ID_NOT_FOUND_ERROR',
  FORM_NOT_DRAFT_ERROR = 'FORM_NOT_DRAFT_ERROR',
  FORM_IS_OWNED_BY_SOMEONE_ELSE_ERROR = 'FORM_IS_OWNED_BY_SOMEONE_ELSE_ERROR',
  FORM_DATA_INVALID = 'FORM_DATA_INVALID',
}

export enum FormsErrorsResponseEnum {
  FORM_NOT_FOUND_ERROR = 'Form with provided id was not found.',
  FORM_OR_USER_NOT_FOUND_ERROR = 'Form or user not found.',
  FORM_NOT_DRAFT_ERROR = 'Form is not in draft state. It was already sent for processing.',
  FORM_IS_OWNED_BY_SOMEONE_ELSE_ERROR = 'Form is owned by someone else.',
  FORM_DATA_INVALID = 'The form data provided is invalid.',
}

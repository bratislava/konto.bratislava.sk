export enum FormsErrorsEnum {
  FORM_NOT_FOUND_ERROR = 'FORM_NOT_FOUND_ERROR',
  FORM_OR_USER_NOT_FOUND_ERROR = 'FORM_OR_USER_ID_NOT_FOUND_ERROR',
  NO_FORM_XML_DATA_ERROR = 'NO_FORM_XML_DATA_ERROR',
  FORM_NOT_EDITABLE_ERROR = 'FORM_NOT_EDITABLE_ERROR',
  FORM_IS_OWNED_BY_SOMEONE_ELSE_ERROR = 'FORM_IS_OWNED_BY_SOMEONE_ELSE_ERROR',
  FORM_DATA_INVALID = 'FORM_DATA_INVALID',
}

export enum FormsErrorsResponseEnum {
  FORM_NOT_FOUND_ERROR = 'Form with provided id was not found.',
  FORM_OR_USER_NOT_FOUND_ERROR = 'Form or user not found.',
  NO_FORM_XML_DATA_ERROR = 'Form has no formDataXml. Please fill the form first with form update endpoint.',
  FORM_NOT_EDITABLE_ERROR = 'Form is not editable. It was already sent for processing, or there is an error.',
  FORM_IS_OWNED_BY_SOMEONE_ELSE_ERROR = 'Form is owned by someone else.',
  FORM_DATA_INVALID = 'The form data provided is invalid.',
}

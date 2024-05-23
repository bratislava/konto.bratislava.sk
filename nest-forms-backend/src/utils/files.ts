// PDF_FORM_FAKE_FILE_ID is used to tell GinisService functions that they shouldn't look for this file in database
export const PDF_FORM_FAKE_FILE_ID = 'pdf-form-fake-id'
export const fileIdIsValid = (fileId: string): boolean =>
  fileId !== PDF_FORM_FAKE_FILE_ID
export const PDF_EXPORT_FILE_NAME = 'pdf-export.pdf'

import * as jwt from 'jsonwebtoken'

import { FormWithFiles } from './types/prisma'

// PDF_FORM_FAKE_FILE_ID is used to tell GinisService functions that they shouldn't look for this file in database
export const PDF_FORM_FAKE_FILE_ID = 'pdf-form-fake-id'
export const fileIdIsValid = (fileId: string): boolean =>
  fileId !== PDF_FORM_FAKE_FILE_ID
export const PDF_EXPORT_FILE_NAME = 'pdf-export.pdf'

export const getFileIdsToUrlMap = (
  form: FormWithFiles,
  jwtSecret: string,
  selfUrl: string,
): Record<string, { url: string; fileName: string }> => {
  const result: Record<string, { url: string; fileName: string }> = {}
  form.files?.forEach((file) => {
    const token = jwt.sign({ fileId: file.id }, jwtSecret, {
      expiresIn: '5y',
    })
    result[file.id] = {
      url: `${selfUrl}/files/download/file/${token}`,
      fileName: file.fileName,
    }
  })
  return result
}

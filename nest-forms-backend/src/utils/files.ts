import { GenericObjectType } from '@rjsf/utils'
import * as jwt from 'jsonwebtoken'
import { mapValues } from 'lodash'

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
): Record<string, string> => {
  const result: Record<string, string> = {}
  form.files.forEach((file) => {
    const token = jwt.sign({ fileId: file.id }, jwtSecret, {
      expiresIn: '5y',
    })
    result[file.id] = `${selfUrl}/files/download/file/${token}`
  })
  return result
}

// Replace file IDs with URLs in formData
// we don't check against schema for file fileIds, we only look for file id strings in all of the values and replace them with urls
export const replaceFileIdsWithUrls = (
  obj: GenericObjectType,
  fileIdUrlMap: Record<string, string>,
): GenericObjectType => {
  const mappingFn = (value: unknown): unknown => {
    if (typeof value === 'string' && fileIdUrlMap[value]) {
      return fileIdUrlMap[value]
    }
    if (!value || typeof value !== 'object') return value
    if (typeof value === 'object') {
      return replaceFileIdsWithUrls(value as GenericObjectType, fileIdUrlMap)
    }
    return value
  }

  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) {
    return obj.map((item) => mappingFn(item))
  }
  return mapValues(obj, (item) => mappingFn(item))
}

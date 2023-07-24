import { GenericObjectType, getDefaultFormState, RJSFSchema, ValidatorType } from '@rjsf/utils'
import { customizeValidator } from '@rjsf/validator-ajv8'
import Ajv, { FuncKeywordDefinition } from 'ajv'

import { FormFileUploadFileInfo } from '../types/formFileUploadTypes'

export const ajvBaseKeywords: FuncKeywordDefinition[] = [
  {
    keyword: 'comment',
  },
  {
    keyword: 'example',
  },
  {
    keyword: 'timeFromTo',
  },
  {
    keyword: 'dateFromTo',
  },
  {
    keyword: 'pospID',
  },
  {
    keyword: 'pospVersion',
  },
  {
    keyword: 'ciselnik',
  },
]

export const ajvFormats = {
  zip: /\b\d{5}\b/,
  time: /^[0-2]\d:[0-5]\d$/,
  ciselnik: () => true,
  file: () => true,
  date: () => true,
  localTime: () => true,
  email: () => true,
}

export const getFileIds = (schema: RJSFSchema, formData: GenericObjectType) => {
  const files: string[] = []
  const instance = new Ajv({
    // strict: true,
    allErrors: true,
    keywords: [
      ...ajvBaseKeywords,
      {
        keyword: 'isFile',
        validate: (schema, data) => {
          if (data) {
            files.push(data)
          }
          return true
        },
      },
    ],
    formats: ajvFormats,
  })
  instance.validate(schema, formData)

  return files
}

export const validateSummary = (
  schema: RJSFSchema,
  formData: GenericObjectType,
  getFileInfoById: (id: string) => FormFileUploadFileInfo,
) => {
  const infectedFiles: FormFileUploadFileInfo[] = []
  const scanningFiles: FormFileUploadFileInfo[] = []

  const validator: ValidatorType = customizeValidator({
    customFormats: ajvFormats,
    ajvOptionsOverrides: {
      keywords: [
        ...ajvBaseKeywords,
        {
          keyword: 'isFile',
          validate: (schema, data) => {
            if (data) {
              const fileInfo = getFileInfoById(data)
              if (fileInfo.status.type === 'ScanInfected') {
                infectedFiles.push(fileInfo)
                return false
              }
              if (fileInfo.status.type === 'Scanning' || fileInfo.status.type === 'UploadDone') {
                scanningFiles.push(fileInfo)
              }
              if (
                fileInfo.status.type === 'ScanError' ||
                fileInfo.status.type === 'UploadError' ||
                fileInfo.status.type === 'UnknownFile'
              ) {
                return false
              }
            }

            return true
          },
        },
      ],
    },
  })

  const defaultFormData = getDefaultFormState(validator, schema, formData)
  const { errorSchema } = validator.validateFormData(defaultFormData, schema)

  return { infectedFiles, scanningFiles, errorSchema }
}

export const validator: ValidatorType = customizeValidator({
  customFormats: ajvFormats,
  ajvOptionsOverrides: {
    keywords: [
      ...ajvBaseKeywords,
      {
        keyword: 'isFile',
      },
    ],
  },
})

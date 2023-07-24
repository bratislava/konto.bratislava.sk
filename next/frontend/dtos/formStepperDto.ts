import {
  Experimental_DefaultFormStateBehavior,
  GenericObjectType,
  getDefaultFormState,
  RJSFSchema,
  ValidatorType,
} from '@rjsf/utils'
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
    strict: true,
    allErrors: true,
    keywords: [
      ...ajvBaseKeywords,
      {
        keyword: 'file',
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

const validateFile = (fileInfo: FormFileUploadFileInfo) => {
  if (['ScanInfected', 'ScanError', 'UploadError', 'UnknownFile'].includes(fileInfo.status.type)) {
    return false
  }

  return true
}

export const defaultFormStateBehavior: Experimental_DefaultFormStateBehavior = {
  arrayMinItems: { populate: 'never' },
}

export const validateSummary = (
  schema: RJSFSchema,
  formData: GenericObjectType,
  getFileInfoById: (id: string) => FormFileUploadFileInfo,
) => {
  const infectedFiles: FormFileUploadFileInfo[] = []
  const scanningFiles: FormFileUploadFileInfo[] = []
  const scanErrorFiles: FormFileUploadFileInfo[] = []

  const validator: ValidatorType = customizeValidator({
    customFormats: ajvFormats,
    ajvOptionsOverrides: {
      strict: true,
      keywords: [
        ...ajvBaseKeywords,
        {
          keyword: 'file',
          validate: (schemaInner, data) => {
            if (data) {
              if (typeof data !== 'string') {
                return false
              }
              const fileInfo = getFileInfoById(data)

              if (fileInfo.status.type === 'ScanError') {
                scanErrorFiles.push(fileInfo)
              }
              if (fileInfo.status.type === 'ScanInfected') {
                infectedFiles.push(fileInfo)
              }
              if (fileInfo.status.type === 'Scanning' || fileInfo.status.type === 'UploadDone') {
                scanningFiles.push(fileInfo)
              }

              return validateFile(fileInfo)
            }

            return true
          },
        },
        {
          keyword: 'fileArray',
          validate: (schemaInner, data) => {
            if (data && Array.isArray(data)) {
              const validatedFiles = data.map((fileId) => {
                if (typeof fileId !== 'string') {
                  return false
                }

                return validateFile(getFileInfoById(fileId))
              })
              return validatedFiles.every(Boolean)
            }

            return true
          },
        },
      ],
    },
  })

  const defaultFormData = getDefaultFormState(
    validator,
    schema,
    formData,
    undefined,
    undefined,
    defaultFormStateBehavior,
  )
  const { errorSchema } = validator.validateFormData(defaultFormData, schema)

  return { infectedFiles, scanningFiles, scanErrorFiles, errorSchema }
}

export const validator: ValidatorType = customizeValidator({
  customFormats: ajvFormats,
  ajvOptionsOverrides: {
    strict: true,
    keywords: [
      ...ajvBaseKeywords,
      {
        keyword: 'file',
      },
      {
        keyword: 'fileArray',
      },
    ],
  },
})

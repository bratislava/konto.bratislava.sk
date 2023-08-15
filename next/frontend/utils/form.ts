import {
  Experimental_DefaultFormStateBehavior,
  GenericObjectType,
  getDefaultFormState,
  RJSFSchema,
  ValidatorType,
} from '@rjsf/utils'
import { customizeValidator } from '@rjsf/validator-ajv8'
import type { Options, SchemaValidateFunction } from 'ajv'
import Ajv from 'ajv'
import traverse from 'traverse'
import { validate as validateUuid, version as uuidVersion } from 'uuid'

import { FormFileUploadFileInfo, FormFileUploadStatusEnum } from '../types/formFileUploadTypes'

/**
 * This is a custom prop that is passed to RJSF components / functions. Make sure to pass it to all
 * of them to ensure consistent behaviour.
 *
 * The default behaviour of RJSF is to prefill all the arrays with minKeys value, with default or
 * `null` value. This make sense for string fields (if there are e.g. 2 required string fields, the
 * library will create 2 empty ones), however we don't want this behaviour as e.g. for files it doesn't
 * make sense (there is nothing such an empty file value).
 *
 * The library provides only `{ populate: 'requiredOnly' }`. `never` options is added by us by patching
 * the RJSF package (next/patches/@rjsf+utils+5.10.0.patch).
 *
 * The issue is also explained here: https://github.com/rjsf-team/react-jsonschema-form/issues/3796
 */
export const defaultFormStateBehavior: Experimental_DefaultFormStateBehavior = {
  arrayMinItems: { populate: 'never' },
}

/**
 * @param fileValidateFn - for special validators we want to implement file validation differently
 */
export const getAjvFormKeywords = (
  fileValidateFn?: SchemaValidateFunction,
): Options['keywords'] => {
  return [
    // TOOD: Remove
    {
      keyword: 'comment',
    },
    // TOOD: Remove
    {
      keyword: 'example',
    },
    // TOOD: Remove
    {
      keyword: 'timeFromTo',
    },
    // TOOD: Remove
    {
      keyword: 'dateFromTo',
    },
    {
      keyword: 'pospID',
    },
    {
      keyword: 'pospVersion',
    },
    // TODO: Improve validation
    {
      keyword: 'ciselnik',
    },
    {
      keyword: 'slug',
    },
    {
      keyword: 'file',
      validate: fileValidateFn,
    },
  ]
}
export const ajvFormats = {
  // TODO: Explore if only Slovak zip codes are supported
  zip: /\b\d{5}\b/,
  // TODO: Remove, but this is needed for form to compile
  ciselnik: () => true,
  localTime: () => true,
}

/**
 * Extracts used file UUIDs from form data.
 *
 * This is a naive implementation that extracts all the valid UUIDs, but is very performant compared
 * to the "normal" version.
 */
export const getFileUuidsNaive = (formData: GenericObjectType) => {
  return traverse(formData).reduce(function traverseFn(acc: string[], value) {
    if (
      this.isLeaf &&
      typeof value === 'string' &&
      validateUuid(value) &&
      uuidVersion(value) === 4
    ) {
      acc.push(value)
    }
    return acc
  }, []) as string[]
}

/**
 * Extracts used file UUIDs from form data.
 *
 * This uses (or abuses) a possibility to provide a custom validate function for AJV. This is only
 * one of few ways how to traverse the form data for specific values. In this case, we extract the
 * file ids from the form data.
 */
export const getFileUuids = (schema: RJSFSchema, formData: GenericObjectType) => {
  const files: string[] = []
  const fileValidateFn: SchemaValidateFunction = (innerSchema, data) => {
    if (data) {
      files.push(data as string)
    }
    return true
  }

  const instance = new Ajv({
    strict: true,
    allErrors: true,
    keywords: getAjvFormKeywords(fileValidateFn),
    formats: ajvFormats,
  })
  instance.validate(schema, formData)

  return files
}

/**
 * Returns whether file shouldn't have an error in summary. Although the other states might not be enough
 * for form to be sent, they are not erroneous (e.g. uploading).
 * @param fileInfo
 */
const validateFile = (fileInfo: FormFileUploadFileInfo) => {
  return (
    [
      FormFileUploadStatusEnum.UploadQueued,
      FormFileUploadStatusEnum.Uploading,
      FormFileUploadStatusEnum.UploadDone,
      FormFileUploadStatusEnum.Scanning,
      FormFileUploadStatusEnum.ScanDone,
    ] as FormFileUploadStatusEnum[]
  ).includes(fileInfo.status.type)
}

/**
 * Validates the summary and returns error schema and info about files.
 *
 * This uses (or abuses) a possibility to provide a custom validate function for AJV. This is only
 * one of few ways how to traverse the form data for specific values. In this case, we extract the
 * files we need to give a special attention in summary.
 */
export const validateSummary = (
  schema: RJSFSchema,
  formData: GenericObjectType,
  getFileInfoById: (id: string) => FormFileUploadFileInfo,
) => {
  const infectedFiles: FormFileUploadFileInfo[] = []
  const scanningFiles: FormFileUploadFileInfo[] = []
  const uploadingFiles: FormFileUploadFileInfo[] = []

  const fileValidateFn: SchemaValidateFunction = (schemaInner, data) => {
    if (!data) {
      return true
    }

    if (typeof data !== 'string') {
      return false
    }
    const fileInfo = getFileInfoById(data)

    if (
      fileInfo.status.type === FormFileUploadStatusEnum.UploadQueued ||
      fileInfo.status.type === FormFileUploadStatusEnum.Uploading
    ) {
      uploadingFiles.push(fileInfo)
    }
    if (fileInfo.status.type === FormFileUploadStatusEnum.ScanInfected) {
      infectedFiles.push(fileInfo)
    }
    if (
      fileInfo.status.type === FormFileUploadStatusEnum.Scanning ||
      fileInfo.status.type === FormFileUploadStatusEnum.UploadDone
    ) {
      scanningFiles.push(fileInfo)
    }

    return validateFile(fileInfo)
  }

  const validator: ValidatorType = customizeValidator({
    customFormats: ajvFormats,
    ajvOptionsOverrides: {
      strict: true,
      keywords: getAjvFormKeywords(fileValidateFn),
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

  return { infectedFiles, scanningFiles, uploadingFiles, errorSchema }
}

export const rjfsValidator = customizeValidator({
  customFormats: ajvFormats,
  ajvOptionsOverrides: {
    keywords: getAjvFormKeywords(),
  },
})

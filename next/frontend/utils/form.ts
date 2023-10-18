import {
  Experimental_DefaultFormStateBehavior,
  GenericObjectType,
  getDefaultFormState,
  RJSFSchema,
  ValidatorType,
} from '@rjsf/utils'
import { customizeValidator } from '@rjsf/validator-ajv8'
import { CustomValidatorOptionsType } from '@rjsf/validator-ajv8/src/types'
import type { Format, Options, SchemaValidateFunction } from 'ajv'
import Ajv from 'ajv'
import traverse from 'traverse'
import { validate as validateUuid, version as uuidVersion } from 'uuid'

import { FormFileUploadFileInfo, FormFileUploadStatusEnum } from '../types/formFileUploadTypes'

/**
 * This is a custom prop that is passed to RJSF components / functions. Make sure to pass it to all
 * of them to ensure consistent behaviour.
 *
 * The default behaviour of RJSF is to prefill all the arrays with minKeys value, with default or
 * `null` value. For most of our use-cases this doesn't make sense. As multiple file upload, select
 * with multiple options or checkbox groups are arrays, e.g. them having minKeys of 1 would make
 * RJSF to prefill them which would result to `[null]` value which is not correct.
 *
 * Unfortunately, there are cases where this behaviour is needed. For example, array fields contain
 * a list of objects, not prefilling them would require user to manually click "Add" button to add
 * the first item. This is not a good UX. Therefore, we implemented a patch that allows us to
 * override this behaviour for specific fields using `overrideArrayMinItemsBehaviour` keyword.
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
    // Top-level schema
    {
      keyword: 'pospID',
    },
    {
      keyword: 'pospVersion',
    },
    {
      keyword: 'slug',
    },
    // Step schema
    {
      keyword: 'hash',
    },
    {
      keyword: 'stepperTitle',
    },
    // File field schema
    {
      keyword: 'file',
      validate: fileValidateFn,
    },
    // Select field schema
    // TODO: Improve
    {
      keyword: 'ciselnik',
    },
    // Array field schema
    {
      keyword: 'overrideArrayMinItemsBehaviour',
    },
  ]
}

// Copy of https://github.com/ajv-validator/ajv-formats/blob/4dd65447575b35d0187c6b125383366969e6267e/src/formats.ts#L180C1-L186C2
function compareTime(s1: string, s2: string): number | undefined {
  if (!(s1 && s2)) return undefined
  const t1 = new Date(`2020-01-01T${s1}`).valueOf()
  const t2 = new Date(`2020-01-01T${s2}`).valueOf()
  if (!(t1 && t2)) return undefined
  return t1 - t2
}

export const ajvFormats = {
  zip: /\b\d{5}\b/,
  // TODO: Remove, but this is needed for form to compile
  ciselnik: () => true,
  // https://blog.kevinchisholm.com/javascript/javascript-e164-phone-number-validation/
  'phone-number': /^\+[1-9]\d{10,14}$/,
  localTime: {
    // https://stackoverflow.com/a/51177696
    validate: /^(\d|0\d|1\d|2[0-3]):[0-5]\d$/,
    compare: compareTime,
  },
} satisfies Record<string, Format>

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
    $data: true,
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
    // The type in @rjsf/validator-ajv8 is wrong.
    customFormats: ajvFormats as unknown as CustomValidatorOptionsType['customFormats'],
    ajvOptionsOverrides: {
      // RJSF doesn't support strict
      $data: true,
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

export const rjsfValidator = customizeValidator({
  // The type in @rjsf/validator-ajv8 is wrong.
  customFormats: ajvFormats as unknown as CustomValidatorOptionsType['customFormats'],
  ajvOptionsOverrides: {
    // RJSF doesn't support strict
    $data: true,
    keywords: getAjvFormKeywords(),
  },
})

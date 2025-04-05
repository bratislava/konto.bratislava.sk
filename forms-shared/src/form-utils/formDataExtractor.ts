import { GenericObjectType } from '@rjsf/utils'
import { getBaRjsfValidator } from './validators'
import { BAJSONSchema7 } from './ajvKeywords'

type StringGetter<T extends GenericObjectType> = (formData: T) => string | undefined

export function createFormDataExtractor<T extends GenericObjectType>(
  ajvSchema: BAJSONSchema7,
  stringGetter: StringGetter<T>,
): (formData: GenericObjectType | null) => string | undefined {
  const validator = getBaRjsfValidator()

  return (formData: GenericObjectType | null) => {
    if (validator.isValid(ajvSchema, formData, ajvSchema)) {
      return stringGetter(formData as T)
    } else {
      return undefined
    }
  }
}

export type FormDataExtractor = ReturnType<typeof createFormDataExtractor>

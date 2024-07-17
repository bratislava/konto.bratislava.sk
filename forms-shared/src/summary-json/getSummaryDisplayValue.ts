import { DateFormatter, parseDate } from '@internationalized/date'

import { JSONSchema7 } from 'json-schema'
import { validate, version } from 'uuid'

import { BaWidgetType, CheckboxUiOptions, SelectUiOptions } from '../generator/uiOptionsTypes'
import { WidgetProps } from '@rjsf/utils'
import { baTimeRegex } from '../form-utils/ajvFormats'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isFileUuid(value: any): boolean {
  return typeof value === 'string' && validate(value) && version(value) === 4
}

export enum SummaryDisplayValueType {
  String = 'String',
  File = 'File',
  Invalid = 'Invalid',
  None = 'None',
}

export type SummaryDisplayValue =
  | {
      type: SummaryDisplayValueType.String
      value: string
    }
  | {
      type: SummaryDisplayValueType.File
      id: string
    }
  | {
      type: SummaryDisplayValueType.Invalid
    }
  | {
      type: SummaryDisplayValueType.None
    }

export type SummaryDisplayValues = SummaryDisplayValue[]

const createStringValue = (value: string): SummaryDisplayValue => ({
  type: SummaryDisplayValueType.String,
  value,
})

const createFileValue = (id: string): SummaryDisplayValue => ({
  type: SummaryDisplayValueType.File,
  id,
})

const invalidValue: SummaryDisplayValue = {
  type: SummaryDisplayValueType.Invalid,
}

const noneValue: SummaryDisplayValue = {
  type: SummaryDisplayValueType.None,
}

const bratislavaTimeZone = 'Europe/Bratislava'

// TODO: Use shared date formatter
const dateFormatter = new DateFormatter('sk-SK', {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  timeZone: bratislavaTimeZone,
})

/**
 * Returns an array of values to display in the summary for a given field.
 *
 * Because some widgets can have multiple values (e.g. multi-select) it is easier to always return an array. If the
 * field has no value, the array will contain a single value with the type `None`. Files have a special type `File`
 * because they are displayed in their own way in the summary.
 *
 * The function returns value to display which doesn't have to be a valid value for the field, each widget type
 * requires its own treatment, some examples:
 *  - a number field with minimum value of 5 can have a value of 3, which is displayed as "3"
 *  - a number field with value "not-a-number" or {} is not a valid number, which is displayed as invalid
 *  - a string field with type "email" can have a value "not-an-email", which is displayed as "not-an-email"
 *  - a select field with options ["a", "b"] and its respective labels cannot have a value "c", which is displayed as
 *  invalid
 *  - a file upload field with a value that is not a valid UUID is displayed as invalid
 *  - a date field with a value that is not a valid date is displayed as invalid
 */
export const getSummaryDisplayValues = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  widgetType: BaWidgetType,
  schema: JSONSchema7,
  uiOptions: WidgetProps['options'],
): SummaryDisplayValues => {
  const isNullOrUndefined = value == null
  if (isNullOrUndefined) {
    return [noneValue]
  }

  if (widgetType === BaWidgetType.Select) {
    const selectUiOptions = uiOptions as SelectUiOptions

    const option = selectUiOptions.selectOptions?.[value]
    if (!option) {
      return [invalidValue]
    }

    return [createStringValue(option.title)]
  }
  if (widgetType === BaWidgetType.SelectMultiple) {
    const selectUiOptions = uiOptions as SelectUiOptions

    if (!Array.isArray(value)) {
      return [invalidValue]
    }

    if (value.length === 0) {
      return [noneValue]
    }

    return value.map((item) => {
      const option = selectUiOptions.selectOptions?.[item]
      if (!option) {
        return invalidValue
      }

      return createStringValue(option.title)
    })
  }
  if (widgetType === BaWidgetType.RadioGroup) {
    const option = uiOptions.enumOptions?.find((enumOption) => enumOption.value === value)
    if (!option) {
      return [invalidValue]
    }

    return [createStringValue(option.label)]
  }
  if (widgetType === BaWidgetType.Input) {
    const isString = schema.type === 'string' && typeof value === 'string'
    const isNumber =
      (schema.type === 'number' || schema.type === 'integer') && typeof value === 'number'

    if (isNumber) {
      // TODO: Format number
      return [createStringValue(value.toString())]
    }

    if (isString) {
      return [createStringValue(value)]
    }

    return [invalidValue]
  }
  if (widgetType === BaWidgetType.TextArea) {
    if (typeof value !== 'string') {
      return [invalidValue]
    }

    return [createStringValue(value)]
  }
  if (widgetType === BaWidgetType.TimePicker) {
    if (typeof value !== 'string' || !baTimeRegex.test(value)) {
      return [invalidValue]
    }

    return [createStringValue(value)]
  }
  if (widgetType === BaWidgetType.Checkbox) {
    if (typeof value !== 'boolean') {
      return [invalidValue]
    }

    const checkboxUiOptions = uiOptions as CheckboxUiOptions
    return value ? [createStringValue(checkboxUiOptions.checkboxLabel)] : [noneValue]
  }
  if (widgetType === BaWidgetType.CheckboxGroup) {
    if (!Array.isArray(value)) {
      return [invalidValue]
    }

    if (value.length === 0) {
      return [noneValue]
    }

    return value.map((item) => {
      const option = uiOptions.enumOptions?.find((optionInner) => optionInner.value === item)
      if (!option) {
        return invalidValue
      }

      return createStringValue(option.label)
    })
  }
  if (widgetType === BaWidgetType.FileUpload) {
    const isSingleFile = schema.type === 'string' && isFileUuid(value)
    const isMultiFile = schema.type === 'array' && Array.isArray(value)

    if (isSingleFile) {
      return [createFileValue(value)]
    }

    if (isMultiFile) {
      if (value.length === 0) {
        return [noneValue]
      }

      return value.map((item) => {
        if (!isFileUuid(item)) {
          return invalidValue
        }

        return createFileValue(item)
      })
    }

    return [invalidValue]
  }
  if (widgetType === BaWidgetType.DatePicker) {
    try {
      const parsed = parseDate(value as string)
      // TODO: Use shared date formatter
      const formatted = dateFormatter.format(parsed.toDate(bratislavaTimeZone))
      return [createStringValue(formatted)]
    } catch (error) {
      return [invalidValue]
    }
  } else {
    throw new Error(`Unsupported widget type: ${widgetType}`)
  }
}

import { DateFormatter, parseDate } from '@internationalized/date'

import { JSONSchema7 } from 'json-schema'

import {
  BaWidgetType,
  CheckboxGroupUiOptions,
  CheckboxUiOptions,
  NumberUiOptions,
  RadioGroupUiOptions,
  SelectUiOptions,
} from '../generator/uiOptionsTypes'
import { EnumOptionsType, WidgetProps } from '@rjsf/utils'
import { baTimeRegex, validateBaFileUuid } from '../form-utils/ajvFormats'
import { mergeEnumOptionsMetadata } from '../generator/optionItems'
import { WithEnumOptions } from '../form-utils/WithEnumOptions'

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

  if (widgetType === BaWidgetType.Select || widgetType === BaWidgetType.RadioGroup) {
    const uiOptionsWithType = uiOptions as WithEnumOptions<SelectUiOptions | RadioGroupUiOptions>
    const mergedMetadata = mergeEnumOptionsMetadata(
      uiOptionsWithType.enumOptions,
      uiOptionsWithType.enumMetadata,
    )
    const option = mergedMetadata.find((optionInner) => optionInner.value === value)
    if (!option) {
      return [invalidValue]
    }

    return [createStringValue(option.label)]
  }
  if (widgetType === BaWidgetType.SelectMultiple || widgetType === BaWidgetType.CheckboxGroup) {
    if (!Array.isArray(value)) {
      return [invalidValue]
    }

    if (value.length === 0) {
      return [noneValue]
    }

    const uiOptionsWithType = uiOptions as (SelectUiOptions | CheckboxGroupUiOptions) & {
      enumOptions: EnumOptionsType[]
    }
    const mergedMetadata = mergeEnumOptionsMetadata(
      uiOptionsWithType.enumOptions,
      uiOptionsWithType.enumMetadata,
    )

    return value.map((item) => {
      const option = mergedMetadata.find((optionInner) => optionInner.value === item)
      if (!option) {
        return invalidValue
      }

      return createStringValue(option.label)
    })
  }
  if (widgetType === BaWidgetType.Input || widgetType === BaWidgetType.TextArea) {
    if (typeof value !== 'string') {
      return [invalidValue]
    }

    return [createStringValue(value)]
  }
  if (widgetType === BaWidgetType.Number) {
    if (typeof value !== 'number') {
      return [invalidValue]
    }

    const uiOptionsWithType = uiOptions as WithEnumOptions<NumberUiOptions>

    const formatter = new Intl.NumberFormat('sk-SK', uiOptionsWithType.formatOptions)
    return [createStringValue(formatter.format(value))]
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
  if (widgetType === BaWidgetType.FileUpload) {
    if (validateBaFileUuid(value)) {
      return [createFileValue(value)]
    }

    return [invalidValue]
  }
  if (widgetType === BaWidgetType.FileUploadMultiple) {
    if (!Array.isArray(value)) {
      return [invalidValue]
    }

    if (value.length === 0) {
      return [noneValue]
    }

    return value.map((item) => {
      if (!validateBaFileUuid(item)) {
        return invalidValue
      }

      return createFileValue(item)
    })
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

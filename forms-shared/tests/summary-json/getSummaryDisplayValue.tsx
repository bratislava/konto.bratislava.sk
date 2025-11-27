import { describe, expect, test } from 'vitest'
import {
  getSummaryDisplayValues,
  SummaryDisplayValueType,
} from '../../src/summary-json/getSummaryDisplayValue'
import { BaWidgetType } from '../../src/generator/uiOptionsTypes'
import { RJSFSchema, WidgetProps } from '@rjsf/utils'
import { withTheme } from '@rjsf/core'
import { renderToString } from 'react-dom/server'
import React from 'react'
import { getBaFormDefaults } from '../../src/form-utils/formDefaults'
import { testValidatorRegistry } from '../../test-utils/validatorRegistry'
import { defaultFormFields } from '../../src/form-utils/defaultFormFields'
import { GeneratorField } from '../../src/generator/generatorTypes'
import { select } from '../../src/generator/functions/select'
import { selectMultiple } from '../../src/generator/functions/selectMultiple'
import { input } from '../../src/generator/functions/input'
import { number } from '../../src/generator/functions/number'
import { radioGroup } from '../../src/generator/functions/radioGroup'
import { textArea } from '../../src/generator/functions/textArea'
import { checkbox } from '../../src/generator/functions/checkbox'
import { checkboxGroup } from '../../src/generator/functions/checkboxGroup'
import { fileUpload } from '../../src/generator/functions/fileUpload'
import { datePicker } from '../../src/generator/functions/datePicker'
import { timePicker } from '../../src/generator/functions/timePicker'
import { object } from '../../src/generator/object'
import { fileUploadMultiple } from '../../src/generator/functions/fileUploadMultiple'

/**
 * RJSF heavily processes the schema and the uiSchema before rendering the specific widget. For example, for select-like
 * widgets `enumOptions` are added. To test the behavior exactly as it happens in the real form, we need to retrieve the
 * processed schema and uiOptions from the widget. This function renders the minimal form with the widget and retrieves
 * the values.
 */
const retrieveRuntimeValues = (field: GeneratorField) => {
  const widgetType = field.schema.baUiSchema?.['ui:widget'] as BaWidgetType
  if (!widgetType) {
    throw new Error('Widget type not set')
  }

  let retrievedSchema: RJSFSchema
  let retrievedOptions: WidgetProps['options']

  const Form = withTheme({
    widgets: {
      [widgetType]: (props: WidgetProps) => {
        retrievedSchema = props.schema
        retrievedOptions = props.options
        return null
      },
    },
    fields: defaultFormFields,
  })

  const { schema: wrapperSchema } = object('wrapper', {}, [field])
  renderToString(
    <Form schema={wrapperSchema} {...getBaFormDefaults(wrapperSchema, testValidatorRegistry)} />,
  )

  // @ts-expect-error TypeScript cannot detect that `retrievedSchema` and `retrievedOptions` are set in the widget
  if (!retrievedSchema || !retrievedOptions) {
    throw new Error('Schema and uiOptions not retrieved')
  }

  return { schema: retrievedSchema, uiOptions: retrievedOptions, widgetType }
}

describe('getSummaryDisplayValues', () => {
  describe('Select', () => {
    const field = select(
      'selectProperty',
      {
        title: 'Select Title',
        items: [
          { value: 'value-1', label: 'Label 1' },
          { value: 'value-2', label: 'Label 2' },
        ],
      },
      {},
    )
    const { schema, uiOptions, widgetType } = retrieveRuntimeValues(field)

    test('returns correct label for a valid single select value', () => {
      const result = getSummaryDisplayValues('value-1', widgetType, schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.String, value: 'Label 1' }])
    })

    test('returns invalid value for an unknown select value', () => {
      const result = getSummaryDisplayValues('unknown', widgetType, schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.Invalid }])
    })

    test('returns none value for undefined select value', () => {
      const result = getSummaryDisplayValues(undefined, widgetType, schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.None }])
    })

    test('returns invalid value for a multi select value passed to single select field', () => {
      const result = getSummaryDisplayValues(['value-1', 'value-2'], widgetType, schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.Invalid }])
    })
  })

  describe('Select Multiple', () => {
    const field = selectMultiple(
      'selectMultipleProperty',
      {
        title: 'Select Multiple Title',
        items: [
          { value: 'value-1', label: 'Label 1' },
          { value: 'value-2', label: 'Label 2' },
        ],
      },
      {},
    )
    const { schema, uiOptions, widgetType } = retrieveRuntimeValues(field)

    test('returns none value for an empty select multiple value', () => {
      const result = getSummaryDisplayValues([], widgetType, schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.None }])
    })

    test('returns correct label for a valid single select multiple value', () => {
      const result = getSummaryDisplayValues(['value-1'], widgetType, schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.String, value: 'Label 1' }])
    })

    test('returns correct labels for valid select multiple values', () => {
      const result = getSummaryDisplayValues(['value-1', 'value-2'], widgetType, schema, uiOptions)
      expect(result).toEqual([
        { type: SummaryDisplayValueType.String, value: 'Label 1' },
        { type: SummaryDisplayValueType.String, value: 'Label 2' },
      ])
    })

    test('returns correct label and invalid value for a mix of known and unknown select multiple values', () => {
      const result = getSummaryDisplayValues(['value-1', 'unknown'], widgetType, schema, uiOptions)
      expect(result).toEqual([
        { type: SummaryDisplayValueType.String, value: 'Label 1' },
        { type: SummaryDisplayValueType.Invalid },
      ])
    })

    test('returns invalid value for a single select value passed to select multiple field', () => {
      const result = getSummaryDisplayValues('value-1', widgetType, schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.Invalid }])
    })
  })

  describe('RadioGroup', () => {
    const field = radioGroup(
      'radioGroupProperty',
      {
        title: 'Radio Group Title',
        type: 'string',
        items: [
          { value: 'value1', label: 'Label 1' },
          { value: 'value2', label: 'Label 2' },
        ],
      },
      {},
    )
    const { schema, uiOptions, widgetType } = retrieveRuntimeValues(field)

    test('returns correct label for a valid radio group value', () => {
      const result = getSummaryDisplayValues('value1', widgetType, schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.String, value: 'Label 1' }])
    })

    test('returns invalid value for an unknown radio group value', () => {
      const result = getSummaryDisplayValues('unknownValue', widgetType, schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.Invalid }])
    })

    test('returns none value for undefined radio group value', () => {
      const result = getSummaryDisplayValues(undefined, widgetType, schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.None }])
    })
  })

  describe('TextArea', () => {
    const field = textArea('textAreaProperty', { title: 'TextArea Title' }, {})
    const { schema, uiOptions, widgetType } = retrieveRuntimeValues(field)

    test('returns the input string for TextArea widget', () => {
      const result = getSummaryDisplayValues('Test input', widgetType, schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.String, value: 'Test input' }])
    })

    test('returns none value for undefined TextArea value', () => {
      const result = getSummaryDisplayValues(undefined, widgetType, schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.None }])
    })

    test('returns invalid value for non-string TextArea value', () => {
      const result = getSummaryDisplayValues(1234, widgetType, schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.Invalid }])
    })
  })

  describe('TimePicker', () => {
    const field = timePicker('timePickerProperty', { title: 'TimePicker Title' }, {})
    const { schema, uiOptions, widgetType } = retrieveRuntimeValues(field)

    test('returns the input string for correct TimePicker value', () => {
      const result = getSummaryDisplayValues('12:34', widgetType, schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.String, value: '12:34' }])
    })

    test('returns none value for undefined TimePicker value', () => {
      const result = getSummaryDisplayValues(undefined, widgetType, schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.None }])
    })

    test('returns invalid value for incorrect TimePickerValue', () => {
      const result = getSummaryDisplayValues('12:60', widgetType, schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.Invalid }])
    })
  })

  describe('Input', () => {
    const field = input('inputProperty', { type: 'text', title: 'Input Title' }, {})
    const { schema, uiOptions, widgetType } = retrieveRuntimeValues(field)

    test('returns the input string for Input widget', () => {
      const result = getSummaryDisplayValues('Test input', widgetType, schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.String, value: 'Test input' }])
    })

    test('returns none value for undefined Input value', () => {
      const result = getSummaryDisplayValues(undefined, widgetType, schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.None }])
    })

    test('returns invalid value for non-string Input value', () => {
      const result = getSummaryDisplayValues(true, widgetType, schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.Invalid }])
    })
  })

  describe('Number', () => {
    describe('Integer type', () => {
      const field = number(
        'integerProperty',
        {
          title: 'Integer Title',
          type: 'integer',
        },
        {},
      )
      const { schema, uiOptions, widgetType } = retrieveRuntimeValues(field)

      test('returns formatted string for a valid integer', () => {
        const result = getSummaryDisplayValues(123, widgetType, schema, uiOptions)
        expect(result).toEqual([{ type: SummaryDisplayValueType.String, value: '123' }])
      })

      test('returns formatted string for a large integer with thousand separators', () => {
        const result = getSummaryDisplayValues(1234567, widgetType, schema, uiOptions)
        expect(result).toEqual([{ type: SummaryDisplayValueType.String, value: '1 234 567' }])
      })
    })

    describe('Decimal number type', () => {
      const field = number(
        'decimalProperty',
        {
          title: 'Decimal Title',
          type: 'number',
          step: 0.01,
        },
        {},
      )
      const { schema, uiOptions, widgetType } = retrieveRuntimeValues(field)

      test('returns formatted string for a decimal number', () => {
        const result = getSummaryDisplayValues(123.45, widgetType, schema, uiOptions)
        expect(result).toEqual([{ type: SummaryDisplayValueType.String, value: '123,45' }])
      })

      test('returns formatted string for a large decimal number with thousand separators', () => {
        const result = getSummaryDisplayValues(1234567.89, widgetType, schema, uiOptions)
        expect(result).toEqual([{ type: SummaryDisplayValueType.String, value: '1 234 567,89' }])
      })
    })

    describe('With custom format options', () => {
      const field = number(
        'customFormatProperty',
        {
          title: 'Custom Format Title',
          type: 'number',
          step: 0.001,
        },
        {
          formatOptions: {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
            useGrouping: false, // Disables thousand separators
          },
        },
      )
      const { schema, uiOptions, widgetType } = retrieveRuntimeValues(field)

      test('returns formatted string respecting minimum fraction digits', () => {
        const result = getSummaryDisplayValues(123.4, widgetType, schema, uiOptions)
        expect(result).toEqual([{ type: SummaryDisplayValueType.String, value: '123,400' }])
      })

      test('returns formatted string without thousand separators', () => {
        const result = getSummaryDisplayValues(1234567.89, widgetType, schema, uiOptions)
        expect(result).toEqual([{ type: SummaryDisplayValueType.String, value: '1234567,890' }])
      })
    })

    describe('Error cases', () => {
      const field = number(
        'errorProperty',
        {
          title: 'Error Title',
          type: 'number',
          step: 0.01,
        },
        {},
      )
      const { schema, uiOptions, widgetType } = retrieveRuntimeValues(field)

      test('returns invalid value for non-numeric input', () => {
        const result = getSummaryDisplayValues('not-a-number', widgetType, schema, uiOptions)
        expect(result).toEqual([{ type: SummaryDisplayValueType.Invalid }])
      })

      test('returns invalid value for null', () => {
        const result = getSummaryDisplayValues(null, widgetType, schema, uiOptions)
        expect(result).toEqual([{ type: SummaryDisplayValueType.None }])
      })

      test('returns none value for undefined', () => {
        const result = getSummaryDisplayValues(undefined, widgetType, schema, uiOptions)
        expect(result).toEqual([{ type: SummaryDisplayValueType.None }])
      })

      test('returns invalid value for object', () => {
        const result = getSummaryDisplayValues({}, widgetType, schema, uiOptions)
        expect(result).toEqual([{ type: SummaryDisplayValueType.Invalid }])
      })
    })
  })

  describe('Checkbox', () => {
    const checkboxLabel = 'I agree to the terms'
    const field = checkbox('checkboxProperty', { title: 'Checkbox Title' }, { checkboxLabel })
    const { schema, uiOptions, widgetType } = retrieveRuntimeValues(field)

    test('returns checkbox label for true value', () => {
      const result = getSummaryDisplayValues(true, widgetType, schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.String, value: checkboxLabel }])
    })

    test('returns none value for false Checkbox value', () => {
      const result = getSummaryDisplayValues(false, widgetType, schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.None }])
    })

    test('returns invalid value for non-boolean Checkbox value', () => {
      const result = getSummaryDisplayValues('true', widgetType, schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.Invalid }])
    })
  })

  describe('CheckboxGroup', () => {
    const field = checkboxGroup(
      'checkboxGroupProperty',
      {
        title: 'Checkbox Group Title',
        items: [
          { value: 'option1', label: 'Title 1' },
          { value: 'option2', label: 'Title 2' },
          { value: 'option3', label: 'Title 3' },
        ],
      },
      {},
    )
    const { schema, uiOptions, widgetType } = retrieveRuntimeValues(field)

    test('returns correct labels for selected CheckboxGroup options', () => {
      const selectedOptions = ['option1', 'option3']
      const result = getSummaryDisplayValues(selectedOptions, widgetType, schema, uiOptions)
      expect(result).toEqual([
        { type: SummaryDisplayValueType.String, value: 'Title 1' },
        { type: SummaryDisplayValueType.String, value: 'Title 3' },
      ])
    })

    test('returns correct label and invalid value for a mix of known and unknown CheckboxGroup options', () => {
      const selectedOptions = ['option1', 'unknownOption']
      const result = getSummaryDisplayValues(selectedOptions, widgetType, schema, uiOptions)
      expect(result).toEqual([
        { type: SummaryDisplayValueType.String, value: 'Title 1' },
        { type: SummaryDisplayValueType.Invalid },
      ])
    })

    test('returns invalid value for a single value passed to CheckboxGroup', () => {
      const result = getSummaryDisplayValues('option1', widgetType, schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.Invalid }])
    })

    test('returns none value for an empty CheckboxGroup selection', () => {
      const result = getSummaryDisplayValues([], widgetType, schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.None }])
    })
  })

  describe('FileUpload Single', () => {
    const field = fileUpload('fileUploadSingleProperty', { title: 'File Upload Single Title' }, {})
    const { schema, uiOptions, widgetType } = retrieveRuntimeValues(field)

    test('returns the file ID for a single file upload', () => {
      const fileUUID = '30200bc4-ea66-448b-ad8f-00e1e1ccdfb0'
      const result = getSummaryDisplayValues(fileUUID, widgetType, schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.File, id: fileUUID }])
    })

    test('returns invalid value for non-string FileUpload value', () => {
      const result = getSummaryDisplayValues(12345, widgetType, schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.Invalid }])
    })
  })

  describe('FileUpload Multiple', () => {
    const field = fileUploadMultiple(
      'fileUploadMultiple',
      { title: 'File Upload Multiple Title' },
      {},
    )
    const { schema, uiOptions, widgetType } = retrieveRuntimeValues(field)

    test('returns file IDs for multiple file uploads', () => {
      const fileUUIDs = [
        '30200bc4-ea66-448b-ad8f-00e1e1ccdfb0',
        '8f8877a4-8e52-4ce9-b996-ea2b25d134f1',
      ]
      const result = getSummaryDisplayValues(fileUUIDs, widgetType, schema, uiOptions)
      expect(result).toEqual([
        { type: SummaryDisplayValueType.File, id: fileUUIDs[0] },
        { type: SummaryDisplayValueType.File, id: fileUUIDs[1] },
      ])
    })

    test('returns a mix of file ID and invalid value for a combination of valid and invalid FileUpload values', () => {
      const inputs = ['30200bc4-ea66-448b-ad8f-00e1e1ccdfb0', 12345]
      const result = getSummaryDisplayValues(inputs, widgetType, schema, uiOptions)
      expect(result).toEqual([
        { type: SummaryDisplayValueType.File, id: '30200bc4-ea66-448b-ad8f-00e1e1ccdfb0' },
        { type: SummaryDisplayValueType.Invalid },
      ])
    })

    test('returns none value for an empty FileUpload array', () => {
      const inputs: string[] = []
      const result = getSummaryDisplayValues(inputs, widgetType, schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.None }])
    })

    test('returns invalid value for a non-array FileUpload value', () => {
      const result = getSummaryDisplayValues('not-an-array', widgetType, schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.Invalid }])
    })
  })

  describe('DatePicker', () => {
    const field = datePicker('datePickerProperty', { title: 'DatePicker Title' }, {})
    const { schema, uiOptions, widgetType } = retrieveRuntimeValues(field)

    test('returns formatted date for a valid DatePicker value', () => {
      const validDate = '2023-01-01'
      const result = getSummaryDisplayValues(validDate, widgetType, schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.String, value: '1. 1. 2023' }])
    })

    test('returns invalid value for an invalid DatePicker value', () => {
      const invalidDate = 'not-a-date'
      const result = getSummaryDisplayValues(invalidDate, widgetType, schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.Invalid }])
    })

    test('returns none value for undefined DatePicker value', () => {
      const result = getSummaryDisplayValues(undefined, widgetType, schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.None }])
    })

    test('returns invalid value for non-string DatePicker value', () => {
      const nonStringValue = 123456
      const result = getSummaryDisplayValues(nonStringValue, widgetType, schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.Invalid }])
    })
  })

  describe('Unsupported widget type', () => {
    const field = textArea('textAreaProperty', { title: 'TextArea Title' }, {})
    const { schema, uiOptions } = retrieveRuntimeValues(field)

    test('throws an error for an unsupported widget type', () => {
      expect(() =>
        getSummaryDisplayValues('value', 'unsupported' as BaWidgetType, schema, uiOptions),
      ).toThrow('Unsupported widget type: unsupported')
    })
  })
})

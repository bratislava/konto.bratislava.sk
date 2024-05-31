import {
  checkbox,
  checkboxGroup,
  datePicker,
  Field,
  fileUpload,
  input,
  number,
  radioGroup,
  select,
  selectMultiple,
  textArea,
} from '../../src/generator/functions'
import {
  getSummaryDisplayValues,
  SummaryDisplayValueType,
} from '../../src/summary-json/getSummaryDisplayValue'
import { createSchemaUtils, getUiOptions, optionsList } from '@rjsf/utils'
import { baRjsfValidator } from '../../src/form-utils/validators'
import { baDefaultFormStateBehavior } from '../../src/form-utils/defaultFormState'

const getSchemaAndUiOptions = (field: Field) => {
  const schema = field.schema()
  const uiSchema = field.uiSchema()

  const schemaUtils = createSchemaUtils(baRjsfValidator, schema, baDefaultFormStateBehavior)
  const enumOptions = schemaUtils.isSelect(schema) ? optionsList(schema) : undefined

  const uiOptions = { ...getUiOptions(uiSchema), enumOptions }

  return { schema, uiOptions }
}

describe('getSummaryDisplayValues', () => {
  describe('Select', () => {
    const field = select(
      'selectProperty',
      {
        title: 'Select Title',
        options: [
          { value: 'value-1', title: 'Label 1' },
          { value: 'value-2', title: 'Label 2' },
        ],
      },
      {},
    )
    const { schema, uiOptions } = getSchemaAndUiOptions(field)

    it('returns correct label for a valid single select value', () => {
      const result = getSummaryDisplayValues('value-1', 'Select', schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.String, value: 'Label 1' }])
    })

    it('returns invalid value for an unknown select value', () => {
      const result = getSummaryDisplayValues('unknown', 'Select', schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.Invalid }])
    })

    it('returns none value for undefined select value', () => {
      const result = getSummaryDisplayValues(undefined, 'Select', schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.None }])
    })

    it('returns invalid value for a multi select value passed to single select field', () => {
      const result = getSummaryDisplayValues(['value-1', 'value-2'], 'Select', schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.Invalid }])
    })
  })

  describe('Select Multiple', () => {
    const field = selectMultiple(
      'selectMultipleProperty',
      {
        title: 'Select Multiple Title',
        options: [
          { value: 'value-1', title: 'Label 1' },
          { value: 'value-2', title: 'Label 2' },
        ],
      },
      {},
    )
    const { schema, uiOptions } = getSchemaAndUiOptions(field)

    it('returns none value for an empty select multiple value', () => {
      const result = getSummaryDisplayValues([], 'Select', schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.None }])
    })

    it('returns correct label for a valid single select multiple value', () => {
      const result = getSummaryDisplayValues(['value-1'], 'Select', schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.String, value: 'Label 1' }])
    })

    it('returns correct labels for valid select multiple values', () => {
      const result = getSummaryDisplayValues(['value-1', 'value-2'], 'Select', schema, uiOptions)
      expect(result).toEqual([
        { type: SummaryDisplayValueType.String, value: 'Label 1' },
        { type: SummaryDisplayValueType.String, value: 'Label 2' },
      ])
    })

    it('returns correct label and invalid value for a mix of known and unknown select multiple values', () => {
      const result = getSummaryDisplayValues(['value-1', 'unknown'], 'Select', schema, uiOptions)
      expect(result).toEqual([
        { type: SummaryDisplayValueType.String, value: 'Label 1' },
        { type: SummaryDisplayValueType.Invalid },
      ])
    })

    it('returns invalid value for a single select value passed to select multiple field', () => {
      const result = getSummaryDisplayValues('value-1', 'Select', schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.Invalid }])
    })
  })

  describe('RadioGroup', () => {
    const field = radioGroup(
      'radioGroupProperty',
      {
        title: 'Radio Group Title',
        type: 'string',
        options: [
          { value: 'value1', title: 'Label 1' },
          { value: 'value2', title: 'Label 2' },
        ],
      },
      {},
    )
    const { schema, uiOptions } = getSchemaAndUiOptions(field)

    it('returns correct label for a valid radio group value', () => {
      const result = getSummaryDisplayValues('value1', 'RadioGroup', schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.String, value: 'Label 1' }])
    })

    it('returns invalid value for an unknown radio group value', () => {
      const result = getSummaryDisplayValues('unknownValue', 'RadioGroup', schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.Invalid }])
    })

    it('returns none value for undefined radio group value', () => {
      const result = getSummaryDisplayValues(undefined, 'RadioGroup', schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.None }])
    })
  })

  describe('TextArea', () => {
    const field = textArea('textAreaProperty', { title: 'TextArea Title' }, {})
    const { schema, uiOptions } = getSchemaAndUiOptions(field)

    it('returns the input string for TextArea widget', () => {
      const result = getSummaryDisplayValues('Test input', 'TextArea', schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.String, value: 'Test input' }])
    })

    it('returns none value for undefined TextArea value', () => {
      const result = getSummaryDisplayValues(undefined, 'TextArea', schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.None }])
    })

    it('returns invalid value for non-string TextArea value', () => {
      const result = getSummaryDisplayValues(1234, 'TextArea', schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.Invalid }])
    })
  })

  describe('Input', () => {
    const field = input('inputProperty', { title: 'Input Title', type: 'text' }, {})
    const { schema, uiOptions } = getSchemaAndUiOptions(field)

    it('returns the input string for Input widget', () => {
      const result = getSummaryDisplayValues('Test input', 'Input', schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.String, value: 'Test input' }])
    })

    it('returns none value for undefined Input value', () => {
      const result = getSummaryDisplayValues(undefined, 'Input', schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.None }])
    })

    it('returns invalid value for non-string Input value', () => {
      const result = getSummaryDisplayValues(true, 'Input', schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.Invalid }])
    })
  })

  describe('Number', () => {
    const field = number('numberProperty', { title: 'Number title', type: 'number' }, {})
    const { schema, uiOptions } = getSchemaAndUiOptions(field)

    it('returns formatted string for a valid decimal number', () => {
      const validNumber = 123.45
      const result = getSummaryDisplayValues(validNumber, 'Input', schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.String, value: '123.45' }])
    })

    it('returns formatted string for a valid integer number', () => {
      const validInteger = 123
      const result = getSummaryDisplayValues(validInteger, 'Input', schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.String, value: '123' }])
    })

    it('returns invalid value for a non-numeric input', () => {
      const nonNumberValue = 'not-a-number'
      const result = getSummaryDisplayValues(nonNumberValue, 'Input', schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.Invalid }])
    })

    it('returns none value for undefined Number value', () => {
      const result = getSummaryDisplayValues(undefined, 'Input', schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.None }])
    })
  })

  describe('Checkbox', () => {
    const checkboxLabel = 'I agree to the terms'
    const field = checkbox('checkboxProperty', { title: 'Checkbox Title' }, { checkboxLabel })
    const { schema, uiOptions } = getSchemaAndUiOptions(field)

    it('returns checkbox label for true value', () => {
      const result = getSummaryDisplayValues(true, 'Checkbox', schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.String, value: checkboxLabel }])
    })

    it('returns none value for false Checkbox value', () => {
      const result = getSummaryDisplayValues(false, 'Checkbox', schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.None }])
    })

    it('returns invalid value for non-boolean Checkbox value', () => {
      const result = getSummaryDisplayValues('true', 'Checkbox', schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.Invalid }])
    })
  })

  // TODO: CheckboxGroup tests are disabled, because `enumOptions` are not correctly added in `getSchemaAndUiOptions`
  xdescribe('CheckboxGroup', () => {
    const field = checkboxGroup(
      'checkboxGroupProperty',
      {
        title: 'Checkbox Group Title',
        options: [
          { value: 'option1', title: 'Title 1' },
          { value: 'option2', title: 'Title 2' },
          { value: 'option3', title: 'Title 3' },
        ],
      },
      {},
    )
    const { schema, uiOptions } = getSchemaAndUiOptions(field)

    it('returns correct labels for selected CheckboxGroup options', () => {
      const selectedOptions = ['option1', 'option3']
      const result = getSummaryDisplayValues(selectedOptions, 'CheckboxGroup', schema, uiOptions)
      expect(result).toEqual([
        { type: SummaryDisplayValueType.String, value: 'Title 1' },
        { type: SummaryDisplayValueType.String, value: 'Title 3' },
      ])
    })

    it('returns correct label and invalid value for a mix of known and unknown CheckboxGroup options', () => {
      const selectedOptions = ['option1', 'unknownOption']
      const result = getSummaryDisplayValues(selectedOptions, 'CheckboxGroup', schema, uiOptions)
      expect(result).toEqual([
        { type: SummaryDisplayValueType.String, value: 'Title 1' },
        { type: SummaryDisplayValueType.Invalid },
      ])
    })

    it('returns invalid value for a single value passed to CheckboxGroup', () => {
      const result = getSummaryDisplayValues('option1', 'CheckboxGroup', schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.Invalid }])
    })

    it('returns none value for an empty CheckboxGroup selection', () => {
      const result = getSummaryDisplayValues([], 'CheckboxGroup', schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.None }])
    })
  })

  describe('FileUpload Single', () => {
    const field = fileUpload('fileUploadSingleProperty', { title: 'File Upload Single Title' }, {})
    const { schema, uiOptions } = getSchemaAndUiOptions(field)

    it('returns the file ID for a single file upload', () => {
      const fileUUID = '30200bc4-ea66-448b-ad8f-00e1e1ccdfb0'
      const result = getSummaryDisplayValues(fileUUID, 'FileUpload', schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.File, id: fileUUID }])
    })

    it('returns invalid value for non-string FileUpload value', () => {
      const result = getSummaryDisplayValues(12345, 'FileUpload', schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.Invalid }])
    })
  })

  describe('FileUpload Multiple', () => {
    const field = fileUpload(
      'fileUploadMultipleMultiple',
      { title: 'File Upload Multiple Title', multiple: true },
      {},
    )
    const { schema, uiOptions } = getSchemaAndUiOptions(field)

    it('returns file IDs for multiple file uploads', () => {
      const fileUUIDs = [
        '30200bc4-ea66-448b-ad8f-00e1e1ccdfb0',
        '8f8877a4-8e52-4ce9-b996-ea2b25d134f1',
      ]
      const result = getSummaryDisplayValues(fileUUIDs, 'FileUpload', schema, uiOptions)
      expect(result).toEqual([
        { type: SummaryDisplayValueType.File, id: fileUUIDs[0] },
        { type: SummaryDisplayValueType.File, id: fileUUIDs[1] },
      ])
    })

    it('returns a mix of file ID and invalid value for a combination of valid and invalid FileUpload values', () => {
      const inputs = ['30200bc4-ea66-448b-ad8f-00e1e1ccdfb0', 12345]
      const result = getSummaryDisplayValues(inputs, 'FileUpload', schema, uiOptions)
      expect(result).toEqual([
        { type: SummaryDisplayValueType.File, id: '30200bc4-ea66-448b-ad8f-00e1e1ccdfb0' },
        { type: SummaryDisplayValueType.Invalid },
      ])
    })

    it('returns none value for an empty FileUpload array', () => {
      const inputs: string[] = []
      const result = getSummaryDisplayValues(inputs, 'FileUpload', schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.None }])
    })
  })

  describe('DatePicker', () => {
    const field = datePicker('datePickerProperty', { title: 'DatePicker Title' }, {})
    const { schema, uiOptions } = getSchemaAndUiOptions(field)

    it('returns formatted date for a valid DatePicker value', () => {
      const validDate = '2023-01-01'
      const result = getSummaryDisplayValues(validDate, 'DatePicker', schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.String, value: '1. 1. 2023' }])
    })

    it('returns invalid value for an invalid DatePicker value', () => {
      const invalidDate = 'not-a-date'
      const result = getSummaryDisplayValues(invalidDate, 'DatePicker', schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.Invalid }])
    })

    it('returns none value for undefined DatePicker value', () => {
      const result = getSummaryDisplayValues(undefined, 'DatePicker', schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.None }])
    })

    it('returns invalid value for non-string DatePicker value', () => {
      const nonStringValue = 123456
      const result = getSummaryDisplayValues(nonStringValue, 'DatePicker', schema, uiOptions)
      expect(result).toEqual([{ type: SummaryDisplayValueType.Invalid }])
    })
  })
})

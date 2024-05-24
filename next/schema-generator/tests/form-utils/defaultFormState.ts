import {
  arrayField,
  checkboxGroup,
  conditionalFields,
  fileUpload,
  input,
  object,
  selectMultiple,
} from '../../src/generator/functions'
import {
  baGetDefaultFormState,
  baGetDefaultFormStateDeep,
  isFileMultipleSchema,
} from '../../src/form-utils/defaultFormState'
import { ArrayFieldUiOptions } from '../../src/generator/uiOptionsTypes'
import { createCondition } from '../../src/generator/helpers'

describe('defaultFormState', () => {
  it('isFileMultipleSchema should return true for file array schema', () => {
    const definition = fileUpload('file', { title: 'File', multiple: true }, {})

    expect(isFileMultipleSchema(definition.schema())).toBe(true)
  })

  it('isFileMultipleSchema should return false for any other schema', () => {
    const definition = arrayField('array', { title: 'Array' }, {} as ArrayFieldUiOptions, [])

    expect(isFileMultipleSchema(definition.schema())).toBe(false)
  })

  it('getDefaultForm should return default values for arrays consistent with expected behavior', () => {
    const options = [
      {
        value: 'option',
        title: 'Option',
      },
    ]

    const definition = object('defaultFormState', {}, {}, [
      fileUpload('fileMultiple', { title: 'File multiple', multiple: true, required: false }, {}),
      fileUpload(
        'fileMultipleRequired',
        { title: 'File multiple', multiple: true, required: true },
        {},
      ),
      selectMultiple(
        'select',
        {
          title: 'Select multiple',
          options,
        },
        {},
      ),
      selectMultiple(
        'selectRequired',
        {
          title: 'Select multiple required',
          options,
          required: true,
        },
        {},
      ),
      checkboxGroup(
        'checkboxGroup',
        {
          title: 'Checkbox group',
          options,
        },
        {},
      ),
      checkboxGroup(
        'checkboxGroupRequired',
        {
          title: 'Checkbox group required',
          options,
          required: true,
        },
        {},
      ),
      arrayField('arrayField', { title: 'Array field' }, {} as ArrayFieldUiOptions, [
        input('placeholderField', { title: 'Placeholder field' }, {}),
      ]),
      arrayField(
        'arrayFieldRequired',
        { title: 'Array field required', required: true },
        {} as ArrayFieldUiOptions,
        [input('placeholderField', { title: 'Placeholder field' }, {})],
      ),
    ])

    expect(baGetDefaultFormState(definition.schema(), {})).toEqual({
      fileMultiple: [],
      fileMultipleRequired: [],
      select: [],
      selectRequired: [],
      checkboxGroup: [],
      checkboxGroupRequired: [],
      arrayFieldRequired: [{}],
    })
  })

  describe('baGetDefaultFormStateDeep', () => {
    const definition = object('wrapper', { required: true }, {}, [
      input('field', { title: 'Field', required: true, default: 'value' }, {}),
      conditionalFields(createCondition([[['field'], { const: 'value' }]]), [
        object('conditionalObject', { required: true }, {}, []),
      ]),
    ])

    console.log(JSON.stringify(definition.schema()))

    it('should only initialize the first level with baGetDefaultFormState', () => {
      // If this fails, the behavior is fixed in RJSF and deep initialization is not needed anymore
      expect(baGetDefaultFormState(definition.schema(), {})).toEqual({
        field: 'value',
      })
    })

    it('should deeply initialize all nested objects with baGetDefaultFormStateDeep', () => {
      expect(
        baGetDefaultFormStateDeep(definition.schema(), {
          field: 'value',
        }),
      ).toEqual({
        field: 'value',
        conditionalField: 'valueConditional',
      })
    })
  })
})

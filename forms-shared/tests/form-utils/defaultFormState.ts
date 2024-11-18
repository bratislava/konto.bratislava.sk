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
  baGetDefaultFormStateStable,
  isFileMultipleSchema,
} from '../../src/form-utils/defaultFormState'
import { ArrayFieldUiOptions } from '../../src/generator/uiOptionsTypes'
import { filterConsole } from '../../test-utils/filterConsole'
import { createCondition } from '../../src/generator/helpers'

describe('defaultFormState', () => {
  it('isFileMultipleSchema should return true for file array schema', () => {
    const definition = fileUpload('file', { title: 'File', multiple: true }, {})

    expect(isFileMultipleSchema(definition.schema)).toBe(true)
  })

  it('isFileMultipleSchema should return false for any other schema', () => {
    const definition = arrayField('array', { title: 'Array' }, {} as ArrayFieldUiOptions, [])

    expect(isFileMultipleSchema(definition.schema)).toBe(false)
  })

  it('getDefaultForm should return default values for arrays consistent with expected behavior', () => {
    const options = [
      {
        value: 'option',
        label: 'Option',
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
        input('placeholderField', { type: 'text', title: 'Placeholder field' }, {}),
      ]),
      arrayField(
        'arrayFieldRequired',
        { title: 'Array field required', required: true },
        {} as ArrayFieldUiOptions,
        [input('placeholderField', { type: 'text', title: 'Placeholder field' }, {})],
      ),
    ])

    filterConsole(
      'warn',
      (message) =>
        typeof message === 'string' && message.includes('could not merge subschemas in allOf'),
    )
    expect(baGetDefaultFormState(definition.schema, {})).toEqual({
      fileMultiple: [],
      fileMultipleRequired: [],
      select: [],
      selectRequired: [],
      checkboxGroup: [],
      checkboxGroupRequired: [],
      arrayFieldRequired: [{}],
    })
  })
})

describe('baGetDefaultFormStateStable', () => {
  const { schema } = object('wrapper', { required: true }, {}, [
    input('input1', { type: 'text', title: 'Input 1', default: 'value1', required: true }, {}),
    conditionalFields(createCondition([[['input1'], { const: 'value1' }]]), [
      input('input2', { type: 'text', title: 'Input 2', default: 'value2', required: true }, {}),
    ]),
  ])

  it('should return correct default values', () => {
    filterConsole(
      'warn',
      (message) =>
        typeof message === 'string' && message.includes('could not merge subschemas in allOf'),
    )

    const result = baGetDefaultFormState(schema, {})
    const resultStable = baGetDefaultFormStateStable(schema, {})

    expect(result).toEqual({ input1: 'value1' })
    expect(resultStable).toEqual({ input1: 'value1', input2: 'value2' })
  })
})

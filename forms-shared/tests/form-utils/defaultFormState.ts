import {
  arrayField,
  checkbox,
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
import { testValidatorRegistry } from '../../test-utils/validatorRegistry'

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
    const items = [
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
          items,
        },
        {},
      ),
      selectMultiple(
        'selectRequired',
        {
          title: 'Select multiple required',
          items,
          required: true,
        },
        {},
      ),
      checkboxGroup(
        'checkboxGroup',
        {
          title: 'Checkbox group',
          items,
        },
        {},
      ),
      checkboxGroup(
        'checkboxGroupRequired',
        {
          title: 'Checkbox group required',
          items,
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
    expect(baGetDefaultFormState(definition.schema, {}, testValidatorRegistry)).toEqual({
      fileMultiple: [],
      fileMultipleRequired: [],
      select: [],
      selectRequired: [],
      checkboxGroup: [],
      checkboxGroupRequired: [],
      arrayFieldRequired: [{}],
    })
  })

  it('getDefaultForm should not prefill const values', () => {
    const definition = object('defaultFormState', {}, {}, [
      checkbox(
        'checkboxWithConstValue',
        { title: 'Checkbox with const value', required: true, constValue: true },
        { checkboxLabel: 'I agree' },
      ),
    ])

    expect(baGetDefaultFormState(definition.schema, {}, testValidatorRegistry)).toEqual({})
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

    const result = baGetDefaultFormState(schema, {}, testValidatorRegistry)
    const resultStable = baGetDefaultFormStateStable(schema, {}, testValidatorRegistry)

    expect(result).toEqual({ input1: 'value1' })
    expect(resultStable).toEqual({ input1: 'value1', input2: 'value2' })
  })
})

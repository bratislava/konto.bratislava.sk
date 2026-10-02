import { describe, expect, test } from 'vitest'

import {
  baGetDefaultFormState,
  baGetDefaultFormStateStable,
  isFileMultipleSchema,
} from '../../src/form-utils/defaultFormState'
import { arrayField } from '../../src/generator/functions/arrayField'
import { checkbox } from '../../src/generator/functions/checkbox'
import { checkboxGroup } from '../../src/generator/functions/checkboxGroup'
import { conditionalFields } from '../../src/generator/functions/conditionalFields'
import { fileUploadMultiple } from '../../src/generator/functions/fileUploadMultiple'
import { input } from '../../src/generator/functions/input'
import { radioGroup } from '../../src/generator/functions/radioGroup'
import { selectMultiple } from '../../src/generator/functions/selectMultiple'
import { createCondition } from '../../src/generator/helpers'
import { object } from '../../src/generator/object'
import { ArrayFieldUiOptions } from '../../src/generator/uiOptionsTypes'
import { filterConsole } from '../../test-utils/filterConsole'
import { testValidatorRegistry } from '../../test-utils/validatorRegistry'

describe('defaultFormState', () => {
  test('isFileMultipleSchema should return true for file array schema', () => {
    const definition = fileUploadMultiple('file', { title: 'File' }, {})

    expect(isFileMultipleSchema(definition.schema)).toBe(true)
  })

  test('isFileMultipleSchema should return false for any other schema', () => {
    const definition = arrayField('array', { title: 'Array' }, {} as ArrayFieldUiOptions, [])

    expect(isFileMultipleSchema(definition.schema)).toBe(false)
  })

  test('getDefaultForm should return default values for arrays consistent with expected behavior', () => {
    const items = [
      {
        value: 'option',
        label: 'Option',
      },
    ]

    const definition = object('defaultFormState', {}, [
      fileUploadMultiple('fileMultiple', { title: 'File multiple', required: false }, {}),
      fileUploadMultiple('fileMultipleRequired', { title: 'File multiple', required: true }, {}),
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

    const restore = filterConsole(
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

    restore()
  })

  test('getDefaultForm should not prefill const values', () => {
    const definition = object('defaultFormState', {}, [
      checkbox(
        'checkboxWithConstValue',
        { title: 'Checkbox with const value', required: true, constValue: true },
        { checkboxLabel: 'I agree' },
      ),
    ])

    expect(baGetDefaultFormState(definition.schema, {}, testValidatorRegistry)).toEqual({})
  })

  test('getDefaultForm should not prefill required booleans without default', () => {
    const definition = object('defaultFormState', {}, [
      radioGroup(
        'booleanRadioGroup',
        {
          type: 'boolean',
          title: 'Boolean radio group',
          required: true,
          items: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
          ],
        },
        {},
      ),
      checkbox('checkbox', { title: 'Checkbox', required: true }, { checkboxLabel: 'Checkbox' }),
    ])

    expect(baGetDefaultFormState(definition.schema, {}, testValidatorRegistry)).toEqual({})
  })
})

describe('baGetDefaultFormStateStable', () => {
  const { schema } = object('wrapper', {}, [
    input('input1', { type: 'text', title: 'Input 1', default: 'value1', required: true }, {}),
    conditionalFields(createCondition([[['input1'], { const: 'value1' }]]), [
      input('input2', { type: 'text', title: 'Input 2', default: 'value2', required: true }, {}),
    ]),
  ])

  test('should return correct default values', () => {
    const restore = filterConsole(
      'warn',
      (message) =>
        typeof message === 'string' && message.includes('could not merge subschemas in allOf'),
    )

    const result = baGetDefaultFormState(schema, {}, testValidatorRegistry)
    const resultStable = baGetDefaultFormStateStable(schema, {}, testValidatorRegistry)

    expect(result).toEqual({ input1: 'value1' })
    expect(resultStable).toEqual({ input1: 'value1', input2: 'value2' })
    restore()
  })
})

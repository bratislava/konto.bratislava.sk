import {
  arrayField,
  checkboxGroup,
  fileUpload,
  input,
  object,
  selectMultiple,
} from '../../src/generator/functions'
import { baGetDefaultFormState, isFileMultipleSchema } from '../../src/form-utils/defaultFormState'
import { ArrayFieldUiOptions } from '../../src/generator/uiOptionsTypes'
import { filterConsole } from '../../test-utils/filterConsole'

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

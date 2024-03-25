import {
  arrayField,
  checkboxGroup,
  fileUpload,
  input,
  object,
  selectMultiple,
} from '../../src/generator/functions'
import { baGetDefaultFormState } from '../../src/form-utils/defaultFormState'

describe('defaultFormState', () => {
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
      arrayField(
        'arrayField',
        { title: 'Array field' },
        { variant: 'topLevel', addButtonLabel: '' },
        [input('placeholderField', { title: 'Placeholder field' }, {})],
      ),
      arrayField(
        'arrayFieldRequired',
        { title: 'Array field required', required: true },
        { variant: 'topLevel', addButtonLabel: '' },
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
})

import * as fs from 'node:fs'
import * as util from 'node:util'

import {
  checkboxes,
  conditionalFields,
  conditionalStep,
  inputField,
  object,
  radioButton,
  schema,
  step,
  upload,
} from '../generator/functions'
import { createCondition } from '../generator/helpers'

const x = schema(
  {
    pospID: 'test',
    pospVersion: '0.1',
    title: 'Example',
    description: 'Example schema',
  },
  {},
  [
    conditionalStep(
      'conditionalStep',
      createCondition([[['mestoPSCstep', 'mestoPSC', 'psc'], { const: '82103' }]]),
      { title: 'Conditional step' },
      [inputField('randomInput', { title: 'Input in conditional step' }, {})],
    ),
    step('mestoPSCstep', { title: 'Mesto PSC step' }, [
      object('mestoPSC', { required: true }, {}, [
        inputField('mesto', { title: 'Mesto', default: 'Košice', required: true }, {}),
        inputField('psc', { title: 'PSČ', required: true }, {}),
        conditionalFields(
          createCondition([[['psc'], { const: '82103' }]]),
          [
            inputField('xyz', { title: 'abc', default: 'Košice', required: true }, {}),
            inputField('oprst', { title: 'abc', default: 'Košice' }, {}),
          ],
          [
            inputField('ggg', { title: 'asdasd', default: 'Košice', required: true }, {}),
            inputField('pokpok', { title: 'aasaddasbc', default: 'Košice', required: true }, {}),
          ],
        ),
        inputField('asdasda', { title: 'ASDASD', required: true }, {}),
      ]),
    ]),
    // step('dateTimePickerShowcase', { title: 'Showcase of DateTime Picker' }, [
    //   datePicker('dateValue', { title: 'Mesto', default: 'Košice', required: true }, {}),
    //   timePicker('timeValue', { title: 'PSČ', required: true }, {}),
    // ]),
    step('fileUploads', { title: 'File uploads' }, [
      upload('asdasd', { title: 'Mesto', required: true }, { type: 'button' }),
      upload('asdada', { title: 'PSČ', required: true, multiple: true }, { type: 'button' }),
      upload('xxx', { title: 'Mesto', required: true }, { type: 'dragAndDrop' }),
      upload(
        'aaasdadas',
        { title: 'PSČ', required: true, multiple: true },
        { type: 'dragAndDrop' },
      ),
    ]),
    step('radioButtons', { title: 'Radio buttons' }, [
      radioButton(
        'xxxxxx',
        {
          title: 'asdasd',
          options: [
            { value: '1', title: 'asdasd', tooltip: 'asdasd' },
            { value: '5', title: 'qqqqq' },
          ],
        },
        {},
      ),
    ]),
    step('check', { title: 'Checkboxes' }, [
      checkboxes(
        'checkboxes',
        {
          title: 'asdasdasdas',
          options: [
            { value: '1', title: 'asdasd', tooltip: 'asdasd' },
            { value: '5', title: 'qqqqq' },
            { value: 'qqqq', title: 'qqqqq' },
          ],
          required: true,
        },
        { variant: 'boxed' },
      ),
    ]),
  ],
)

fs.writeFileSync(
  'C:\\Projects\\konto.bratislava.sk\\next\\backend\\forms\\test\\schema.json',
  JSON.stringify(x.schema, null, 2),
)
fs.writeFileSync(
  'C:\\Projects\\konto.bratislava.sk\\next\\backend\\forms\\test\\uiSchema.json',
  JSON.stringify(x.uiSchema, null, 2),
)
console.log(util.inspect(x, false, null, true /* enable colors */))

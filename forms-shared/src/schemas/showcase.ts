import { createCondition, createStringItems, createStringItemsV2 } from '../generator/helpers'
import { select } from '../generator/functions/select'
import { selectMultiple } from '../generator/functions/selectMultiple'
import { input } from '../generator/functions/input'
import { number } from '../generator/functions/number'
import { radioGroup } from '../generator/functions/radioGroup'
import { textArea } from '../generator/functions/textArea'
import { checkbox } from '../generator/functions/checkbox'
import { checkboxGroup } from '../generator/functions/checkboxGroup'
import { datePicker } from '../generator/functions/datePicker'
import { timePicker } from '../generator/functions/timePicker'
import { customComponentsField } from '../generator/functions/customComponentsField'
import { object } from '../generator/object'
import { arrayField } from '../generator/functions/arrayField'
import { step } from '../generator/functions/step'
import { conditionalStep } from '../generator/functions/conditionalStep'
import { conditionalFields } from '../generator/functions/conditionalFields'
import { schema } from '../generator/functions/schema'
import { fileUploadMultiple } from '../generator/functions/fileUploadMultiple'

export default schema(
  {
    title: 'Showcase',
  },
  {},
  [
    step('textInputs', { title: 'Text Inputs' }, [
      input(
        'basicText',
        {
          type: 'text',
          title: 'Basic Text Input',
          required: true,
        },
        {
          placeholder: 'Enter text here',
          helptext: 'Basic text input example',
        },
      ),
      object(
        'sizeVariants',
        { required: true },
        {
          title: 'Size Variants',
        },
        [
          input('small', { type: 'text', title: 'Small Input' }, { size: 'small' }),
          input('medium', { type: 'text', title: 'Medium Input' }, { size: 'medium' }),
          input('full', { type: 'text', title: 'Full Width Input' }, { size: 'full' }),
        ],
      ),
      object(
        'iconInputs',
        { required: true },
        {
          title: 'Inputs with Icons',
        },
        [
          input(
            'emailIcon',
            { type: 'email', title: 'Email with Icon' },
            {
              leftIcon: 'mail',
              placeholder: 'Enter email',
            },
          ),
          input(
            'phoneIcon',
            { type: 'ba-phone-number', title: 'Phone with Icon' },
            {
              leftIcon: 'call',
              placeholder: 'Enter phone',
            },
          ),
          input(
            'priceIcon',
            { type: 'text', title: 'Price with Icon' },
            {
              leftIcon: 'euro',
              placeholder: 'Enter price',
            },
          ),
        ],
      ),
      object(
        'formattedInputs',
        { required: true },
        {
          title: 'Formatted Inputs',
        },
        [
          input(
            'phone',
            {
              type: 'ba-phone-number',
              title: 'Phone Number',
              required: true,
            },
            {
              placeholder: '+421',
              helptext: 'Slovak phone number format',
            },
          ),
          input(
            'iban',
            {
              type: 'ba-iban',
              title: 'IBAN',
              required: true,
            },
            {
              helptext: 'International Bank Account Number',
            },
          ),
          input(
            'ratio',
            {
              type: 'ba-ratio',
              title: 'Ratio',
              required: true,
            },
            {
              placeholder: '1/2',
              helptext: 'Format: number/number',
            },
          ),
        ],
      ),
      textArea(
        'description',
        {
          title: 'Text Area',
          required: true,
        },
        {
          placeholder: 'Enter longer text here',
          helptext: 'Multi-line text input',
        },
      ),
    ]),
    step('selectionInputs', { title: 'Selection Inputs' }, [
      select(
        'basicSelect',
        {
          title: 'Basic Select',
          required: true,
          items: createStringItems(['Option 1', 'Option 2', 'Option 3']),
        },
        {
          placeholder: 'Select an option',
          helptext: 'Single selection dropdown',
        },
      ),
      select(
        'selectWithDescriptions',
        {
          title: 'Select with Descriptions',
          required: true,
          items: createStringItemsV2([
            {
              label: 'Option 1',
              description: 'Description for option 1',
            },
            {
              label: 'Option 2',
              description: 'Description for option 2',
            },
          ]),
        },
        {
          helptext: 'Select with additional context',
        },
      ),
      selectMultiple(
        'multiSelect',
        {
          title: 'Multiple Select',
          required: true,
          items: createStringItems(['Choice 1', 'Choice 2', 'Choice 3']),
        },
        {
          helptext: 'Select multiple options',
        },
      ),
      radioGroup(
        'booleanRadio',
        {
          type: 'boolean',
          title: 'Boolean Radio Group',
          required: true,
          items: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No', isDefault: true },
          ],
        },
        {
          variant: 'boxed',
          orientations: 'row',
          helptext: 'Yes/No selection',
        },
      ),
      radioGroup(
        'stringRadio',
        {
          type: 'string',
          title: 'String Radio Group',
          required: true,
          items: createStringItemsV2([
            {
              label: 'Option 1',
              description: 'Description for option 1',
            },
            {
              label: 'Option 2',
              description: 'Description for option 2',
            },
          ]),
        },
        {
          variant: 'boxed',
          orientations: 'column',
          helptext: 'Radio selection with descriptions',
        },
      ),
    ]),
    step('numberAndCalculators', { title: 'Numbers & Calculators' }, [
      number(
        'basicNumber',
        {
          title: 'Basic Number',
          required: true,
          minimum: 0,
          maximum: 100,
        },
        {
          helptext: 'Number with min/max validation',
        },
      ),
      object(
        'calculatorExample',
        { required: true },
        {
          title: 'Calculator Example',
          description: 'Shows how calculated values work',
        },
        [
          number(
            'width',
            {
              title: 'Width',
              required: true,
              minimum: 0,
            },
            {},
          ),
          number(
            'height',
            {
              title: 'Height',
              required: true,
              minimum: 0,
            },
            {},
          ),
          customComponentsField(
            'calculator',
            {
              type: 'calculator',
              props: {
                variant: 'black',
                calculators: [
                  {
                    label: 'Area',
                    formula: 'width * height',
                    missingFieldsMessage: 'Please fill in both width and height',
                    unit: 'm²',
                  },
                ],
              },
            },
            {},
          ),
        ],
      ),
    ]),
    step('fileUploads', { title: 'File Uploads' }, [
      fileUploadMultiple(
        'buttonUpload',
        {
          title: 'Button Upload',
          required: true,
        },
        {
          type: 'button',
          helptext: 'Click button to upload files',
        },
      ),
      fileUploadMultiple(
        'dragAndDrop',
        {
          title: 'Drag and Drop Upload',
          required: true,
        },
        {
          type: 'dragAndDrop',
          accept: '.pdf,.jpg,.png',
          sizeLimit: 5000000,
          helptext: 'Drag files here or click to upload',
        },
      ),
    ]),

    step('dateAndTime', { title: 'Date & Time' }, [
      datePicker(
        'date',
        {
          title: 'Date Picker',
          required: true,
        },
        {
          helptext: 'Select a date',
        },
      ),
      timePicker(
        'time',
        {
          title: 'Time Picker',
          required: true,
        },
        {
          helptext: 'Select a time',
        },
      ),
    ]),
    step('checkboxes', { title: 'Checkboxes' }, [
      checkbox(
        'singleCheckbox',
        {
          title: 'Single Checkbox',
          required: true,
          constValue: true,
        },
        {
          checkboxLabel: 'I agree to the terms',
          variant: 'boxed',
          helptext: 'Must be checked to proceed',
        },
      ),
      checkboxGroup(
        'checkboxGroup',
        {
          title: 'Checkbox Group',
          items: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
          ],
        },
        {
          variant: 'boxed',
          helptext: 'Select multiple options',
        },
      ),
    ]),

    step('arrays', { title: 'Array Fields' }, [
      arrayField(
        'simpleArray',
        {
          title: 'Simple Array',
          required: true,
        },
        {
          variant: 'topLevel',
          addButtonLabel: 'Add Item',
          itemTitle: 'Item {index}',
        },
        [
          input(
            'itemName',
            {
              title: 'Item Name',
              type: 'text',
              required: true,
            },
            {},
          ),
        ],
      ),
      arrayField(
        'nestedArray',
        {
          title: 'Nested Array',
          required: true,
        },
        {
          variant: 'topLevel',
          addButtonLabel: 'Add Parent',
          itemTitle: 'Parent {index}',
        },
        [
          input(
            'parentName',
            {
              title: 'Parent Name',
              type: 'text',
              required: true,
            },
            {},
          ),
          arrayField(
            'children',
            {
              title: 'Children',
              required: true,
            },
            {
              variant: 'nested',
              addButtonLabel: 'Add Child',
              itemTitle: 'Child {index}',
            },
            [
              input(
                'childName',
                {
                  title: 'Child Name',
                  type: 'text',
                  required: true,
                },
                {},
              ),
            ],
          ),
        ],
      ),
    ]),
    step('conditionalFields', { title: 'Conditional Fields' }, [
      radioGroup(
        'showExtra',
        {
          type: 'boolean',
          title: 'Show Extra Fields?',
          required: true,
          items: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No', isDefault: true },
          ],
        },
        {
          variant: 'boxed',
          orientations: 'row',
          helptext: 'Additional fields and step will appear when selecting Yes',
        },
      ),
      conditionalFields(createCondition([[['showExtra'], { const: true }]]), [
        input(
          'extraField',
          {
            title: 'Extra Field',
            type: 'text',
            required: true,
          },
          {
            helptext: 'This field only appears conditionally',
          },
        ),
      ]),
    ]),
    conditionalStep(
      'conditionalStep',
      createCondition([[['conditionalFields', 'showExtra'], { const: true }]]),
      { title: 'Conditional Step' },
      [
        input(
          'conditionalStepField',
          {
            title: 'Conditional Step Field',
            type: 'text',
            required: true,
          },
          {
            helptext: 'This entire step appears conditionally',
          },
        ),
      ],
    ),
    step('customComponents', { title: 'Custom Components' }, [
      customComponentsField(
        'alert',
        {
          type: 'alert',
          props: {
            type: 'info',
            message: 'This is an info alert',
          },
        },
        {},
      ),
      customComponentsField(
        'accordion',
        {
          type: 'accordion',
          props: {
            title: 'Accordion title',
            content: 'This is a **markdown** text with [link](https://example.com)',
          },
        },
        {},
      ),
      customComponentsField(
        'additionalLinks',
        {
          type: 'additionalLinks',
          props: {
            links: [
              {
                title: 'External Link',
                href: 'https://example.com',
              },
            ],
          },
        },
        {},
      ),
    ]),
    step('layouts', { title: 'Layout Examples' }, [
      object(
        'columnsLayout',
        {
          required: true,
        },
        {
          columns: true,
          columnsRatio: '1/1',
        },
        [
          input(
            'column1',
            {
              title: 'Column 1',
              type: 'text',
              required: true,
            },
            {},
          ),
          input(
            'column2',
            {
              title: 'Column 2',
              type: 'text',
              required: true,
            },
            {},
          ),
        ],
      ),
      object(
        'boxedLayout',
        {
          required: true,
        },
        {
          objectDisplay: 'boxed',
          title: 'Boxed Section',
        },
        [
          input(
            'boxedField',
            {
              title: 'Field in Box',
              type: 'text',
              required: true,
            },
            {},
          ),
        ],
      ),
      input(
        'spacedField',
        {
          title: 'Field with Spacing',
          type: 'text',
        },
        {
          spaceTop: 'large',
          spaceBottom: 'medium',
        },
      ),
    ]),
  ],
)

import {
  arrayField,
  checkbox,
  checkboxGroup,
  conditionalFields,
  conditionalStep,
  customComponentsField,
  datePicker,
  fileUpload,
  input,
  number,
  object,
  radioGroup,
  schema,
  select,
  selectMultiple,
  step,
  textArea,
  timePicker,
} from '../generator/functions'
import { createCondition, createStringOptions, createStringOptionsV2 } from '../generator/helpers'

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
          helptextHeader: 'Basic text input example',
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
              helptextHeader: 'Slovak phone number format',
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
              helptextHeader: 'International Bank Account Number',
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
              helptextHeader: 'Format: number/number',
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
          helptextHeader: 'Multi-line text input',
        },
      ),
    ]),
    step('selectionInputs', { title: 'Selection Inputs' }, [
      select(
        'basicSelect',
        {
          title: 'Basic Select',
          required: true,
          options: createStringOptions(['Option 1', 'Option 2', 'Option 3']),
        },
        {
          placeholder: 'Select an option',
          helptextHeader: 'Single selection dropdown',
        },
      ),
      select(
        'selectWithDescriptions',
        {
          title: 'Select with Descriptions',
          required: true,
          options: createStringOptionsV2([
            {
              title: 'Option 1',
              description: 'Description for option 1',
            },
            {
              title: 'Option 2',
              description: 'Description for option 2',
            },
          ]),
        },
        {
          helptextHeader: 'Select with additional context',
        },
      ),
      selectMultiple(
        'multiSelect',
        {
          title: 'Multiple Select',
          required: true,
          options: createStringOptions(['Choice 1', 'Choice 2', 'Choice 3']),
        },
        {
          helptextHeader: 'Select multiple options',
        },
      ),
      radioGroup(
        'booleanRadio',
        {
          type: 'boolean',
          title: 'Boolean Radio Group',
          required: true,
          options: [
            { value: true, title: 'Yes' },
            { value: false, title: 'No', isDefault: true },
          ],
        },
        {
          variant: 'boxed',
          orientations: 'row',
          helptextHeader: 'Yes/No selection',
        },
      ),
      radioGroup(
        'stringRadio',
        {
          type: 'string',
          title: 'String Radio Group',
          required: true,
          options: createStringOptionsV2([
            {
              title: 'Option 1',
              description: 'Description for option 1',
            },
            {
              title: 'Option 2',
              description: 'Description for option 2',
            },
          ]),
        },
        {
          variant: 'boxed',
          orientations: 'column',
          helptextHeader: 'Radio selection with descriptions',
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
          helptextHeader: 'Number with min/max validation',
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
      fileUpload(
        'buttonUpload',
        {
          title: 'Button Upload',
          required: true,
          multiple: true,
        },
        {
          type: 'button',
          helptextHeader: 'Click button to upload files',
        },
      ),
      fileUpload(
        'dragAndDrop',
        {
          title: 'Drag and Drop Upload',
          required: true,
          multiple: true,
        },
        {
          type: 'dragAndDrop',
          accept: '.pdf,.jpg,.png',
          sizeLimit: 5000000,
          helptextHeader: 'Drag files here or click to upload',
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
          helptextHeader: 'Select a date',
        },
      ),
      timePicker(
        'time',
        {
          title: 'Time Picker',
          required: true,
        },
        {
          helptextHeader: 'Select a time',
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
          helptextHeader: 'Must be checked to proceed',
        },
      ),
      checkboxGroup(
        'checkboxGroup',
        {
          title: 'Checkbox Group',
          options: [
            { value: 'option1', title: 'Option 1' },
            { value: 'option2', title: 'Option 2' },
            { value: 'option3', title: 'Option 3' },
          ],
        },
        {
          variant: 'boxed',
          helptextHeader: 'Select multiple options',
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
          options: [
            { value: true, title: 'Yes' },
            { value: false, title: 'No', isDefault: true },
          ],
        },
        {
          variant: 'boxed',
          orientations: 'row',
          helptextHeader: 'Additional fields and step will appear when selecting Yes',
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
            helptextHeader: 'This field only appears conditionally',
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
            helptextHeader: 'This entire step appears conditionally',
          },
        ),
      ],
    ),
    step('customComponents', { title: 'Custom Components' }, [
      customComponentsField(
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
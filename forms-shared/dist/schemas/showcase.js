"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("../generator/functions");
const helpers_1 = require("../generator/helpers");
exports.default = (0, functions_1.schema)({
    title: 'Showcase',
}, {}, [
    (0, functions_1.step)('textInputs', { title: 'Text Inputs' }, [
        (0, functions_1.input)('basicText', {
            type: 'text',
            title: 'Basic Text Input',
            required: true,
        }, {
            placeholder: 'Enter text here',
            helptext: 'Basic text input example',
        }),
        (0, functions_1.object)('sizeVariants', { required: true }, {
            title: 'Size Variants',
        }, [
            (0, functions_1.input)('small', { type: 'text', title: 'Small Input' }, { size: 'small' }),
            (0, functions_1.input)('medium', { type: 'text', title: 'Medium Input' }, { size: 'medium' }),
            (0, functions_1.input)('full', { type: 'text', title: 'Full Width Input' }, { size: 'full' }),
        ]),
        (0, functions_1.object)('iconInputs', { required: true }, {
            title: 'Inputs with Icons',
        }, [
            (0, functions_1.input)('emailIcon', { type: 'email', title: 'Email with Icon' }, {
                leftIcon: 'mail',
                placeholder: 'Enter email',
            }),
            (0, functions_1.input)('phoneIcon', { type: 'ba-phone-number', title: 'Phone with Icon' }, {
                leftIcon: 'call',
                placeholder: 'Enter phone',
            }),
            (0, functions_1.input)('priceIcon', { type: 'text', title: 'Price with Icon' }, {
                leftIcon: 'euro',
                placeholder: 'Enter price',
            }),
        ]),
        (0, functions_1.object)('formattedInputs', { required: true }, {
            title: 'Formatted Inputs',
        }, [
            (0, functions_1.input)('phone', {
                type: 'ba-phone-number',
                title: 'Phone Number',
                required: true,
            }, {
                placeholder: '+421',
                helptext: 'Slovak phone number format',
            }),
            (0, functions_1.input)('iban', {
                type: 'ba-iban',
                title: 'IBAN',
                required: true,
            }, {
                helptext: 'International Bank Account Number',
            }),
            (0, functions_1.input)('ratio', {
                type: 'ba-ratio',
                title: 'Ratio',
                required: true,
            }, {
                placeholder: '1/2',
                helptext: 'Format: number/number',
            }),
        ]),
        (0, functions_1.textArea)('description', {
            title: 'Text Area',
            required: true,
        }, {
            placeholder: 'Enter longer text here',
            helptext: 'Multi-line text input',
        }),
    ]),
    (0, functions_1.step)('selectionInputs', { title: 'Selection Inputs' }, [
        (0, functions_1.select)('basicSelect', {
            title: 'Basic Select',
            required: true,
            items: (0, helpers_1.createStringItems)(['Option 1', 'Option 2', 'Option 3']),
        }, {
            placeholder: 'Select an option',
            helptext: 'Single selection dropdown',
        }),
        (0, functions_1.select)('selectWithDescriptions', {
            title: 'Select with Descriptions',
            required: true,
            items: (0, helpers_1.createStringItemsV2)([
                {
                    label: 'Option 1',
                    description: 'Description for option 1',
                },
                {
                    label: 'Option 2',
                    description: 'Description for option 2',
                },
            ]),
        }, {
            helptext: 'Select with additional context',
        }),
        (0, functions_1.selectMultiple)('multiSelect', {
            title: 'Multiple Select',
            required: true,
            items: (0, helpers_1.createStringItems)(['Choice 1', 'Choice 2', 'Choice 3']),
        }, {
            helptext: 'Select multiple options',
        }),
        (0, functions_1.radioGroup)('booleanRadio', {
            type: 'boolean',
            title: 'Boolean Radio Group',
            required: true,
            items: [
                { value: true, label: 'Yes' },
                { value: false, label: 'No', isDefault: true },
            ],
        }, {
            variant: 'boxed',
            orientations: 'row',
            helptext: 'Yes/No selection',
        }),
        (0, functions_1.radioGroup)('stringRadio', {
            type: 'string',
            title: 'String Radio Group',
            required: true,
            items: (0, helpers_1.createStringItemsV2)([
                {
                    label: 'Option 1',
                    description: 'Description for option 1',
                },
                {
                    label: 'Option 2',
                    description: 'Description for option 2',
                },
            ]),
        }, {
            variant: 'boxed',
            orientations: 'column',
            helptext: 'Radio selection with descriptions',
        }),
    ]),
    (0, functions_1.step)('numberAndCalculators', { title: 'Numbers & Calculators' }, [
        (0, functions_1.number)('basicNumber', {
            title: 'Basic Number',
            required: true,
            minimum: 0,
            maximum: 100,
        }, {
            helptext: 'Number with min/max validation',
        }),
        (0, functions_1.object)('calculatorExample', { required: true }, {
            title: 'Calculator Example',
            description: 'Shows how calculated values work',
        }, [
            (0, functions_1.number)('width', {
                title: 'Width',
                required: true,
                minimum: 0,
            }, {}),
            (0, functions_1.number)('height', {
                title: 'Height',
                required: true,
                minimum: 0,
            }, {}),
            (0, functions_1.customComponentsField)('calculator', {
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
            }, {}),
        ]),
    ]),
    (0, functions_1.step)('fileUploads', { title: 'File Uploads' }, [
        (0, functions_1.fileUpload)('buttonUpload', {
            title: 'Button Upload',
            required: true,
            multiple: true,
        }, {
            type: 'button',
            helptext: 'Click button to upload files',
        }),
        (0, functions_1.fileUpload)('dragAndDrop', {
            title: 'Drag and Drop Upload',
            required: true,
            multiple: true,
        }, {
            type: 'dragAndDrop',
            accept: '.pdf,.jpg,.png',
            sizeLimit: 5000000,
            helptext: 'Drag files here or click to upload',
        }),
    ]),
    (0, functions_1.step)('dateAndTime', { title: 'Date & Time' }, [
        (0, functions_1.datePicker)('date', {
            title: 'Date Picker',
            required: true,
        }, {
            helptext: 'Select a date',
        }),
        (0, functions_1.timePicker)('time', {
            title: 'Time Picker',
            required: true,
        }, {
            helptext: 'Select a time',
        }),
    ]),
    (0, functions_1.step)('checkboxes', { title: 'Checkboxes' }, [
        (0, functions_1.checkbox)('singleCheckbox', {
            title: 'Single Checkbox',
            required: true,
            constValue: true,
        }, {
            checkboxLabel: 'I agree to the terms',
            variant: 'boxed',
            helptext: 'Must be checked to proceed',
        }),
        (0, functions_1.checkboxGroup)('checkboxGroup', {
            title: 'Checkbox Group',
            items: [
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
                { value: 'option3', label: 'Option 3' },
            ],
        }, {
            variant: 'boxed',
            helptext: 'Select multiple options',
        }),
    ]),
    (0, functions_1.step)('arrays', { title: 'Array Fields' }, [
        (0, functions_1.arrayField)('simpleArray', {
            title: 'Simple Array',
            required: true,
        }, {
            variant: 'topLevel',
            addButtonLabel: 'Add Item',
            itemTitle: 'Item {index}',
        }, [
            (0, functions_1.input)('itemName', {
                title: 'Item Name',
                type: 'text',
                required: true,
            }, {}),
        ]),
        (0, functions_1.arrayField)('nestedArray', {
            title: 'Nested Array',
            required: true,
        }, {
            variant: 'topLevel',
            addButtonLabel: 'Add Parent',
            itemTitle: 'Parent {index}',
        }, [
            (0, functions_1.input)('parentName', {
                title: 'Parent Name',
                type: 'text',
                required: true,
            }, {}),
            (0, functions_1.arrayField)('children', {
                title: 'Children',
                required: true,
            }, {
                variant: 'nested',
                addButtonLabel: 'Add Child',
                itemTitle: 'Child {index}',
            }, [
                (0, functions_1.input)('childName', {
                    title: 'Child Name',
                    type: 'text',
                    required: true,
                }, {}),
            ]),
        ]),
    ]),
    (0, functions_1.step)('conditionalFields', { title: 'Conditional Fields' }, [
        (0, functions_1.radioGroup)('showExtra', {
            type: 'boolean',
            title: 'Show Extra Fields?',
            required: true,
            items: [
                { value: true, label: 'Yes' },
                { value: false, label: 'No', isDefault: true },
            ],
        }, {
            variant: 'boxed',
            orientations: 'row',
            helptext: 'Additional fields and step will appear when selecting Yes',
        }),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['showExtra'], { const: true }]]), [
            (0, functions_1.input)('extraField', {
                title: 'Extra Field',
                type: 'text',
                required: true,
            }, {
                helptext: 'This field only appears conditionally',
            }),
        ]),
    ]),
    (0, functions_1.conditionalStep)('conditionalStep', (0, helpers_1.createCondition)([[['conditionalFields', 'showExtra'], { const: true }]]), { title: 'Conditional Step' }, [
        (0, functions_1.input)('conditionalStepField', {
            title: 'Conditional Step Field',
            type: 'text',
            required: true,
        }, {
            helptext: 'This entire step appears conditionally',
        }),
    ]),
    (0, functions_1.step)('customComponents', { title: 'Custom Components' }, [
        (0, functions_1.customComponentsField)('alert', {
            type: 'alert',
            props: {
                type: 'info',
                message: 'This is an info alert',
            },
        }, {}),
        (0, functions_1.customComponentsField)('accordion', {
            type: 'accordion',
            props: {
                title: 'Accordion title',
                content: 'This is a **markdown** text with [link](https://example.com)',
            },
        }, {}),
        (0, functions_1.customComponentsField)('additionalLinks', {
            type: 'additionalLinks',
            props: {
                links: [
                    {
                        title: 'External Link',
                        href: 'https://example.com',
                    },
                ],
            },
        }, {}),
    ]),
    (0, functions_1.step)('layouts', { title: 'Layout Examples' }, [
        (0, functions_1.object)('columnsLayout', {
            required: true,
        }, {
            columns: true,
            columnsRatio: '1/1',
        }, [
            (0, functions_1.input)('column1', {
                title: 'Column 1',
                type: 'text',
                required: true,
            }, {}),
            (0, functions_1.input)('column2', {
                title: 'Column 2',
                type: 'text',
                required: true,
            }, {}),
        ]),
        (0, functions_1.object)('boxedLayout', {
            required: true,
        }, {
            objectDisplay: 'boxed',
            title: 'Boxed Section',
        }, [
            (0, functions_1.input)('boxedField', {
                title: 'Field in Box',
                type: 'text',
                required: true,
            }, {}),
        ]),
        (0, functions_1.input)('spacedField', {
            title: 'Field with Spacing',
            type: 'text',
        }, {
            spaceTop: 'large',
            spaceBottom: 'medium',
        }),
    ]),
]);

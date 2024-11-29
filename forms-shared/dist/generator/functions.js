"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.skipSchema = exports.skipUiSchema = exports.schema = exports.conditionalFields = exports.conditionalStep = exports.step = exports.arrayField = exports.object = exports.customComponentsField = exports.timePicker = exports.datePicker = exports.fileUpload = exports.checkboxGroup = exports.checkbox = exports.textArea = exports.radioGroup = exports.number = exports.input = exports.selectMultiple = exports.select = void 0;
const intersection_1 = __importDefault(require("lodash/intersection"));
const kebabCase_1 = __importDefault(require("lodash/kebabCase"));
const uniq_1 = __importDefault(require("lodash/uniq"));
const helpers_1 = require("./helpers");
const uiOptionsTypes_1 = require("./uiOptionsTypes");
const optionItems_1 = require("./optionItems");
const select = (property, options, uiOptions) => {
    return {
        property,
        schema: (0, helpers_1.removeUndefinedValues)({
            type: 'string',
            title: options.title,
            enum: (0, optionItems_1.createEnumSchemaEnum)(options.items),
            default: (0, optionItems_1.createEnumSchemaDefault)(options.items),
        }),
        uiSchema: (0, helpers_1.removeUndefinedValues)({
            'ui:widget': uiOptionsTypes_1.BaWidgetType.Select,
            'ui:options': {
                ...uiOptions,
                enumMetadata: (0, optionItems_1.createEnumMetadata)(options.items),
            },
        }),
        required: Boolean(options.required),
    };
};
exports.select = select;
const selectMultiple = (property, options, uiOptions) => {
    return {
        property,
        schema: (0, helpers_1.removeUndefinedValues)({
            type: 'array',
            title: options.title,
            items: {
                type: 'string',
                enum: (0, optionItems_1.createEnumSchemaEnum)(options.items),
            },
            minItems: options.minItems ?? (options.required ? 1 : undefined),
            maxItems: options.maxItems,
            uniqueItems: true,
            default: (0, optionItems_1.createEnumSchemaDefaultMultiple)(options.items),
        }),
        uiSchema: (0, helpers_1.removeUndefinedValues)({
            'ui:widget': uiOptionsTypes_1.BaWidgetType.SelectMultiple,
            'ui:options': {
                ...uiOptions,
                enumMetadata: (0, optionItems_1.createEnumMetadata)(options.items),
            },
        }),
        required: Boolean(options.required),
    };
};
exports.selectMultiple = selectMultiple;
const input = (property, options, uiOptions) => {
    const { inputType, format } = (() => {
        if (options.type === 'email') {
            return {
                inputType: 'email',
                format: 'email',
            };
        }
        if (options.type === 'text' || options.type === 'password') {
            return {
                inputType: options.type,
                format: undefined,
            };
        }
        return {
            inputType: (0, helpers_1.getInputTypeForAjvFormat)(options.type),
            format: options.type,
        };
    })();
    return {
        property,
        schema: (0, helpers_1.removeUndefinedValues)({
            type: 'string',
            title: options.title,
            format,
            default: options.default,
        }),
        uiSchema: (0, helpers_1.removeUndefinedValues)({
            'ui:widget': uiOptionsTypes_1.BaWidgetType.Input,
            'ui:label': false,
            'ui:options': { ...uiOptions, inputType },
        }),
        required: Boolean(options.required),
    };
};
exports.input = input;
const number = (property, options, uiOptions) => {
    return {
        property,
        schema: (0, helpers_1.removeUndefinedValues)({
            type: options.type ?? 'number',
            title: options.title,
            default: options.default,
            minimum: options.minimum,
            exclusiveMinimum: options.exclusiveMinimum,
            maximum: options.maximum,
            exclusiveMaximum: options.exclusiveMaximum,
        }),
        uiSchema: (0, helpers_1.removeUndefinedValues)({
            'ui:widget': uiOptionsTypes_1.BaWidgetType.Number,
            'ui:label': false,
            'ui:options': { ...uiOptions },
        }),
        required: Boolean(options.required),
    };
};
exports.number = number;
const radioGroup = (property, options, uiOptions) => {
    return {
        property,
        schema: (0, helpers_1.removeUndefinedValues)({
            type: options.type,
            title: options.title,
            enum: (0, optionItems_1.createEnumSchemaEnum)(options.items),
            default: (0, optionItems_1.createEnumSchemaDefault)(options.items),
        }),
        uiSchema: (0, helpers_1.removeUndefinedValues)({
            'ui:widget': uiOptionsTypes_1.BaWidgetType.RadioGroup,
            'ui:options': {
                ...uiOptions,
                enumMetadata: (0, optionItems_1.createEnumMetadata)(options.items),
            },
        }),
        required: Boolean(options.required),
    };
};
exports.radioGroup = radioGroup;
const textArea = (property, options, uiOptions) => {
    return {
        property,
        schema: (0, helpers_1.removeUndefinedValues)({ type: 'string', title: options.title }),
        uiSchema: (0, helpers_1.removeUndefinedValues)({
            'ui:widget': uiOptionsTypes_1.BaWidgetType.TextArea,
            'ui:label': false,
            'ui:options': uiOptions,
        }),
        required: Boolean(options.required),
    };
};
exports.textArea = textArea;
const checkbox = (property, options, uiOptions) => {
    return {
        property,
        schema: (0, helpers_1.removeUndefinedValues)({
            type: 'boolean',
            title: options.title,
            default: options.default,
            const: typeof options.constValue === 'boolean' ? options.constValue : undefined,
        }),
        uiSchema: (0, helpers_1.removeUndefinedValues)({
            'ui:widget': uiOptionsTypes_1.BaWidgetType.Checkbox,
            'ui:options': uiOptions,
        }),
        required: Boolean(options.required),
    };
};
exports.checkbox = checkbox;
const checkboxGroup = (property, options, uiOptions) => {
    return {
        property,
        schema: (0, helpers_1.removeUndefinedValues)({
            type: 'array',
            title: options.title,
            minItems: options.minItems ?? (options.required ? 1 : undefined),
            maxItems: options.maxItems,
            uniqueItems: true,
            items: {
                enum: (0, optionItems_1.createEnumSchemaEnum)(options.items),
            },
            default: (0, optionItems_1.createEnumSchemaDefaultMultiple)(options.items),
        }),
        uiSchema: (0, helpers_1.removeUndefinedValues)({
            'ui:widget': uiOptionsTypes_1.BaWidgetType.CheckboxGroup,
            'ui:options': {
                ...uiOptions,
                enumMetadata: (0, optionItems_1.createEnumMetadata)(options.items),
            },
        }),
        required: Boolean(options.required),
    };
};
exports.checkboxGroup = checkboxGroup;
const fileUpload = (property, options, uiOptions) => {
    return {
        property,
        schema: (0, helpers_1.removeUndefinedValues)(options.multiple
            ? {
                title: options.title,
                type: 'array',
                items: {
                    type: 'string',
                    format: 'ba-file-uuid',
                    file: true,
                },
                minItems: options.required ? 1 : undefined,
                default: [],
            }
            : {
                title: options.title,
                type: 'string',
                format: 'ba-file-uuid',
                file: true,
            }),
        uiSchema: (0, helpers_1.removeUndefinedValues)({
            'ui:widget': options.multiple ? uiOptionsTypes_1.BaWidgetType.FileUploadMultiple : uiOptionsTypes_1.BaWidgetType.FileUpload,
            'ui:options': uiOptions,
        }),
        required: Boolean(options.required),
    };
};
exports.fileUpload = fileUpload;
const datePicker = (property, options, uiOptions) => {
    return {
        property,
        schema: (0, helpers_1.removeUndefinedValues)({
            type: 'string',
            format: 'date',
            title: options.title,
            default: options.default,
        }),
        uiSchema: (0, helpers_1.removeUndefinedValues)({
            'ui:widget': uiOptionsTypes_1.BaWidgetType.DatePicker,
            'ui:options': uiOptions,
        }),
        required: Boolean(options.required),
    };
};
exports.datePicker = datePicker;
const timePicker = (property, options, uiOptions) => {
    return {
        property,
        schema: (0, helpers_1.removeUndefinedValues)({
            type: 'string',
            format: 'ba-time',
            title: options.title,
            default: options.default,
        }),
        uiSchema: (0, helpers_1.removeUndefinedValues)({
            'ui:widget': uiOptionsTypes_1.BaWidgetType.TimePicker,
            'ui:options': uiOptions,
        }),
        required: Boolean(options.required),
    };
};
exports.timePicker = timePicker;
/**
 * This is a special field that represents no data in the schema. It is a "hacky way", but the easiest how to display
 * custom components in the UI anywhere we need.
 */
const customComponentsField = (property, customComponents, uiOptions) => ({
    property,
    // This is probably the best way how to represent no data in the schema, but still have the field in the UI.
    schema: (0, helpers_1.removeUndefinedValues)({
        anyOf: [{}],
    }),
    uiSchema: (0, helpers_1.removeUndefinedValues)({
        'ui:field': uiOptionsTypes_1.BaFieldType.CustomComponents,
        'ui:options': {
            ...uiOptions,
            customComponents: Array.isArray(customComponents) ? customComponents : [customComponents],
        },
        // If this wouldn't be present, the RJSF will render the field in place of `customComponent__anyOf_select`, now it
        // is rendered directly where it should be.
        'ui:fieldReplacesAnyOrOneOf': true,
    }),
    required: false,
});
exports.customComponentsField = customComponentsField;
/**
 * Object is the most complex field type to handle. For example, step is an instance of object. In JSONSchema, ordinary
 * fields are located in the `properties` key, while conditional fields are located in the `allOf` key. However, to
 * simplify the usage of the generator we provide a single interface for both ordinary and conditional fields. This
 * function splits them to their respective locations.
 */
const object = (property, options, uiOptions, fields) => {
    const filteredFields = fields.filter((field) => field !== null);
    const ordinaryFields = filteredFields.filter((field) => !('condition' in field));
    const ordinaryFieldsWithSchema = ordinaryFields.filter((field) => !field.skipSchema);
    const ordinaryFieldsWithUiSchema = ordinaryFields.filter((field) => !field.skipUiSchema);
    const conditionalFields = filteredFields.filter((field) => 'condition' in field);
    const fieldProperties = filteredFields
        .filter((field) => ('skipUiSchema' in field ? !field.skipUiSchema : true))
        .flatMap((field) => ('condition' in field ? field.fieldProperties : [field.property]))
        .filter((field) => field !== null);
    if (fieldProperties.length !== (0, uniq_1.default)(fieldProperties).length) {
        throw new Error(`Field properties must be unique, but there are duplicates: ${fieldProperties
            .filter((field, index) => fieldProperties.indexOf(field) !== index)
            .join(', ')}`);
    }
    const getSchema = () => {
        const allOf = conditionalFields.map((field) => ({
            if: field.condition,
            then: field.thenSchema,
            else: field.elseSchema,
        }));
        return (0, helpers_1.removeUndefinedValues)({
            type: 'object',
            properties: Object.fromEntries(ordinaryFieldsWithSchema.map((field) => [field.property, field.schema])),
            required: ordinaryFieldsWithSchema
                .filter((field) => field.required)
                .map((field) => field.property),
            allOf: allOf.length > 0 ? allOf : undefined,
        });
    };
    const getUiSchema = () => {
        const ordinaryFieldsUiSchema = Object.fromEntries(ordinaryFieldsWithUiSchema.map((field) => [field.property, field.uiSchema]));
        const conditionalFieldsUiSchema = conditionalFields.reduce((acc, field) => ({ ...acc, ...field.uiSchema }), {});
        return (0, helpers_1.removeUndefinedValues)({
            ...ordinaryFieldsUiSchema,
            ...conditionalFieldsUiSchema,
            // As the order of the properties is not guaranteed in JSON and is lost when having the fields both in `properties`
            // and `allOf`, we need to provide it manually.
            'ui:order': fieldProperties,
            'ui:options': uiOptions,
        });
    };
    return {
        property,
        schema: getSchema(),
        uiSchema: getUiSchema(),
        required: Boolean(options.required),
        fieldProperties,
    };
};
exports.object = object;
const arrayField = (property, options, uiOptions, fields) => {
    const { schema: objectSchema, uiSchema: objectUiSchema } = (0, exports.object)(null, {}, {}, fields);
    return {
        property,
        schema: (0, helpers_1.removeUndefinedValues)({
            title: options.title,
            type: 'array',
            items: objectSchema,
            minItems: options.minItems ?? (options.required ? 1 : undefined),
            maxItems: options.maxItems,
        }),
        uiSchema: (0, helpers_1.removeUndefinedValues)({
            'ui:options': uiOptions,
            items: objectUiSchema,
        }),
        required: Boolean(options.required),
    };
};
exports.arrayField = arrayField;
const step = (property, options, fields) => {
    const { schema, uiSchema } = (0, exports.object)(property, { required: true }, {}, fields);
    const getHash = () => {
        if (options.customHash) {
            return options.customHash;
        }
        if (options.stepperTitle) {
            return (0, kebabCase_1.default)(options.stepperTitle);
        }
        return (0, kebabCase_1.default)(options.title);
    };
    return {
        property,
        schema: (0, helpers_1.removeUndefinedValues)({
            type: 'object',
            properties: {
                [property]: {
                    title: options.title,
                    description: options.description,
                    ...schema,
                },
            },
            required: [property],
        }),
        uiSchema: (0, helpers_1.removeUndefinedValues)({
            ...uiSchema,
            'ui:options': {
                ...uiSchema['ui:options'],
                stepperTitle: options.stepperTitle,
                stepQueryParam: getHash(),
            },
        }),
    };
};
exports.step = step;
const conditionalStep = (property, condition, options, fields) => {
    const { schema, uiSchema } = (0, exports.step)(property, options, fields);
    return {
        property,
        schema: (0, helpers_1.removeUndefinedValues)({ if: condition, then: schema }),
        uiSchema: uiSchema,
        required: true,
    };
};
exports.conditionalStep = conditionalStep;
const conditionalFields = (condition, thenFields, elseFields = []) => {
    const filteredThenFields = thenFields.filter((field) => field !== null);
    const filteredElseFields = elseFields.filter((field) => field !== null);
    const { schema: thenSchema, uiSchema: thenUiSchema, fieldProperties: thenFieldProperties, } = (0, exports.object)(null, {}, {}, filteredThenFields);
    const { schema: elseSchema, uiSchema: elseUiSchema, fieldProperties: elseFieldProperties, } = (0, exports.object)(null, {}, {}, filteredElseFields);
    const intersectionProperties = (0, intersection_1.default)(thenFieldProperties, elseFieldProperties);
    if (intersectionProperties.length > 0) {
        throw new Error(`Field properties must be unique, but there are duplicates between then and else fields: ${intersectionProperties.join(', ')}`);
    }
    return {
        condition,
        thenSchema,
        elseSchema: filteredElseFields.length > 0 ? elseSchema : undefined,
        uiSchema: (0, helpers_1.removeUndefinedValues)({
            ...thenUiSchema,
            ...(elseFields.length > 0 ? elseUiSchema : {}),
        }),
        fieldProperties: [...thenFieldProperties, ...elseFieldProperties],
    };
};
exports.conditionalFields = conditionalFields;
const schema = (options, uiOptions, steps) => {
    const filteredSteps = steps.filter((stepInner) => stepInner != null);
    return {
        schema: (0, helpers_1.removeUndefinedValues)({
            ...options,
            allOf: filteredSteps.map((stepInner) => stepInner.schema),
        }),
        uiSchema: (0, helpers_1.removeUndefinedValues)({
            ...Object.fromEntries(filteredSteps.map((stepInner) => [stepInner.property, stepInner.uiSchema])),
            'ui:options': uiOptions,
            'ui:hideError': true,
        }),
    };
};
exports.schema = schema;
// TODO: Document
const skipUiSchema = (field) => {
    return { ...field, skipUiSchema: true };
};
exports.skipUiSchema = skipUiSchema;
// TODO: Document
const skipSchema = (field) => {
    return { ...field, skipSchema: true };
};
exports.skipSchema = skipSchema;

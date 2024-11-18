import type { RJSFSchema, UiSchema } from '@rjsf/utils'
import intersection from 'lodash/intersection'
import kebabCase from 'lodash/kebabCase'
import uniq from 'lodash/uniq'

import { getInputTypeForAjvFormat, removeUndefinedValues } from './helpers'
import {
  ArrayFieldUiOptions,
  BaWidgetType,
  CheckboxGroupUiOptions,
  CheckboxUiOptions,
  CustomComponentFieldUiOptions,
  CustomComponentType,
  DatePickerUiOptions,
  FileUploadUiOptions,
  InputUiOptions,
  markdownTextPrefix,
  NumberUiOptions,
  ObjectFieldUiOptions,
  RadioGroupUiOptions,
  SchemaUiOptions,
  SelectUiOptions,
  StepUiOptions,
  TextAreaUiOptions,
  TimePickerUiOptions,
} from './uiOptionsTypes'
import { BaAjvInputFormat } from '../form-utils/ajvFormats'
import {
  createEnumMetadata,
  createEnumSchemaDefault,
  createEnumSchemaDefaultMultiple,
  createEnumSchemaEnum,
  OptionItem,
} from './optionItems'

export type Schemas = {
  schema: RJSFSchema
  uiSchema: UiSchema
}

export type Field = {
  property: string
  schema: RJSFSchema
  uiSchema: UiSchema
  required: boolean
  skipUiSchema?: boolean
  skipSchema?: boolean
}

type ObjectField = Omit<Field, 'property'> & {
  property: string | null
  fieldProperties: string[]
}

type ConditionalFields = {
  condition: RJSFSchema
  thenSchema: RJSFSchema
  elseSchema?: RJSFSchema
  uiSchema: UiSchema
  fieldProperties: string[]
}

export type FieldType = Field | ConditionalFields | ObjectField

type BaseOptions = {
  title: string
  required?: boolean
}

export const select = (
  property: string,
  options: BaseOptions & {
    items: OptionItem<string>[]
  },
  uiOptions: Omit<SelectUiOptions, 'enumMetadata'>,
): Field => {
  return {
    property,
    schema: removeUndefinedValues({
      type: 'string',
      title: options.title,
      enum: createEnumSchemaEnum(options.items),
      default: createEnumSchemaDefault(options.items),
    }),
    uiSchema: removeUndefinedValues({
      'ui:widget': BaWidgetType.Select,
      'ui:options': {
        ...uiOptions,
        enumMetadata: createEnumMetadata(options.items),
      },
    }),
    required: Boolean(options.required),
  }
}

export const selectMultiple = (
  property: string,
  options: BaseOptions & {
    minItems?: number
    maxItems?: number
    items: OptionItem<string>[]
  },
  uiOptions: Omit<SelectUiOptions, 'enumMetadata'>,
): Field => {
  return {
    property,
    schema: removeUndefinedValues({
      type: 'array',
      title: options.title,
      items: {
        type: 'string',
        enum: createEnumSchemaEnum(options.items),
      },
      minItems: options.minItems ?? (options.required ? 1 : undefined),
      maxItems: options.maxItems,
      uniqueItems: true,
      default: createEnumSchemaDefaultMultiple(options.items),
    }),
    uiSchema: removeUndefinedValues({
      'ui:widget': BaWidgetType.SelectMultiple,
      'ui:options': {
        ...uiOptions,
        enumMetadata: createEnumMetadata(options.items),
      },
    }),
    required: Boolean(options.required),
  }
}

export const input = (
  property: string,
  options: BaseOptions & {
    type: 'text' | 'password' | 'email' | BaAjvInputFormat
    default?: string
  },
  uiOptions: Omit<InputUiOptions, 'inputType'>,
): Field => {
  const { inputType, format } = (() => {
    if (options.type === 'email') {
      return {
        inputType: 'email',
        format: 'email',
      }
    }

    if (options.type === 'text' || options.type === 'password') {
      return {
        inputType: options.type,
        format: undefined,
      }
    }

    return {
      inputType: getInputTypeForAjvFormat(options.type),
      format: options.type,
    }
  })()

  return {
    property,
    schema: removeUndefinedValues({
      type: 'string',
      title: options.title,
      format,
      default: options.default,
    }),
    uiSchema: removeUndefinedValues({
      'ui:widget': BaWidgetType.Input,
      'ui:label': false,
      'ui:options': { ...uiOptions, inputType },
    }),
    required: Boolean(options.required),
  }
}

export const number = (
  property: string,
  options: BaseOptions & {
    type?: 'number' | 'integer'
    default?: number
    minimum?: number
    exclusiveMinimum?: number
    maximum?: number
    exclusiveMaximum?: number
  },
  uiOptions: NumberUiOptions,
): Field => {
  return {
    property,
    schema: removeUndefinedValues({
      type: options.type ?? 'number',
      title: options.title,
      default: options.default,
      minimum: options.minimum,
      exclusiveMinimum: options.exclusiveMinimum,
      maximum: options.maximum,
      exclusiveMaximum: options.exclusiveMaximum,
    }),
    uiSchema: removeUndefinedValues({
      'ui:widget': BaWidgetType.Number,
      'ui:label': false,
      'ui:options': { ...uiOptions },
    }),
    required: Boolean(options.required),
  }
}

type StringToType<T> = T extends 'string' ? string : T extends 'boolean' ? boolean : never

export const radioGroup = <ValueType extends 'string' | 'boolean'>(
  property: string,
  options: BaseOptions & {
    type: ValueType
    items: OptionItem<StringToType<ValueType>>[]
  },
  uiOptions: Omit<RadioGroupUiOptions, 'enumMetadata'>,
): Field => {
  return {
    property,
    schema: removeUndefinedValues({
      type: options.type,
      title: options.title,
      enum: createEnumSchemaEnum(options.items),
      default: createEnumSchemaDefault(options.items),
    }),
    uiSchema: removeUndefinedValues({
      'ui:widget': BaWidgetType.RadioGroup,
      'ui:options': {
        ...uiOptions,
        enumMetadata: createEnumMetadata(options.items),
      },
    }),
    required: Boolean(options.required),
  }
}

export const textArea = (
  property: string,
  options: BaseOptions,
  uiOptions: TextAreaUiOptions,
): Field => {
  return {
    property,
    schema: removeUndefinedValues({ type: 'string', title: options.title }),
    uiSchema: removeUndefinedValues({
      'ui:widget': BaWidgetType.TextArea,
      'ui:label': false,
      'ui:options': uiOptions,
    }),
    required: Boolean(options.required),
  }
}

export const checkbox = (
  property: string,
  options: BaseOptions & { default?: boolean; constValue?: boolean },
  uiOptions: CheckboxUiOptions,
): Field => {
  return {
    property,
    schema: removeUndefinedValues({
      type: 'boolean',
      title: options.title,
      default: options.default,
      // Temporarily changed to enum until this issue is resolved:
      // https://github.com/rjsf-team/react-jsonschema-form/issues/4344
      enum: typeof options.constValue === 'boolean' ? [options.constValue] : undefined,
    }),
    uiSchema: removeUndefinedValues({
      'ui:widget': BaWidgetType.Checkbox,
      'ui:options': uiOptions,
    }),
    required: Boolean(options.required),
  }
}

export const checkboxGroup = (
  property: string,
  options: BaseOptions & {
    minItems?: number
    maxItems?: number
    items: OptionItem<string>[]
  },
  uiOptions: Omit<CheckboxGroupUiOptions, 'enumMetadata'>,
): Field => {
  return {
    property,
    schema: removeUndefinedValues({
      type: 'array',
      title: options.title,
      minItems: options.minItems ?? (options.required ? 1 : undefined),
      maxItems: options.maxItems,
      uniqueItems: true,
      items: {
        enum: createEnumSchemaEnum(options.items),
      },
      default: createEnumSchemaDefaultMultiple(options.items),
    }),
    uiSchema: removeUndefinedValues({
      'ui:widget': BaWidgetType.CheckboxGroup,
      'ui:options': {
        ...uiOptions,
        enumMetadata: createEnumMetadata(options.items),
      },
    }),
    required: Boolean(options.required),
  }
}

export const fileUpload = (
  property: string,
  options: BaseOptions & { multiple?: boolean },
  uiOptions: FileUploadUiOptions,
): Field => {
  return {
    property,
    schema: removeUndefinedValues(
      options.multiple
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
          },
    ),
    uiSchema: removeUndefinedValues({
      'ui:widget': options.multiple ? BaWidgetType.FileUploadMultiple : BaWidgetType.FileUpload,
      'ui:options': uiOptions,
    }),
    required: Boolean(options.required),
  }
}

export const datePicker = (
  property: string,
  options: BaseOptions & { default?: string },
  uiOptions: DatePickerUiOptions,
): Field => {
  return {
    property,
    schema: removeUndefinedValues({
      type: 'string',
      format: 'date',
      title: options.title,
      default: options.default,
    }),
    uiSchema: removeUndefinedValues({
      'ui:widget': BaWidgetType.DatePicker,
      'ui:options': uiOptions,
    }),
    required: Boolean(options.required),
  }
}

export const timePicker = (
  property: string,
  options: BaseOptions & { default?: string },
  uiOptions: TimePickerUiOptions,
): Field => {
  return {
    property,
    schema: removeUndefinedValues({
      type: 'string',
      format: 'ba-time',
      title: options.title,
      default: options.default,
    }),
    uiSchema: removeUndefinedValues({
      'ui:widget': BaWidgetType.TimePicker,
      'ui:options': uiOptions,
    }),
    required: Boolean(options.required),
  }
}

/**
 * This is a special field that represents no data in the schema. It is a "hacky way", but the easiest how to display
 * custom components in the UI anywhere we need.
 */
export const customComponentsField = (
  property: string,
  customComponents: CustomComponentType | CustomComponentType[],
  uiOptions: Omit<CustomComponentFieldUiOptions, 'customComponents'>,
): Field => ({
  property,
  schema: removeUndefinedValues({
    anyOf: [{}],
  }),
  uiSchema: removeUndefinedValues({
    'ui:widget': BaWidgetType.CustomComponents,
    'ui:options': {
      ...uiOptions,
      customComponents: Array.isArray(customComponents) ? customComponents : [customComponents],
    },
  }),
  required: false,
})

/**
 * Object is the most complex field type to handle. For example, step is an instance of object. In JSONSchema, ordinary
 * fields are located in the `properties` key, while conditional fields are located in the `allOf` key. However, to
 * simplify the usage of the generator we provide a single interface for both ordinary and conditional fields. This
 * function splits them to their respective locations.
 */
export const object = (
  property: string | null,
  options: { required?: boolean },
  uiOptions: ObjectFieldUiOptions,
  fields: (FieldType | null)[],
): ObjectField => {
  const filteredFields = fields.filter((field) => field !== null) as FieldType[]
  const ordinaryFields = filteredFields.filter((field) => !('condition' in field)) as Field[]
  const ordinaryFieldsWithSchema = ordinaryFields.filter((field) => !field.skipSchema)
  const ordinaryFieldsWithUiSchema = ordinaryFields.filter((field) => !field.skipUiSchema)
  const conditionalFields = filteredFields.filter(
    (field) => 'condition' in field,
  ) as ConditionalFields[]
  const fieldProperties = filteredFields
    .filter((field) => ('skipUiSchema' in field ? !field.skipUiSchema : true))
    .flatMap((field) => ('condition' in field ? field.fieldProperties : [field.property]))
    .filter((field) => field !== null) as string[]

  if (fieldProperties.length !== uniq(fieldProperties).length) {
    throw new Error(
      `Field properties must be unique, but there are duplicates: ${fieldProperties
        .filter((field, index) => fieldProperties.indexOf(field) !== index)
        .join(', ')}`,
    )
  }

  const getSchema = () => {
    const allOf = conditionalFields.map((field) => ({
      if: field.condition,
      then: field.thenSchema,
      else: field.elseSchema,
    }))

    return removeUndefinedValues({
      type: 'object' as const,
      properties: Object.fromEntries(
        ordinaryFieldsWithSchema.map((field) => [field.property, field.schema]),
      ),
      required: ordinaryFieldsWithSchema
        .filter((field) => field.required)
        .map((field) => field.property),
      allOf: allOf.length > 0 ? allOf : undefined,
    })
  }

  const getUiSchema = () => {
    const ordinaryFieldsUiSchema = Object.fromEntries(
      ordinaryFieldsWithUiSchema.map((field) => [field.property, field.uiSchema]),
    )
    const conditionalFieldsUiSchema = conditionalFields.reduce(
      (acc, field) => ({ ...acc, ...field.uiSchema }),
      {},
    )

    return removeUndefinedValues({
      ...ordinaryFieldsUiSchema,
      ...conditionalFieldsUiSchema,
      // As the order of the properties is not guaranteed in JSON and is lost when having the fields both in `properties`
      // and `allOf`, we need to provide it manually.
      'ui:order': fieldProperties,
      'ui:options': uiOptions,
    })
  }

  return {
    property,
    schema: getSchema(),
    uiSchema: getUiSchema(),
    required: Boolean(options.required),
    fieldProperties,
  }
}

export const arrayField = (
  property: string,
  options: BaseOptions & { minItems?: number; maxItems?: number },
  uiOptions: ArrayFieldUiOptions,
  fields: (FieldType | null)[],
): Field => {
  const { schema: objectSchema, uiSchema: objectUiSchema } = object(null, {}, {}, fields)

  return {
    property,
    schema: removeUndefinedValues({
      title: options.title,
      type: 'array',
      items: objectSchema,
      minItems: options.minItems ?? (options.required ? 1 : undefined),
      maxItems: options.maxItems,
    }),
    uiSchema: removeUndefinedValues({
      'ui:options': uiOptions,
      items: objectUiSchema,
    }),
    required: Boolean(options.required),
  }
}

export const step = (
  property: string,
  options: {
    title: string
    description?: string
    stepperTitle?: string
    customHash?: string
  },
  fields: (FieldType | null)[],
) => {
  const { schema, uiSchema } = object(property, { required: true }, {}, fields)
  const getHash = () => {
    if (options.customHash) {
      return options.customHash
    }
    if (options.stepperTitle) {
      return kebabCase(options.stepperTitle)
    }
    return kebabCase(options.title)
  }

  return {
    property,
    schema: removeUndefinedValues({
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
    uiSchema: removeUndefinedValues({
      ...uiSchema,
      'ui:options': {
        ...uiSchema['ui:options'],
        stepperTitle: options.stepperTitle,
        stepQueryParam: getHash(),
      } satisfies StepUiOptions,
    }),
  }
}

export const conditionalStep = (
  property: string,
  condition: RJSFSchema,
  options: {
    title: string
    customHash?: string
  },
  fields: (FieldType | null)[],
) => {
  const { schema, uiSchema } = step(property, options, fields)
  return {
    property,
    schema: removeUndefinedValues({ if: condition, then: schema }),
    uiSchema: uiSchema,
    required: true,
  }
}

export const conditionalFields = (
  condition: RJSFSchema,
  thenFields: (FieldType | null)[],
  elseFields: (FieldType | null)[] = [],
): ConditionalFields => {
  const filteredThenFields = thenFields.filter((field) => field !== null) as FieldType[]
  const filteredElseFields = elseFields.filter((field) => field !== null) as FieldType[]

  const {
    schema: thenSchema,
    uiSchema: thenUiSchema,
    fieldProperties: thenFieldProperties,
  } = object(null, {}, {}, filteredThenFields)
  const {
    schema: elseSchema,
    uiSchema: elseUiSchema,
    fieldProperties: elseFieldProperties,
  } = object(null, {}, {}, filteredElseFields)

  const intersectionProperties = intersection(thenFieldProperties, elseFieldProperties)
  if (intersectionProperties.length > 0) {
    throw new Error(
      `Field properties must be unique, but there are duplicates between then and else fields: ${intersectionProperties.join(
        ', ',
      )}`,
    )
  }

  return {
    condition,
    thenSchema,
    elseSchema: filteredElseFields.length > 0 ? elseSchema : undefined,
    uiSchema: removeUndefinedValues({
      ...thenUiSchema,
      ...(elseFields.length > 0 ? elseUiSchema : {}),
    }),
    fieldProperties: [...thenFieldProperties, ...elseFieldProperties],
  }
}

export const schema = (
  options: {
    title: string
    description?: string
  },
  uiOptions: SchemaUiOptions,
  steps: (ReturnType<typeof step | typeof conditionalStep> | null)[],
): Schemas => {
  const filteredSteps = steps.filter((stepInner) => stepInner != null) as ReturnType<
    typeof step | typeof conditionalStep
  >[]

  return {
    schema: removeUndefinedValues({
      ...options,
      allOf: filteredSteps.map((stepInner) => stepInner.schema),
    }) as RJSFSchema,
    uiSchema: removeUndefinedValues({
      ...Object.fromEntries(
        filteredSteps.map((stepInner) => [stepInner.property, stepInner.uiSchema]),
      ),
      'ui:options': uiOptions,
      'ui:hideError': true,
    }) as UiSchema,
  }
}

// TODO: Document
export const skipUiSchema = <F extends Field | ObjectField>(field: F): F => {
  return { ...field, skipUiSchema: true }
}

// TODO: Document
export const skipSchema = <F extends Field | ObjectField>(field: F): F => {
  return { ...field, skipSchema: true }
}

/**
 * If text contains markdown, it is still string, to distinguish it from normal text, we need to prefix it in order to
 * detect that it is markdown when used in component.
 */
export const markdownText = (text: string) => `${markdownTextPrefix}${text}`

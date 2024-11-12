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
    options: {
      value: string
      title: string
      description?: string
      isDefault?: boolean
    }[]
  },
  uiOptions: Omit<SelectUiOptions, 'selectOptions'>,
): Field => {
  return {
    property,
    schema: removeUndefinedValues({
      type: 'string',
      title: options.title,
      // This had to be changed from oneOf to enum because of this bug:
      // https://jsonforms.discourse.group/t/function-nested-too-deeply-error-when-enum-has-many-options/1451
      // For many options (250) it worked OK in Chrome, but in Firefox it was throwing an error:
      // Form validation failed
      // Array [ 0: Object { stack: "function nested too deeply", message: "Neznáma chyba" } ]
      enum: options.options.map(({ value }) => value),
      default: options.options.find(({ isDefault }) => isDefault)?.value,
    }),
    uiSchema: removeUndefinedValues({
      'ui:widget': BaWidgetType.Select,
      'ui:options': {
        ...uiOptions,
        selectOptions: Object.fromEntries(
          options.options.map(
            ({ value, title, description }) => [value, { title, description }] as const,
          ),
        ),
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
    options: {
      value: string
      title: string
      description?: string
      isDefault?: boolean
    }[]
  },
  uiOptions: Omit<SelectUiOptions, 'selectOptions'>,
): Field => {
  return {
    property,
    schema: removeUndefinedValues({
      type: 'array',
      title: options.title,
      items: {
        type: 'string',
        // This had to be changed from oneOf to enum because of this bug:
        // https://jsonforms.discourse.group/t/function-nested-too-deeply-error-when-enum-has-many-options/1451
        // For many options (250) it worked OK in Chrome, but in Firefox it was throwing an error:
        // Form validation failed
        // Array [ 0: Object { stack: "function nested too deeply", message: "Neznáma chyba" } ]
        enum: options.options.map(({ value }) => value),
        uiOptions: {
          ...uiOptions,
          selectOptions: Object.fromEntries(
            options.options.map(
              ({ value, title, description }) => [value, { title, description }] as const,
            ),
          ),
        },
      },
      minItems: options.minItems ?? (options.required ? 1 : undefined),
      maxItems: options.maxItems,
      uniqueItems: true,
      default: options.options.filter(({ isDefault }) => isDefault).map(({ value }) => value),
    }),
    uiSchema: removeUndefinedValues({
      'ui:widget': BaWidgetType.SelectMultiple,
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
      uiOptions: removeUndefinedValues({
        'ui:options': { ...uiOptions, inputType },
      }),
    }),
    uiSchema: { 'ui:widget': BaWidgetType.Input },
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
      uiOptions: removeUndefinedValues({
        'ui:options': { ...uiOptions },
      }),
    }),
    uiSchema: {
      'ui:widget': BaWidgetType.Number,
    },
    required: Boolean(options.required),
  }
}

type StringToType<T> = T extends 'string'
  ? string
  : T extends 'number'
    ? number
    : T extends 'boolean'
      ? boolean
      : never

export const radioGroup = <T extends 'string' | 'number' | 'boolean'>(
  property: string,
  options: BaseOptions & {
    type: T
    options: {
      value: StringToType<T>
      title: string
      description?: string
      isDefault?: boolean
    }[]
  },
  uiOptions: Omit<RadioGroupUiOptions, 'radioOptions'>,
): Field => {
  return {
    property,
    schema: removeUndefinedValues({
      type: options.type,
      title: options.title,
      default: options.options.find(({ isDefault }) => isDefault)?.value,
      oneOf: options.options.map(({ value, title }) => ({ const: value, title })),
      uiOptions: removeUndefinedValues({
        ...uiOptions,
        radioOptions: options.options
          // These are only used as a lookup for the description, so we need only those that have it
          .filter(({ description }) => description)
          .map(({ value, description }) => ({ value, description })),
      }),
    }),
    uiSchema: {
      'ui:widget': BaWidgetType.RadioGroup,
    },
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
    schema: removeUndefinedValues({
      type: 'string',
      title: options.title,
      uiOptions: removeUndefinedValues({ ...uiOptions }),
    }),
    uiSchema: {
      'ui:widget': BaWidgetType.TextArea,
    },
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
      const: typeof options.constValue === 'boolean' ? options.constValue : undefined,
      uiOptions: removeUndefinedValues({ ...uiOptions }),
    }),
    uiSchema: {
      'ui:widget': BaWidgetType.Checkbox,
    },
    required: Boolean(options.required),
  }
}

export const checkboxGroup = (
  property: string,
  options: BaseOptions & {
    minItems?: number
    maxItems?: number
    options: {
      value: string
      title: string
      description?: string
      isDefault?: boolean
    }[]
  },
  uiOptions: CheckboxGroupUiOptions,
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
        anyOf: options.options.map(({ value, title }) => ({ const: value, title })),
      },
      default: options.options.filter(({ isDefault }) => isDefault).map(({ value }) => value),
      uiOptions: removeUndefinedValues({ ...uiOptions }),
    }),
    uiSchema: {
      'ui:widget': BaWidgetType.CheckboxGroup,
    },
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
            uiOptions: removeUndefinedValues({ ...uiOptions }),
          }
        : {
            title: options.title,
            type: 'string',
            format: 'ba-file-uuid',
            file: true,
            uiOptions: removeUndefinedValues({ ...uiOptions }),
          },
    ),
    uiSchema: {
      'ui:widget': options.multiple ? BaWidgetType.FileUploadMultiple : BaWidgetType.FileUpload,
    },
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
      uiOptions: removeUndefinedValues({ ...uiOptions }),
    }),
    uiSchema: {
      'ui:widget': BaWidgetType.DatePicker,
    },
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
      uiOptions: removeUndefinedValues({ ...uiOptions }),
    }),
    uiSchema: {
      'ui:widget': BaWidgetType.TimePicker,
    },
    required: Boolean(options.required),
  }
}

let customComponentCounter = 0

/**
 * This is a special field that represents no data in the schema. It is a "hacky way", but the easiest how to display
 * custom components in the UI anywhere we need.
 */
export const customComponentsField = (
  customComponents: CustomComponentType | CustomComponentType[],
  uiOptions: Omit<CustomComponentFieldUiOptions, 'customComponents'>,
): Field => {
  customComponentCounter += 1
  return {
    // Random property name to avoid collisions
    property: `customComponent${customComponentCounter}_gRbYIKNcAF`,
    // @ts-ignore
    schema: removeUndefinedValues({
      anyOf: [{}],
      uiOptions: removeUndefinedValues({
        ...uiOptions,
        customComponents: Array.isArray(customComponents) ? customComponents : [customComponents],
      }),
    }),
    uiSchema: {
      'ui:widget': BaWidgetType.CustomComponents,
    },
    required: false,
  }
}

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
      then: { ...field.thenSchema, uiOptions: undefined },
      else: { ...field.elseSchema, uiOptions: undefined },
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
      uiOptions: removeUndefinedValues({
        ...uiOptions,
        order: fieldProperties,
      }),
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
      uiOptions: removeUndefinedValues(uiOptions),
    }),
    uiSchema: {
      items: objectUiSchema,
    },
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

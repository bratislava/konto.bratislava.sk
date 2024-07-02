import type { RJSFSchema, UiSchema } from '@rjsf/utils'
import intersection from 'lodash/intersection'
import kebabCase from 'lodash/kebabCase'
import uniq from 'lodash/uniq'

import { removeUndefinedValues } from './helpers'
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
  ObjectFieldUiOptions,
  RadioGroupUiOptions,
  SchemaUiOptions,
  SelectUiOptions,
  StepUiOptions,
  TextAreaUiOptions,
  TimePickerUiOptions,
} from './uiOptionsTypes'

export type Schemas = {
  schema: RJSFSchema
  uiSchema: UiSchema
}

export type Field = {
  property: string
  schema: () => RJSFSchema
  uiSchema: () => UiSchema
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
  thenSchema: () => RJSFSchema
  elseSchema?: () => RJSFSchema
  uiSchema: () => UiSchema
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
    schema: () => ({
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
    uiSchema: () => {
      const selectOptionsArray = options.options.map(
        ({ value, title, description }) => [value, { title, description }] as const,
      )

      return {
        'ui:widget': BaWidgetType.Select,
        'ui:options': {
          ...uiOptions,
          selectOptions: Object.fromEntries(selectOptionsArray),
        },
      }
    },
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
    schema: () => ({
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
      },
      minItems: options.minItems ?? options.required ? 1 : undefined,
      maxItems: options.maxItems,
      uniqueItems: true,
      default: options.options.filter(({ isDefault }) => isDefault).map(({ value }) => value),
    }),

    uiSchema: () => {
      const selectOptionsArray = options.options.map(
        ({ value, title, description }) => [value, { title, description }] as const,
      )

      return {
        'ui:widget': BaWidgetType.Select,
        'ui:options': {
          ...uiOptions,
          selectOptions: Object.fromEntries(selectOptionsArray),
        },
      }
    },
    required: Boolean(options.required),
  }
}

export const input = (
  property: string,
  options: BaseOptions &
    (
      | {
          type?: 'text'
          // TODO: Add more formats
          format?: 'zip' | 'ratio' | 'ico'
          pattern?: RegExp
        }
      | {
          type: 'password' | 'email' | 'tel'
        }
    ) & { default?: string },
  uiOptions: Omit<InputUiOptions, 'type'>,
): Field => {
  return {
    property,
    schema: () => {
      if ('pattern' in options && 'format' in options) {
        // eslint-disable-next-line no-console
        console.error(
          `Input: ${property} has both pattern and format, only one of them can be provided`,
        )
      }

      const getFormat = () => {
        if (options.type == null || options.type === 'text') {
          return options.format
        }
        if (options.type === 'email') {
          return 'email'
        }
        if (options.type === 'tel') {
          return 'phone-number'
        }

        // eslint-disable-next-line unicorn/no-useless-undefined
        return undefined
      }

      const getPattern = () => {
        if (options.type == null || options.type === 'text') {
          return options.pattern?.source
        }

        // eslint-disable-next-line unicorn/no-useless-undefined
        return undefined
      }

      return {
        type: 'string',
        title: options.title,
        format: getFormat(),
        pattern: getPattern(),
        default: options.default,
      }
    },
    uiSchema: () => ({
      'ui:widget': BaWidgetType.Input,
      'ui:label': false,
      'ui:options': { ...uiOptions, type: options.type ?? 'text' },
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
  uiOptions: Omit<InputUiOptions, 'type'>,
): Field => {
  return {
    property,
    schema: () => ({
      type: options.type ?? 'number',
      title: options.title,
      default: options.default,
      minimum: options.minimum,
      exclusiveMinimum: options.exclusiveMinimum,
      maximum: options.maximum,
      exclusiveMaximum: options.exclusiveMaximum,
    }),
    uiSchema: () => ({
      'ui:widget': BaWidgetType.Input,
      'ui:label': false,
      'ui:options': { ...uiOptions, type: 'number' },
    }),
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
    schema: () => ({
      type: options.type,
      title: options.title,
      default: options.options.find(({ isDefault }) => isDefault)?.value,
      oneOf: options.options.map(({ value, title }) => ({ const: value, title })),
    }),
    uiSchema: () => ({
      'ui:widget': BaWidgetType.RadioGroup,
      'ui:options': {
        ...uiOptions,
        radioOptions: options.options
          // These are only used as a lookup for the description, so we need only those that have it
          .filter(({ description }) => description)
          .map(({ value, description }) => ({ value, description })),
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
    schema: () => ({ type: 'string', title: options.title }),
    uiSchema: () => ({
      'ui:widget': BaWidgetType.TextArea,
      'ui:label': false,
      'ui:options': uiOptions,
    }),
    required: Boolean(options.required),
  }
}

export const checkbox = (
  property: string,
  options: BaseOptions & { default?: boolean },
  uiOptions: CheckboxUiOptions,
): Field => {
  return {
    property,
    schema: () => ({
      type: 'boolean',
      title: options.title,
      default: options.default,
    }),
    uiSchema: () => ({
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
    schema: () => ({
      type: 'array',
      title: options.title,
      minItems: options.minItems ?? options.required ? 1 : undefined,
      maxItems: options.maxItems,
      uniqueItems: true,
      items: {
        anyOf: options.options.map(({ value, title }) => ({ const: value, title })),
      },
      default: options.options.filter(({ isDefault }) => isDefault).map(({ value }) => value),
    }),
    uiSchema: () => ({
      'ui:widget': BaWidgetType.CheckboxGroup,
      'ui:options': uiOptions,
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
    schema: () => {
      const base = {
        title: options.title,
      }
      if (options.multiple) {
        return {
          ...base,
          type: 'array',
          items: {
            type: 'string',
            file: true,
          },
          minItems: options.required ? 1 : undefined,
          default: [],
        }
      }

      return {
        ...base,
        type: 'string',
        file: true,
      }
    },
    uiSchema: () => ({ 'ui:widget': BaWidgetType.FileUpload, 'ui:options': uiOptions }),
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
    schema: () => ({
      type: 'string',
      format: 'date',
      title: options.title,
      default: options.default,
    }),
    uiSchema: () => ({
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
    schema: () => ({
      type: 'string',
      format: 'localTime',
      title: options.title,
      default: options.default,
    }),
    uiSchema: () => ({
      'ui:widget': BaWidgetType.TimePicker,
      'ui:options': uiOptions,
    }),
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
    schema: () => ({
      anyOf: [{}],
    }),
    uiSchema: () => {
      const array = Array.isArray(customComponents) ? customComponents : [customComponents]
      return {
        'ui:widget': BaWidgetType.CustomComponents,
        'ui:options': { ...uiOptions, customComponents: array },
      }
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
  fields: FieldType[],
): ObjectField => {
  const ordinaryFields = fields.filter((field) => !('condition' in field)) as Field[]
  const ordinaryFieldsWithSchema = ordinaryFields.filter((field) => !field.skipSchema)
  const ordinaryFieldsWithUiSchema = ordinaryFields.filter((field) => !field.skipUiSchema)
  const conditionalFields = fields.filter((field) => 'condition' in field) as ConditionalFields[]
  const fieldProperties = uniq(
    fields
      .filter((field) => ('skipUiSchema' in field ? !field.skipUiSchema : true))
      .flatMap((field) => ('condition' in field ? field.fieldProperties : [field.property]))
      .filter((field) => field !== null) as string[],
  )

  return {
    property,
    schema: () => {
      const allOf = conditionalFields.map((field) => ({
        if: field.condition,
        then: field.thenSchema(),
        else: field.elseSchema?.(),
      }))

      return {
        type: 'object',
        properties: Object.fromEntries(
          ordinaryFieldsWithSchema.map((field) => [field.property, field.schema()]),
        ),
        required: ordinaryFieldsWithSchema
          .filter((field) => field.required)
          .map((field) => field.property),
        allOf: allOf.length > 0 ? allOf : undefined,
      }
    },
    uiSchema: () => {
      const ordinaryFieldsUiSchema = Object.fromEntries(
        ordinaryFieldsWithUiSchema.map((field) => [field.property, field.uiSchema()]),
      )
      const conditionalFieldsUiSchema = conditionalFields.reduce(
        (acc, field) => ({ ...acc, ...field.uiSchema() }),
        {},
      )

      return {
        ...ordinaryFieldsUiSchema,
        ...conditionalFieldsUiSchema,
        // As the order of the properties is not guaranteed in JSON and is lost when having the fields both in `properties`
        // and `allOf`, we need to provide it manually.
        'ui:order': fieldProperties,
        'ui:options': uiOptions,
      }
    },
    required: Boolean(options.required),
    fieldProperties,
  }
}

export const arrayField = (
  property: string,
  options: BaseOptions & { minItems?: number; maxItems?: number },
  uiOptions: ArrayFieldUiOptions,
  fields: FieldType[],
): Field => {
  const { schema: objectSchema, uiSchema: objectUiSchema } = object(null, {}, {}, fields)
  return {
    property,
    schema: () => ({
      title: options.title,
      type: 'array',
      items: objectSchema(),
      minItems: options.minItems ?? options.required ? 1 : undefined,
      maxItems: options.maxItems,
    }),
    uiSchema: () => ({
      'ui:options': uiOptions,
      items: objectUiSchema(),
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
  fields: FieldType[],
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
    schema: () => ({
      type: 'object',
      properties: {
        [property]: {
          title: options.title,
          description: options.description,
          ...schema(),
        },
      },
      required: [property],
    }),
    uiSchema: () => ({
      ...uiSchema(),
      'ui:options': {
        ...uiSchema()['ui:options'],
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
  fields: FieldType[],
) => {
  const { schema, uiSchema } = step(property, options, fields)
  return {
    property,
    schema: () => ({ if: condition, then: schema() }),
    uiSchema: () => uiSchema(),
    required: true,
  }
}

export const conditionalFields = (
  condition: RJSFSchema,
  thenFields: FieldType[],
  elseFields: FieldType[] = [],
): ConditionalFields => {
  const {
    schema: thenSchema,
    uiSchema: thenUiSchema,
    fieldProperties: thenFieldProperties,
  } = object(null, {}, {}, thenFields)
  const {
    schema: elseSchema,
    uiSchema: elseUiSchema,
    fieldProperties: elseFieldProperties,
  } = object(null, {}, {}, elseFields)

  return {
    condition,
    thenSchema,
    elseSchema: elseFields.length > 0 ? elseSchema : undefined,
    uiSchema: () => {
      const intersectionProperties = intersection(thenFieldProperties, elseFieldProperties)
      if (intersectionProperties.length > 0) {
        // eslint-disable-next-line no-console
        console.warn(
          `Conditional fields: ${intersectionProperties.join(
            ', ',
          )} is in both then and else uiSchema, it will be overwritten by the else uiSchema`,
        )
      }

      return { ...thenUiSchema(), ...(elseFields.length > 0 ? elseUiSchema() : {}) }
    },
    fieldProperties: [...thenFieldProperties, ...elseFieldProperties],
  }
}

export const schema = (
  options: {
    title: string
    description?: string
  },
  uiOptions: SchemaUiOptions,
  steps: ReturnType<typeof step | typeof conditionalStep>[],
): Schemas => {
  return removeUndefinedValues({
    schema: { ...options, allOf: steps.map((stepInner) => stepInner.schema()) } as RJSFSchema,
    uiSchema: {
      ...Object.fromEntries(steps.map((stepInner) => [stepInner.property, stepInner.uiSchema()])),
      'ui:options': uiOptions,
      'ui:hideError': true,
    } as UiSchema,
  })
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

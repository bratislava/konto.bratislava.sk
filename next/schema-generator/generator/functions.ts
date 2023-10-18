/* eslint-disable import/no-extraneous-dependencies */
import type { Experimental_ArrayMinItems, RJSFSchema, UiSchema } from '@rjsf/utils'
import intersection from 'lodash/intersection'
import kebabCase from 'lodash/kebabCase'
import uniq from 'lodash/uniq'

import {
  ArrayFieldUiOptions,
  CheckboxesUiOptions,
  CustomComponentFieldUiOptions,
  CustomComponentType,
  DatePickerUiOptions,
  InputFieldUiOptions,
  ObjectFieldUiOptions,
  RadioButtonUiOptions,
  SchemaUiOptions,
  SelectFieldUiOptions,
  TextAreaUiOptions,
  TimePickerUiOptions,
  UploadUiOptions,
} from './uiOptionsTypes'

type Field = {
  property: string
  schema: () => RJSFSchema
  uiSchema: () => UiSchema
  required: boolean
}

type ObjectField = Omit<Field, 'property'> & { property: string | null; fieldProperties: string[] }

type ConditionalFields = {
  condition: RJSFSchema
  thenSchema: () => RJSFSchema
  elseSchema?: () => RJSFSchema
  uiSchema: () => UiSchema
  fieldProperties: string[]
}

type FieldType = Field | ConditionalFields | ObjectField

type BaseOptions = {
  title: string
  required?: boolean
}

export const selectField = (
  property: string,
  options: BaseOptions & {
    options: {
      value: string
      title: string
      tooltip?: string
      isDefault?: boolean
    }[]
  },
  uiOptions: SelectFieldUiOptions,
): Field => {
  return {
    property,
    schema: () => ({
      type: 'string',
      title: options.title,
      oneOf: options.options.map(({ value, title }) => ({ const: value, title })),
      default: options.options.find(({ isDefault }) => isDefault)?.value,
    }),
    uiSchema: () => ({
      'ui:widget': 'SelectField',
      'ui:options': uiOptions,
    }),
    required: Boolean(options.required),
  }
}

export const selectMultipleField = (
  property: string,
  options: BaseOptions & {
    minItems?: number
    maxItems?: number
    options: {
      value: string
      title: string
      tooltip?: string
      isDefault?: boolean
    }[]
  },
  uiOptions: SelectFieldUiOptions,
): Field => {
  return {
    property,
    schema: () => ({
      type: 'array',
      title: options.title,
      items: {
        type: 'string',
        oneOf: options.options.map(({ value, title }) => ({ const: value, title })),
      },
      minItems: options.minItems ?? options.required ? 1 : undefined,
      maxItems: options.maxItems,
      uniqueItems: true,
      default: options.options.filter(({ isDefault }) => isDefault).map(({ value }) => value),
    }),
    uiSchema: () => ({
      'ui:widget': 'SelectField',
      'ui:options': uiOptions,
    }),
    required: Boolean(options.required),
  }
}

export const inputField = (
  property: string,
  options:
    | BaseOptions &
        (
          | {
              type?: 'text'
              // TODO: Add more formats
              format?: 'zip'
              pattern?: RegExp
            }
          | {
              type: 'password' | 'email' | 'tel'
            }
        ) & { default?: string },
  uiOptions: Omit<InputFieldUiOptions, 'type'>,
): Field => {
  return {
    property,
    schema: () => {
      if ('pattern' in options && 'format' in options) {
        // eslint-disable-next-line no-console
        console.error(
          `InputField: ${property} has both pattern and format, only one of them can be provided`,
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
      'ui:widget': 'InputField',
      'ui:label': false,
      'ui:options': { ...uiOptions, type: options.type ?? 'text' },
    }),
    required: Boolean(options.required),
  }
}

export const numberField = (
  property: string,
  options: BaseOptions & {
    type?: 'number' | 'integer'
    default?: number
    minimum?: number
    exclusiveMinimum?: number
    maximum?: number
    exclusiveMaximum?: number
  },
  uiOptions: Omit<InputFieldUiOptions, 'type'>,
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
      'ui:widget': 'InputField',
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

export const radioButton = <T extends 'string' | 'number' | 'boolean'>(
  property: string,
  options: BaseOptions & {
    type: T
    options: {
      value: StringToType<T>
      title: string
      tooltip?: string
      isDefault?: boolean
    }[]
  },
  uiOptions: Omit<RadioButtonUiOptions, 'radioOptions'>,
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
      'ui:widget': 'RadioButton',
      'ui:options': {
        ...uiOptions,
        radioOptions: options.options
          .filter(({ tooltip }) => tooltip)
          .map(({ value, tooltip }) => ({ value, tooltip })),
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
      'ui:widget': 'TextArea',
      'ui:label': false,
      'ui:options': uiOptions,
    }),
    required: Boolean(options.required),
  }
}

export const checkboxes = (
  property: string,
  options: BaseOptions & {
    minItems?: number
    maxItems?: number
    options: {
      value: string
      title: string
      tooltip?: string
      isDefault?: boolean
    }[]
  },
  uiOptions: Omit<CheckboxesUiOptions, 'checkboxOptions'>,
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
      'ui:widget': 'Checkboxes',
      'ui:options': {
        ...uiOptions,
        checkboxOptions: options.options
          .filter(({ tooltip }) => tooltip)
          .map(({ value, tooltip }) => ({ value, tooltip })),
      },
    }),
    required: Boolean(options.required),
  }
}

export const upload = (
  property: string,
  options: BaseOptions & { multiple?: boolean },
  uiOptions: UploadUiOptions,
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
    uiSchema: () => ({ 'ui:widget': 'Upload', 'ui:options': uiOptions }),
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
      'ui:widget': 'DatePicker',
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
      'ui:widget': 'TimePicker',
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
        'ui:widget': 'CustomComponents',
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
  const conditionalFields = fields.filter((field) => 'condition' in field) as ConditionalFields[]
  const fieldProperties = uniq(
    fields
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
          ordinaryFields.map((field) => [field.property, field.schema()]),
        ),
        required: ordinaryFields.filter((field) => field.required).map((field) => field.property),
        allOf: allOf.length > 0 ? allOf : undefined,
      }
    },
    uiSchema: () => {
      const ordinaryFieldsUiSchema = Object.fromEntries(
        ordinaryFields.map((field) => [field.property, field.uiSchema()]),
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
  options: BaseOptions & { default?: string },
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
      minItems: options.required ? 1 : undefined,
      overrideArrayMinItemsBehaviour: {
        populate: 'requiredOnly',
      } satisfies Experimental_ArrayMinItems,
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
    customHash?: string
  },
  fields: FieldType[],
) => {
  const { schema, uiSchema } = object(property, { required: true }, {}, fields)
  const hash = options.customHash ?? kebabCase(options.title)

  return {
    property,
    schema: () => ({
      type: 'object',
      properties: {
        [property]: {
          title: options.title,
          hash,
          ...schema(),
        },
      },
      required: [property],
    }),
    uiSchema,
  }
}

export const conditionalStep = (
  property: string,
  condition: RJSFSchema,
  options: {
    title: string
    customHash?: string
  },
  fields: Field[],
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
    pospID: string
    pospVersion: string
    title: string
    description?: string
  },
  uiOptions: SchemaUiOptions,
  steps: ReturnType<typeof step | typeof conditionalStep>[],
) => {
  return {
    schema: { ...options, allOf: steps.map((stepInner) => stepInner.schema()) },
    uiSchema: {
      ...Object.fromEntries(steps.map((stepInner) => [stepInner.property, stepInner.uiSchema()])),
      'ui:options': uiOptions,
      'ui:hideError': true,
    },
  }
}

import { GenericObjectType } from '@rjsf/utils'
import dashify from 'dashify'
import removeAccents from 'remove-accents'

import {
  CheckboxesUiOptions,
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
  schema: () => GenericObjectType
  uiSchema: () => GenericObjectType
  required: boolean
}

type Object = Field & { fieldProperties: string[] }

type ConditionalFields = {
  condition: GenericObjectType
  then: GenericObjectType
  else?: GenericObjectType
  uiSchema: GenericObjectType
  fieldProperties: string[]
}

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
    schema: () => {
      return {
        type: 'string',
        oneOf: options.options.map(({ value, title }) => ({ const: value, title })),
        default: options.options.find(({ isDefault }) => isDefault)?.value,
      }
    },
    uiSchema: () => {
      return {
        'ui:widget': 'SelectField',
        'ui:options': uiOptions,
      }
    },
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
    schema: () => {
      return {
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
      }
    },
    uiSchema: () => {
      return {
        'ui:widget': 'SelectField',
        'ui:options': uiOptions,
      }
    },
    required: Boolean(options.required),
  }
}

export const inputField = (
  property: string,
  options: BaseOptions & { default?: string },
  uiOptions: InputFieldUiOptions,
): Field => {
  return {
    property,
    schema: () => {
      return { type: 'string', title: options.title, default: options.default }
    },
    uiSchema: () => {
      return {
        'ui:widget': 'InputField',
        'ui:label': false,
        'ui:options': uiOptions,
      }
    },
    required: Boolean(options.required),
  }
}

export const radioButton = (
  property: string,
  options: BaseOptions & {
    options: {
      value: string
      title: string
      tooltip?: string
      isDefault?: boolean
    }[]
  },
  uiOptions: RadioButtonUiOptions,
): Field => {
  return {
    property,
    schema: () => {
      return {
        type: 'string',
        title: options.title,
        default: options.options.find(({ isDefault }) => isDefault)?.value,
        oneOf: options.options.map(({ value, title }) => ({ const: value, title })),
      }
    },
    uiSchema: () => {
      return {
        'ui:widget': 'RadioButton',
        radioOptions: options.options
          .filter(({ tooltip }) => tooltip)
          .map(({ value, tooltip }) => ({ value, tooltip })),
        'ui:options': uiOptions,
      }
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
    schema: () => {
      return { type: 'string' }
    },
    uiSchema: () => {
      return {
        'ui:widget': 'TextArea',
        'ui:label': false,
        'ui:options': uiOptions,
      }
    },
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
  uiOptions: CheckboxesUiOptions,
): Field => {
  return {
    property,
    schema: () => {
      return {
        type: 'array',
        title: options.title,
        minItems: options.minItems ?? options.required ? 1 : undefined,
        maxItems: options.maxItems,
        uniqueItems: true,
        items: {
          anyOf: options.options.map(({ value, title }) => ({ const: value, title })),
        },
        default: options.options.filter(({ isDefault }) => isDefault).map(({ value }) => value),
      }
      return {
        type: 'string',
        title: options.title,
        oneOf: options.options.map(({ value, tooltip }) => ({ const: value, tooltip })),
        default: options.options.find(({ isDefault }) => isDefault)?.value,
      }
    },
    uiSchema: () => {
      return {
        'ui:widget': 'Checkboxes',
        checkboxOptions: options.options
          .filter(({ tooltip }) => tooltip)
          .map(({ value, tooltip }) => ({ value, tooltip })),
        'ui:options': uiOptions,
      }
    },
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
        }
      }

      return {
        ...base,
        type: 'string',
        file: true,
      }
    },
    uiSchema: () => {
      return { 'ui:widget': 'Upload', 'ui:options': uiOptions }
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
    schema: () => {
      return {
        type: 'string',
        format: 'date',
        title: options.title,
        default: options.default,
      }
    },
    uiSchema: () => {
      return {
        'ui:widget': 'DatePicker',
        'ui:options': uiOptions,
      }
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
    schema: () => {
      return {
        type: 'string',
        format: 'localTime',
        title: options.title,
        default: options.default,
      }
    },
    uiSchema: () => {
      return {
        'ui:field': 'dateTime',
        'ui:options': uiOptions,
      }
    },
    required: Boolean(options.required),
  }
}

export const object = (
  property: string,
  options: { required?: boolean },
  uiOptions: ObjectFieldUiOptions,
  fields: (Field | ConditionalFields)[],
): Object => {
  const conditionalFields = fields.filter((field) => 'condition' in field) as ConditionalFields[]
  const normalFields = fields.filter((field) => !('condition' in field)) as Field[]
  const fieldProperties = fields.flatMap((field) =>
    'condition' in field ? field.fieldProperties : [field.property],
  )

  return {
    property,
    schema: () => {
      const allOf = conditionalFields.map((field) => ({
        if: field.condition,
        then: field.then,
        else: field.else,
      }))

      return {
        type: 'object',
        properties: Object.assign(
          {},
          ...normalFields.map((field) => ({ [field.property]: field.schema() })),
        ),
        required: normalFields.filter((field) => field.required).map((field) => field.property),
        allOf: allOf.length > 0 ? allOf : undefined,
      }
    },
    uiSchema: () =>
      Object.assign(
        {},
        ...normalFields.map((field) => ({ [field.property]: field.uiSchema() })),
        ...conditionalFields.map((field) => field.uiSchema),
        { 'ui:order': fieldProperties, 'ui:options': uiOptions },
      ),
    required: Boolean(options.required),
    fieldProperties,
  }
}

// export const array = (
//   property: string,
//   options: { required?: boolean },
//   uiOptions: any,
//   fields: Field[],
// ): Field => {
//   return {
//     property,
//     schema: () => {
//       return {}
//     },
//     uiSchema: () => {
//       return {}
//     },
//     required: Boolean(options.required),
//   }
// }

export const step = (
  property: string,
  options: {
    title: string
    customHash?: string
  },
  fields: (Field | ConditionalFields)[],
) => {
  const { schema, uiSchema } = object(property, { required: true }, {}, fields)
  const hash = options.customHash ?? dashify(removeAccents(options.title))

  return {
    property,
    schema: () => {
      return {
        type: 'object',
        properties: {
          [property]: {
            title: options.title,
            hash,
            ...schema(),
          },
        },
        required: [property],
      }
    },
    uiSchema,
  }
}

export const conditionalStep = (
  property: string,
  condition: GenericObjectType,
  options: {
    title: string
    customHash?: string
  },
  fields: Field[],
) => {
  const { schema, uiSchema } = step(property, options, fields)
  return {
    property,
    schema: () => {
      return { if: condition, then: schema() }
    },
    uiSchema: () => uiSchema(),
    required: true,
  }
}

export const conditionalFields = (
  condition: GenericObjectType,
  thenFields: (Field | ConditionalFields)[],
  elseFields: (Field | ConditionalFields)[] = [],
): ConditionalFields => {
  const {
    schema: thenSchema,
    uiSchema: thenUiSchema,
    fieldProperties: thenFieldProperties,
  } = object('mock', {}, {}, thenFields)
  const {
    schema: elseSchema,
    uiSchema: elseUiSchema,
    fieldProperties: elseFieldProperties,
  } = object('mock', {}, {}, elseFields)

  return {
    condition,
    then: thenSchema(),
    else: elseFields.length > 0 ? elseSchema() : undefined,
    uiSchema: { ...thenUiSchema(), ...(elseFields.length > 0 ? elseUiSchema() : {}) },
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
    uiSchema: Object.assign(
      { 'ui:options': uiOptions, 'ui:hideError': true },
      ...steps.map((stepInner) => ({ [stepInner.property]: stepInner.uiSchema() })),
    ),
  }
}

import { FormProps, getDefaultRegistry, ThemeProps, withTheme } from '@rjsf/core'
import {
  ArrayFieldTemplateItemType,
  ArrayFieldTemplateProps,
  getTemplate,
  getUiOptions,
  ObjectFieldTemplateProps,
  WidgetProps,
} from '@rjsf/utils'
import React, {
  type ComponentType,
  DetailedHTMLProps,
  Fragment,
  HTMLAttributes,
  PropsWithChildren,
} from 'react'

import { getArrayItemTitle } from '../form-utils/getArrayItemTitle'
import { baRjsfValidator } from '../form-utils/validators'
import { ArrayFieldUiOptions, BaWidgetType } from '../generator/uiOptionsTypes'
import { getSummaryDisplayValues } from './getSummaryDisplayValue'

export enum SummaryXmlFormTag {
  Form = 'summary-form',
  Step = 'step',
  Array = 'array',
  ArrayItem = 'array-item',
  Field = 'field',
}

type SummaryXmlFormFormAttributes = {
  id: string
}

type SummaryXmlFormStepAttributes = {
  id: string
  name: string
  title: string
}

type SummaryXmlFormArrayAttributes = {
  id: string
  length: number
  title: string
}

type SummaryXmlFormArrayItemAttributes = {
  id: string
  title: string
}

type SummaryXmlFormFieldAttributes = {
  id: string
  type: BaWidgetType
  label: string
  value: string
  'display-values': string
}

type CustomElement<P = {}> = DetailedHTMLProps<HTMLAttributes<HTMLElement> & P, HTMLElement>

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      [SummaryXmlFormTag.Form]: CustomElement<SummaryXmlFormFormAttributes>
      [SummaryXmlFormTag.Step]: CustomElement<SummaryXmlFormStepAttributes>
      [SummaryXmlFormTag.Array]: CustomElement<SummaryXmlFormArrayAttributes>
      [SummaryXmlFormTag.ArrayItem]: CustomElement<SummaryXmlFormArrayItemAttributes>
      [SummaryXmlFormTag.Field]: CustomElement<SummaryXmlFormFieldAttributes>
    }
  }
}

const wrapWidget = (widgetType: BaWidgetType) =>
  function wrap({ id, label, value, schema, options }: WidgetProps) {
    return (
      <SummaryXmlFormTag.Field
        id={id}
        label={label}
        type={widgetType}
        value={JSON.stringify(value)}
        display-values={JSON.stringify(getSummaryDisplayValues(value, widgetType, schema, options))}
      />
    )
  }

const FieldTemplate = ({ children }: { children: React.ReactNode }) => <>{children}</>

type SummaryArrayFieldTemplateItemType = ArrayFieldTemplateItemType & {
  parentId: string
  parentUiOptions: ArrayFieldUiOptions
}

const ArrayFieldItemTemplate = ({
  children,
  parentId,
  index,
  parentUiOptions,
}: SummaryArrayFieldTemplateItemType) => {
  const id = `${parentId}_${index}`
  const { itemTitle } = parentUiOptions

  return (
    <SummaryXmlFormTag.ArrayItem id={id} title={getArrayItemTitle(itemTitle, index)}>
      {children}
    </SummaryXmlFormTag.ArrayItem>
  )
}

const ArrayFieldTemplate = ({
  title,
  items,
  idSchema,
  registry,
  uiSchema,
}: ArrayFieldTemplateProps) => {
  const options = getUiOptions(uiSchema) as ArrayFieldUiOptions
  const id = idSchema.$id
  const ItemTemplate = getTemplate(
    'ArrayFieldItemTemplate',
    registry,
  ) as ComponentType<SummaryArrayFieldTemplateItemType>

  return (
    <SummaryXmlFormTag.Array id={id} length={items.length} title={title}>
      {items.map(({ key, ...itemProps }) => (
        <ItemTemplate key={key} parentId={id} parentUiOptions={options} {...itemProps} />
      ))}
    </SummaryXmlFormTag.Array>
  )
}

const ObjectFieldTemplate = ({ properties, idSchema, title }: ObjectFieldTemplateProps) => {
  const id = idSchema.$id
  const splitId = id.split('_')
  const isFormObject = splitId.length === 1 && splitId[0] === 'root'
  const isStepObject = splitId.length === 2 && splitId[0] === 'root'

  const content = properties.map((element, index) => (
    <Fragment key={index}>{element.content}</Fragment>
  ))

  if (isFormObject) {
    return <SummaryXmlFormTag.Form id={id}>{content}</SummaryXmlFormTag.Form>
  }

  if (isStepObject) {
    const stepName = splitId[1]
    return (
      <SummaryXmlFormTag.Step id={id} title={title} name={stepName}>
        {content}
      </SummaryXmlFormTag.Step>
    )
  }

  return <>{content}</>
}

const theme: ThemeProps = {
  templates: {
    FieldTemplate,
    ObjectFieldTemplate,
    ArrayFieldTemplate,
    ArrayFieldItemTemplate: ArrayFieldItemTemplate as ComponentType<ArrayFieldTemplateItemType>,
  },
  widgets: {
    [BaWidgetType.Select]: wrapWidget(BaWidgetType.Select),
    [BaWidgetType.Input]: wrapWidget(BaWidgetType.Input),
    [BaWidgetType.RadioGroup]: wrapWidget(BaWidgetType.RadioGroup),
    [BaWidgetType.TextArea]: wrapWidget(BaWidgetType.TextArea),
    [BaWidgetType.Checkbox]: wrapWidget(BaWidgetType.Checkbox),
    [BaWidgetType.CheckboxGroup]: wrapWidget(BaWidgetType.CheckboxGroup),
    [BaWidgetType.FileUpload]: wrapWidget(BaWidgetType.FileUpload),
    [BaWidgetType.DatePicker]: wrapWidget(BaWidgetType.DatePicker),
    [BaWidgetType.TimePicker]: wrapWidget(BaWidgetType.TimePicker),
    [BaWidgetType.CustomComponents]: () => {
      return null
    },
  } satisfies Record<BaWidgetType, ComponentType<WidgetProps>>,
  fields: {
    AnyOfField: (props) => {
      // RJSF renders unnecessary <div>s for MultiSchemaField, which breaks the XML structure.
      // https://github.com/rjsf-team/react-jsonschema-form/blob/ec932db942dd046640303056c89e3501b16ec469/packages/core/src/components/fields/MultiSchemaField.tsx#L217
      const options = getUiOptions(props.uiSchema)
      if (options?.widget === 'CustomComponents') {
        return null
      }

      const defaultRegistry = getDefaultRegistry()
      const DefaultAnyOfField = defaultRegistry.fields.AnyOfField

      return <DefaultAnyOfField {...props} />
    },
  },
}

const ThemedForm = withTheme(theme)

type SummaryXmlFormProps = Pick<FormProps, 'schema' | 'uiSchema' | 'formData'>

/**
 * Generates a summary XML form based on the provided schema, UI schema, and form data.
 *
 * Getting a summary for JSON Schema data is hard and is not supported by RJSF out of the box. This component leverages
 * that RJSF allows to customize the form rendering and generates a custom XML structure that represents the form data.
 * Unfortunately, it is not possible to generate a JSON summary directly, so the XML is later parsed into JSON.
 * The generated XML is tightly coupled with its parsing in `getSummaryJson` function, and it is not used anywhere else.
 */
const SummaryXmlForm = ({ schema, uiSchema, formData }: SummaryXmlFormProps) => {
  return (
    <ThemedForm
      schema={schema}
      uiSchema={uiSchema}
      formData={formData}
      validator={baRjsfValidator}
      // RJSF renders the form in <form> tag by default.
      tagName={({ children }: PropsWithChildren) => <>{children}</>}
    >
      {/* There must be an empty fragment inside the form, otherwise RJSF renders submit button
       * inside the form. */}
      {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
      <></>
    </ThemedForm>
  )
}

export default SummaryXmlForm

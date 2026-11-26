import { type ThemeProps, withTheme } from '@rjsf/core'
import {
  type ArrayFieldItemTemplateProps,
  type ArrayFieldTemplateProps,
  type FieldProps,
  type GenericObjectType,
  getUiOptions,
  type ObjectFieldTemplateProps,
  type RJSFSchema,
  type WidgetProps,
} from '@rjsf/utils'
import {
  type ComponentType,
  createContext,
  Fragment,
  type PropsWithChildren,
  type ReactNode,
  useContext,
} from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { defaultFormFields, DefaultFormFieldType } from '../form-utils/defaultFormFields'
import { getBaFormDefaults } from '../form-utils/formDefaults'
import { getArrayItemTitle } from '../form-utils/getArrayItemTitle'
import { getObjectFieldInfo } from '../form-utils/getObjectFieldInfo'
import { BaRjsfValidatorRegistry } from '../form-utils/validatorRegistry'
import { ArrayFieldUiOptions, BaFieldType, BaWidgetType } from '../generator/uiOptionsTypes'
import { getSummaryDisplayValues } from './getSummaryDisplayValue'
import {
  SummaryJsonArray,
  SummaryJsonArrayItem,
  SummaryJsonElement,
  SummaryJsonField,
  SummaryJsonForm,
  SummaryJsonStep,
  SummaryJsonType,
} from './summaryJsonTypes'

export type GetSummaryJsonParams = {
  schema: RJSFSchema
  formData: GenericObjectType
  validatorRegistry: BaRjsfValidatorRegistry
}

/**
 * Receives the elements rendered inside of an element of the summary JSON.
 */
type SummaryJsonCollector = (element: SummaryJsonElement) => void

/**
 * As our code renders the elements, this might be considered redundant, but the rendering relies on RJSF, which could
 * render the templates in a different structure in the future.
 */
const createCollector =
  (
    elements: SummaryJsonElement[],
    allowedTypes: SummaryJsonType[],
    parentDescription: string,
  ): SummaryJsonCollector =>
  (element) => {
    if (!allowedTypes.includes(element.type)) {
      throw new Error(`${element.type} "${element.id}" cannot be in ${parentDescription}`)
    }

    elements.push(element)
  }

const SummaryJsonCollectorContext = createContext<SummaryJsonCollector | null>(null)

const CollectorProvider = ({
  elements,
  allowedTypes,
  parentDescription,
  children,
}: {
  elements: SummaryJsonElement[]
  allowedTypes: SummaryJsonType[]
  parentDescription: string
  children: ReactNode
}) => (
  <SummaryJsonCollectorContext.Provider
    value={createCollector(elements, allowedTypes, parentDescription)}
  >
    {children}
  </SummaryJsonCollectorContext.Provider>
)

const useCollector = () => {
  const collector = useContext(SummaryJsonCollectorContext)
  if (!collector) {
    throw new Error('The summary JSON elements must be rendered by `getSummaryJson`')
  }

  return collector
}

/**
 * The summary JSON is stored and sent as JSON, values keep only their JSON representation (e.g. without `undefined`
 * properties).
 */
const toJson = <Value,>(value: Value): Value => JSON.parse(JSON.stringify(value)) as Value

const wrapWidget = (widgetType: BaWidgetType) =>
  function SummaryJsonWidget({ id, label, value, schema, options }: WidgetProps) {
    const collect = useCollector()
    const field: SummaryJsonField = {
      type: SummaryJsonType.Field,
      id,
      label,
      ...(value === undefined ? {} : { value: toJson(value) }),
      displayValues: toJson(getSummaryDisplayValues(value, widgetType, schema, options)),
    }
    collect(field)

    return null
  }

const FieldTemplate = ({ children }: PropsWithChildren) => <>{children}</>

const ArrayFieldItemTemplate = ({
  children,
  buttonsProps,
  index,
  parentUiSchema,
}: ArrayFieldItemTemplateProps) => {
  const collect = useCollector()
  const { itemTitle } = getUiOptions(parentUiSchema) as ArrayFieldUiOptions
  const arrayItem: SummaryJsonArrayItem = {
    type: SummaryJsonType.ArrayItem,
    id: buttonsProps.fieldPathId.$id,
    title: getArrayItemTitle(itemTitle, index),
    children: [],
  }
  collect(arrayItem)

  return (
    <CollectorProvider
      elements={arrayItem.children}
      allowedTypes={[SummaryJsonType.Field, SummaryJsonType.Array]}
      parentDescription={`array item "${arrayItem.id}"`}
    >
      {children}
    </CollectorProvider>
  )
}

const ArrayFieldTemplate = ({ title, items, fieldPathId }: ArrayFieldTemplateProps) => {
  const collect = useCollector()
  const array: SummaryJsonArray = {
    type: SummaryJsonType.Array,
    id: fieldPathId.$id,
    title,
    items: [],
  }
  collect(array)

  return (
    <CollectorProvider
      elements={array.items}
      allowedTypes={[SummaryJsonType.ArrayItem]}
      parentDescription={`array "${array.id}"`}
    >
      {items}
    </CollectorProvider>
  )
}

const ObjectFieldTemplate = ({
  schema,
  properties,
  fieldPathId,
  title,
}: ObjectFieldTemplateProps) => {
  const collect = useCollector()
  const { id, isFormObject, isStepObject } = getObjectFieldInfo(fieldPathId)

  const content = properties.map((element, index) => (
    <Fragment key={index}>{element.content}</Fragment>
  ))

  if (isFormObject) {
    if (!schema.title) {
      throw new Error('The form schema has no title')
    }

    const form: SummaryJsonForm = {
      type: SummaryJsonType.Form,
      id,
      title: schema.title,
      steps: [],
    }
    collect(form)

    return (
      <CollectorProvider
        elements={form.steps}
        allowedTypes={[SummaryJsonType.Step]}
        parentDescription="the form"
      >
        {content}
      </CollectorProvider>
    )
  }

  if (isStepObject) {
    const step: SummaryJsonStep = { type: SummaryJsonType.Step, id, title, children: [] }
    collect(step)

    return (
      <CollectorProvider
        elements={step.children}
        allowedTypes={[SummaryJsonType.Field, SummaryJsonType.Array]}
        parentDescription={`step "${id}"`}
      >
        {content}
      </CollectorProvider>
    )
  }

  // Other objects only group fields, their fields are part of the step or the array item
  return <>{content}</>
}

const theme: ThemeProps = {
  templates: {
    FieldTemplate,
    ObjectFieldTemplate,
    ArrayFieldTemplate,
    ArrayFieldItemTemplate,
  },
  widgets: {
    [BaWidgetType.Select]: wrapWidget(BaWidgetType.Select),
    [BaWidgetType.SelectMultiple]: wrapWidget(BaWidgetType.SelectMultiple),
    [BaWidgetType.Input]: wrapWidget(BaWidgetType.Input),
    [BaWidgetType.Number]: wrapWidget(BaWidgetType.Number),
    [BaWidgetType.RadioGroup]: wrapWidget(BaWidgetType.RadioGroup),
    [BaWidgetType.TextArea]: wrapWidget(BaWidgetType.TextArea),
    [BaWidgetType.Checkbox]: wrapWidget(BaWidgetType.Checkbox),
    [BaWidgetType.CheckboxGroup]: wrapWidget(BaWidgetType.CheckboxGroup),
    [BaWidgetType.FileUpload]: wrapWidget(BaWidgetType.FileUpload),
    [BaWidgetType.FileUploadMultiple]: wrapWidget(BaWidgetType.FileUploadMultiple),
    [BaWidgetType.DatePicker]: wrapWidget(BaWidgetType.DatePicker),
    [BaWidgetType.TimePicker]: wrapWidget(BaWidgetType.TimePicker),
  } satisfies Record<BaWidgetType, ComponentType<WidgetProps>>,
  fields: {
    [BaFieldType.CustomComponents]: () => null,
    ...defaultFormFields,
  } satisfies Record<BaFieldType & DefaultFormFieldType, ComponentType<FieldProps>>,
}

const ThemedForm = withTheme(theme)

/**
 * Returns the summary JSON of the form: its steps with the fields and arrays the form displays for the data.
 *
 * Getting a summary for JSON Schema data is hard and is not supported by RJSF out of the box. RJSF allows to customize
 * the rendering of the form, so the form is rendered with templates and widgets that add the summary JSON elements to
 * the element they are rendered in, instead of displaying anything. This way RJSF decides what the form displays (e.g.
 * which conditional fields apply). Server rendering renders each component once, parents before their children, so the
 * elements are collected in the order of the form.
 */
export const getSummaryJson = ({
  schema,
  formData,
  validatorRegistry,
}: GetSummaryJsonParams): SummaryJsonForm => {
  const elements: SummaryJsonElement[] = []

  const markup = renderToStaticMarkup(
    <CollectorProvider
      elements={elements}
      allowedTypes={[SummaryJsonType.Form]}
      parentDescription="the summary JSON"
    >
      <ThemedForm
        schema={schema}
        formData={formData}
        // RJSF renders the form in <form> tag by default.
        tagName={({ children }: PropsWithChildren) => <>{children}</>}
        {...getBaFormDefaults(schema, validatorRegistry)}
      >
        {/* There must be an empty fragment inside the form, otherwise RJSF renders submit button
         * inside the form. */}
        {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
        <></>
      </ThemedForm>
    </CollectorProvider>,
  )

  // The templates and widgets render nothing. Markup comes from a part of the form the summary JSON doesn't collect (e.g.
  // a field rendered by one of the default RJSF widgets), whose data would be missing from the summary JSON.
  if (markup !== '') {
    throw new Error(`Unexpected markup rendered for the summary JSON: ${markup.slice(0, 200)}`)
  }

  const [form] = elements
  if (elements.length !== 1 || form.type !== SummaryJsonType.Form) {
    throw new Error(`Expected one summary JSON form, got ${elements.length} elements`)
  }

  return form
}

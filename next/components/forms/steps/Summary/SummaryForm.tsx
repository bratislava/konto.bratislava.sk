import { baDefaultFormStateBehavior } from '@forms-shared/form-utils/defaultFormState'
import { baRjsfValidator } from '@forms-shared/form-utils/validators'
import { ThemeProps, withTheme } from '@rjsf/core'
import {
  ArrayFieldTemplateItemType,
  GenericObjectType,
  ObjectFieldTemplateProps,
} from '@rjsf/utils'
import cx from 'classnames'
import { ComponentType, Fragment } from 'react'

import { useFormContext } from '../../useFormContext'
import { useFormState } from '../../useFormState'
import { ArrayFieldItemTemplate, ArrayFieldTemplate } from './SummaryArrayTemplateRJSF'
import SummaryWidgetRJSF, { SummaryWidgetRJSFProps, SummaryWidgetType } from './SummaryWidgetRJSF'

const wrapWidget = (widgetType: SummaryWidgetType) =>
  function wrap(props: Omit<SummaryWidgetRJSFProps, 'widgetType'>) {
    return <SummaryWidgetRJSF {...props} widgetType={widgetType} />
  }

const ObjectFieldTemplate = ({ title, properties, idSchema }: ObjectFieldTemplateProps) => {
  const splitId = idSchema.$id.split('_')
  const isRootObject = splitId.length === 1 && splitId[0] === 'root'
  const isStepObject = splitId.length === 2 && splitId[0] === 'root'

  return (
    <div className={cx({ 'flex flex-col gap-8': isRootObject })}>
      {isStepObject && <h2 className="text-h3-bold mb-4">{title}</h2>}
      {properties.map((element, index) => (
        <Fragment key={index}>{element.content}</Fragment>
      ))}
    </div>
  )
}

const theme: ThemeProps = {
  templates: {
    ObjectFieldTemplate,
    // It contains extra parentUiOptions prop that is not present in the original ArrayFieldItemTemplate, so we need to
    // cast it to the original type
    ArrayFieldItemTemplate: ArrayFieldItemTemplate as ComponentType<ArrayFieldTemplateItemType>,
    ArrayFieldTemplate,
  },
  widgets: {
    Select: wrapWidget('select'),
    Input: wrapWidget('input'),
    RadioGroup: wrapWidget('radioGroup'),
    TextArea: wrapWidget('textArea'),
    Checkbox: wrapWidget('checkbox'),
    CheckboxGroup: wrapWidget('checkboxGroup'),
    FileUpload: wrapWidget('fileUpload'),
    DatePicker: wrapWidget('datePicker'),
    TimePicker: wrapWidget('timePicker'),
    CustomComponents: () => {
      return null
    },
  },
}

/**
 * Parsing the form values and their respective fields is non-trivial. To make this easier and consistent with the rest
 * of the form behaviour we use the RJSF to render the form, but the provided fields and widgets are replaced with
 * custom ones that only display the values and are not able to edit the form values.
 */
const ThemedForm = withTheme<GenericObjectType>(theme)

const SummaryForm = () => {
  const { schema, uiSchema } = useFormContext()
  const { formData } = useFormState()

  return (
    <ThemedForm
      schema={schema}
      uiSchema={uiSchema}
      formData={formData}
      // The validator is not used, but it's required by the form. We use our own validation in `useFormSummary`.
      validator={baRjsfValidator}
      experimental_defaultFormStateBehavior={baDefaultFormStateBehavior}
      readonly
      onSubmit={(e) => {
        console.log('form submit', e.formData)
      }}
      // We display the errors in our on way.
      showErrorList={false}
    >
      <div />
    </ThemedForm>
  )
}

export default SummaryForm

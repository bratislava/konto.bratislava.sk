import { ThemeProps, withTheme } from '@rjsf/core'
import { GenericObjectType, ObjectFieldTemplateProps } from '@rjsf/utils'
import { Fragment } from 'react'

import SummaryFieldRJSF, { SummaryFieldRJSFProps, SummaryFieldType } from './SummaryFieldRJSF'
import SummaryWidgetRJSF, { SummaryWidgetRJSFProps, SummaryWidgetType } from './SummaryWidgetRJSF'

const wrapWidget = (widgetType: SummaryWidgetType) =>
  function wrap(props: Omit<SummaryWidgetRJSFProps, 'widgetType'>) {
    return <SummaryWidgetRJSF {...props} widgetType={widgetType} />
  }

const wrapField = (fieldType: SummaryFieldType) =>
  function wrap(props: Omit<SummaryFieldRJSFProps, 'fieldType'>) {
    return <SummaryFieldRJSF {...props} fieldType={fieldType} />
  }

const ObjectFieldTemplate = ({ title, properties, idSchema }: ObjectFieldTemplateProps) => {
  const splitId = idSchema.$id.split('_')
  const isStepObject = splitId.length === 2 && splitId[0] === 'root'

  return (
    <div>
      {isStepObject && <h2 className="text-h2-medium mb-6 mt-8">{title}</h2>}
      {properties.map((element, index) => (
        <Fragment key={index}>{element.content}</Fragment>
      ))}
    </div>
  )
}

const theme: ThemeProps = {
  templates: {
    ObjectFieldTemplate,
  },
  widgets: {
    SelectField: wrapWidget('select'),
    InputField: wrapWidget('input'),
    RadioButton: wrapWidget('radio'),
    TextArea: wrapWidget('textarea'),
    Checkboxes: wrapWidget('checkboxes'),
    Upload: wrapWidget('upload'),
    DatePicker: wrapWidget('datepicker'),
    TimePicker: wrapWidget('timepicker'),
  },
  fields: {
    dateFromTo: wrapField('dateFromTo'),
    timeFromTo: wrapField('timeFromTo'),
    dateTime: wrapField('dateTime'),
  },
}

const SummaryForm = withTheme<GenericObjectType>(theme)

export default SummaryForm

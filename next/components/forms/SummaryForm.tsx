import { ThemeProps, withTheme } from '@rjsf/core'
import { GenericObjectType, ObjectFieldTemplateProps } from '@rjsf/utils'
import { FC } from 'react'

import DoubledInputSummaryFieldRJSF from './widget-wrappers/DoubledInputSummaryFieldRJSF'
import SummaryWidgetRJSF from './widget-wrappers/SummaryWidgetRJSF'

/**
 * TODO: WORKS IN PROGRESS
 *
 * TEMPORARY IMPLEMENTATION
 */

const wrapWidget = <T,>(Widget: FC<T>, fieldWidgetType: string) =>
  function wrap(props: Omit<T, 'fieldWidgetType'>) {
    return <Widget {...(props as T)} fieldWidgetType={fieldWidgetType} />
  }

const ObjectFieldTemplate = ({ title, properties, idSchema }: ObjectFieldTemplateProps) => {
  const splitId = idSchema.$id.split('_')
  const displayTitle = splitId.length === 2 && splitId[1] === 'root'

  return (
    <div>
      {displayTitle && <h2 className="text-h2-medium mb-6 mt-8">{title}</h2>}
      {properties.map((element, index) => (
        <div className="property-wrapper" key={index}>
          {element.content}
        </div>
      ))}
    </div>
  )
}

const theme: ThemeProps = {
  templates: {
    ObjectFieldTemplate,
  },
  widgets: {
    SelectField: wrapWidget(SummaryWidgetRJSF, 'select'),
    InputField: wrapWidget(SummaryWidgetRJSF, 'input'),
    RadioButton: wrapWidget(SummaryWidgetRJSF, 'radio'),
    TextArea: wrapWidget(SummaryWidgetRJSF, 'textarea'),
    Checkboxes: wrapWidget(SummaryWidgetRJSF, 'checkboxes'),
    Upload: wrapWidget(SummaryWidgetRJSF, 'upload'),
    DatePicker: wrapWidget(SummaryWidgetRJSF, 'datepicker'),
    TimePicker: wrapWidget(SummaryWidgetRJSF, 'timepicker'),
    // TextWidget: wrapWidget(SummaryWidgetRJSF, 'text'),
  },
  fields: {
    doubledInput: DoubledInputSummaryFieldRJSF,
    dateFromTo: wrapWidget(SummaryWidgetRJSF, 'dateFromTo'),
    timeFromTo: wrapWidget(SummaryWidgetRJSF, 'timeFromTo'),
    dateTime: wrapWidget(SummaryWidgetRJSF, 'dateTime'),
  },
}

const SummaryForm = withTheme<GenericObjectType>(theme)

export default SummaryForm

import { ThemeProps, withTheme } from '@rjsf/core'
import { ObjectFieldTemplateProps } from '@rjsf/utils'

import DoubledInputSummaryFieldRJSF from './widget-wrappers/DoubledInputSummaryFieldRJSF'
import SummaryWidgetRJSF from './widget-wrappers/SummaryWidgetRJSF'

const wrapWidget = <T,>(Widget: React.FC<T>, fieldWidgetType: string) =>
  function (props: Omit<T, 'fieldWidgetType'>) {
    return <Widget {...(props as T)} fieldWidgetType={fieldWidgetType} />
  }

const ObjectFieldTemplate = (props: ObjectFieldTemplateProps) => {
  const displayTitle = props.idSchema.$id.split('_').length === 2

  return (
    <div>
      {displayTitle && <h2 className="text-h2-medium mb-6 mt-8">{props.title}</h2>}
      {props.properties.map((element, index) => (
        <div className="property-wrapper" key={index}>
          {element.content}
        </div>
      ))}
    </div>
  )
}

// you can add custom widgets as well as override the default ones
// we'll want to override all the default widgets listed here https://react-jsonschema-form.readthedocs.io/en/latest/advanced-customization/custom-widgets-fields/
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
    // TitleField: wrapWidget(SummaryWidgetRJSF, 'title'),
    // ObjectField: wrapWidget(SummaryWidgetRJSF, 'object'),
  },
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const SummaryForm = withTheme(theme)

export default SummaryForm

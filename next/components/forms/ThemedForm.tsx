import { ThemeProps, withTheme } from '@rjsf/core'
import { GenericObjectType } from '@rjsf/utils'
import DatePickerWidgetRJSF from 'components/forms/widget-wrappers/DatePickerWidgetRJSF'
import InputFieldWidgetRJSF from 'components/forms/widget-wrappers/InputFieldWidgetRJSF'
import TimePickerWidgetRJSF from 'components/forms/widget-wrappers/TimePickerWidgetRJSF'

import BAArrayFieldItemTemplate from './widget-wrappers/BAArrayFieldItemTemplate'
import BAArrayFieldTemplate from './widget-wrappers/BAArrayFieldTemplate'
import BAObjectFieldTemplate from './widget-wrappers/BAObjectFieldTemplate'
import CheckboxWidgetRJSF from './widget-wrappers/CheckboxWidgetRJSF'
import RadioButtonsWidgetRJSF from './widget-wrappers/RadioButtonWidgetRJSF'
import SelectFieldWidgetRJSF from './widget-wrappers/SelectFieldWidgetRJSF'
import TextAreaFieldWidgetRJSF from './widget-wrappers/TextAreaFieldWidgetRJSF'
import UploadWidgetRJSF from './widget-wrappers/UploadWidgetRJSF'

const theme: ThemeProps = {
  widgets: {
    SelectField: SelectFieldWidgetRJSF,
    InputField: InputFieldWidgetRJSF,
    RadioButton: RadioButtonsWidgetRJSF,
    TextArea: TextAreaFieldWidgetRJSF,
    Checkboxes: CheckboxWidgetRJSF,
    Upload: UploadWidgetRJSF,
    DatePicker: DatePickerWidgetRJSF,
    TimePicker: TimePickerWidgetRJSF,
  },
  templates: {
    ObjectFieldTemplate: BAObjectFieldTemplate,
    ArrayFieldTemplate: BAArrayFieldTemplate,
    ArrayFieldItemTemplate: BAArrayFieldItemTemplate,
  },
}

const ThemedForm = withTheme<GenericObjectType>(theme)

export default ThemedForm

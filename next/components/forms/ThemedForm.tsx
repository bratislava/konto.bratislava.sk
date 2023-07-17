import { ThemeProps, withTheme } from '@rjsf/core'
import DatePickerWidgetRJSF from 'components/forms/widget-wrappers/DatePickerWidgetRJSF'
import InputFieldWidgetRJSF from 'components/forms/widget-wrappers/InputFieldWidgetRJSF'
import TimePickerWidgetRJSF from 'components/forms/widget-wrappers/TimePickerWidgetRJSF'

import CheckboxWidgetRJSF from './widget-wrappers/CheckboxWidgetRJSF'
import DateFromToFieldRJSF from './widget-wrappers/fieldGroupsRJSF/DateFromToFieldRJSF'
import DateTimeFieldRJSF from './widget-wrappers/fieldGroupsRJSF/DateTimeFieldRJSF'
import DoubledInputFieldRJSF from './widget-wrappers/fieldGroupsRJSF/DoubledInputFieldRJSF'
import TimeFromToFieldRJSF from './widget-wrappers/fieldGroupsRJSF/TimeFromToFieldRJSF'
import RadioButtonsWidgetRJSF from './widget-wrappers/RadioButtonWidgetRJSF'
import SelectFieldWidgetRJSF from './widget-wrappers/SelectFieldWidgetRJSF'
import TextAreaFieldWidgetRJSF from './widget-wrappers/TextAreaFieldWidgetRJSF'
import UploadWidgetRJSF from './widget-wrappers/UploadWidgetRJSF'

// you can add custom widgets as well as override the default ones
// we'll want to override all the default widgets listed here https://react-jsonschema-form.readthedocs.io/en/latest/advanced-customization/custom-widgets-fields/
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
  fields: {
    doubledInput: DoubledInputFieldRJSF,
    dateFromTo: DateFromToFieldRJSF,
    timeFromTo: TimeFromToFieldRJSF,
    dateTime: DateTimeFieldRJSF,
  },
}

export const ThemedForm = withTheme(theme)

export default ThemedForm

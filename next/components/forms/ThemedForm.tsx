import { ThemeProps, withTheme } from '@rjsf/core'
import { GenericObjectType } from '@rjsf/utils'
import DatePickerWidgetRJSF from 'components/forms/widget-wrappers/DatePickerWidgetRJSF'
import InputFieldWidgetRJSF from 'components/forms/widget-wrappers/InputFieldWidgetRJSF'
import TimePickerWidgetRJSF from 'components/forms/widget-wrappers/TimePickerWidgetRJSF'

import CheckboxWidgetRJSF from './widget-wrappers/CheckboxWidgetRJSF'
import DateFromToWidgetRJSF from './widget-wrappers/fieldGroupsRJSF/DateFromToWidgetRJSF'
import DateTimeWidgetRJSF from './widget-wrappers/fieldGroupsRJSF/DateTimeWidgetRJSF'
import DoubledInputWidgetFieldRJSF from './widget-wrappers/fieldGroupsRJSF/DoubledInputWidgetFieldRJSF'
import TimeFromToWidgetRJSF from './widget-wrappers/fieldGroupsRJSF/TimeFromToWidgetRJSF'
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
    // TODO: Fix types
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    doubledInput: DoubledInputWidgetFieldRJSF,
    dateFromTo: DateFromToWidgetRJSF,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    timeFromTo: TimeFromToWidgetRJSF,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    dateTime: DateTimeWidgetRJSF,
  },
  templates: {
    // Titles for steps are displayed externally, other titles are ignored.
    TitleFieldTemplate: () => null,
  },
}

const ThemedForm = withTheme<GenericObjectType>(theme)

export default ThemedForm

import { ThemeProps, withTheme } from '@rjsf/core'
import { GenericObjectType } from '@rjsf/utils'
import { ArrayFieldTemplateItemType } from '@rjsf/utils/src/types'
import DatePickerWidgetRJSF from 'components/forms/widget-wrappers/DatePickerWidgetRJSF'
import InputFieldWidgetRJSF from 'components/forms/widget-wrappers/InputFieldWidgetRJSF'
import TimePickerWidgetRJSF from 'components/forms/widget-wrappers/TimePickerWidgetRJSF'
import { ComponentType } from 'react'

import { wrapWidgetsInContext } from './useFormWidget'
import BAArrayFieldItemTemplate from './widget-wrappers/BAArrayFieldItemTemplate'
import BAArrayFieldTemplate from './widget-wrappers/BAArrayFieldTemplate'
import BAObjectFieldTemplate from './widget-wrappers/BAObjectFieldTemplate'
import CheckboxWidgetRJSF from './widget-wrappers/CheckboxWidgetRJSF'
import CustomComponentsWidgetRJSF from './widget-wrappers/CustomComponentsFieldWidgetRJSF'
import RadioButtonsWidgetRJSF from './widget-wrappers/RadioButtonWidgetRJSF'
import SelectFieldWidgetRJSF from './widget-wrappers/SelectFieldWidgetRJSF'
import TextAreaFieldWidgetRJSF from './widget-wrappers/TextAreaFieldWidgetRJSF'
import UploadWidgetRJSF from './widget-wrappers/UploadWidgetRJSF'

const theme: ThemeProps = {
  widgets: wrapWidgetsInContext({
    SelectField: SelectFieldWidgetRJSF,
    InputField: InputFieldWidgetRJSF,
    RadioButton: RadioButtonsWidgetRJSF,
    TextArea: TextAreaFieldWidgetRJSF,
    Checkboxes: CheckboxWidgetRJSF,
    Upload: UploadWidgetRJSF,
    DatePicker: DatePickerWidgetRJSF,
    TimePicker: TimePickerWidgetRJSF,
    CustomComponents: CustomComponentsWidgetRJSF,
  }),
  templates: {
    ObjectFieldTemplate: BAObjectFieldTemplate,
    ArrayFieldTemplate: BAArrayFieldTemplate,
    // It contains extra parentUiOptions prop that is not present in the original ArrayFieldItemTemplate, so we need to
    // cast it to the original type
    ArrayFieldItemTemplate: BAArrayFieldItemTemplate as ComponentType<ArrayFieldTemplateItemType>,
  },
}

const ThemedForm = withTheme<GenericObjectType>(theme)

export default ThemedForm

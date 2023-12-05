import { ThemeProps, withTheme } from '@rjsf/core'
import { GenericObjectType, WidgetProps } from '@rjsf/utils'
import { ArrayFieldTemplateItemType } from '@rjsf/utils/src/types'
import DatePickerWidgetRJSF from 'components/forms/widget-wrappers/DatePickerWidgetRJSF'
import TimePickerWidgetRJSF from 'components/forms/widget-wrappers/TimePickerWidgetRJSF'
import { ComponentType } from 'react'

import { wrapWidgetsInContext } from './useFormWidget'
import BAArrayFieldItemTemplate from './widget-wrappers/BAArrayFieldItemTemplate'
import BAArrayFieldTemplate from './widget-wrappers/BAArrayFieldTemplate'
import BAObjectFieldTemplate from './widget-wrappers/BAObjectFieldTemplate'
import CheckboxGroupWidgetRJSF from './widget-wrappers/CheckboxGroupWidgetRJSF'
import CheckboxWidgetRJSF from './widget-wrappers/CheckboxWidgetRJSF'
import CustomComponentsWidgetRJSF from './widget-wrappers/CustomComponentsFieldWidgetRJSF'
import FileUploadWidgetRJSF from './widget-wrappers/FileUploadWidgetRJSF'
import InputWidgetRJSF from './widget-wrappers/InputWidgetRJSF'
import RadioGroupWidgetRJSF from './widget-wrappers/RadioGroupWidgetRJSF'
import SelectWidgetRJSF from './widget-wrappers/SelectWidgetRJSF'
import TextAreaWidgetRJSF from './widget-wrappers/TextAreaWidgetRJSF'

// ComponentType<WidgetProps> must be used for each widget, because the library won't accept our custom overridden
// `options` property.
const theme: ThemeProps = {
  widgets: wrapWidgetsInContext({
    Select: SelectWidgetRJSF as ComponentType<WidgetProps>,
    Input: InputWidgetRJSF as ComponentType<WidgetProps>,
    RadioGroup: RadioGroupWidgetRJSF as ComponentType<WidgetProps>,
    TextArea: TextAreaWidgetRJSF as ComponentType<WidgetProps>,
    CheckboxGroup: CheckboxGroupWidgetRJSF as ComponentType<WidgetProps>,
    Checkbox: CheckboxWidgetRJSF as ComponentType<WidgetProps>,
    FileUpload: FileUploadWidgetRJSF as ComponentType<WidgetProps>,
    DatePicker: DatePickerWidgetRJSF as ComponentType<WidgetProps>,
    TimePicker: TimePickerWidgetRJSF as ComponentType<WidgetProps>,
    CustomComponents: CustomComponentsWidgetRJSF as ComponentType<WidgetProps>,
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

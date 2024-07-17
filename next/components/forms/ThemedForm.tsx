import { ThemeProps, withTheme } from '@rjsf/core'
import { ArrayFieldTemplateItemType, WidgetProps } from '@rjsf/utils'
import DatePickerWidgetRJSF from 'components/forms/widget-wrappers/DatePickerWidgetRJSF'
import TimePickerWidgetRJSF from 'components/forms/widget-wrappers/TimePickerWidgetRJSF'
import { BaWidgetType } from 'forms-shared/generator/uiOptionsTypes'
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
import SelectMultipleWidgetRJSF from './widget-wrappers/SelectMultipleWidgetRJSF'
import SelectWidgetRJSF from './widget-wrappers/SelectWidgetRJSF'
import TextAreaWidgetRJSF from './widget-wrappers/TextAreaWidgetRJSF'

// ComponentType<WidgetProps> must be used for each widget, because the library won't accept our custom overridden
// `options` property.
const theme: ThemeProps = {
  widgets: wrapWidgetsInContext({
    [BaWidgetType.Select]: SelectWidgetRJSF as ComponentType<WidgetProps>,
    [BaWidgetType.SelectMultiple]: SelectMultipleWidgetRJSF as ComponentType<WidgetProps>,
    [BaWidgetType.Input]: InputWidgetRJSF as ComponentType<WidgetProps>,
    [BaWidgetType.RadioGroup]: RadioGroupWidgetRJSF as ComponentType<WidgetProps>,
    [BaWidgetType.TextArea]: TextAreaWidgetRJSF as ComponentType<WidgetProps>,
    [BaWidgetType.CheckboxGroup]: CheckboxGroupWidgetRJSF as ComponentType<WidgetProps>,
    [BaWidgetType.Checkbox]: CheckboxWidgetRJSF as ComponentType<WidgetProps>,
    [BaWidgetType.FileUpload]: FileUploadWidgetRJSF as ComponentType<WidgetProps>,
    [BaWidgetType.DatePicker]: DatePickerWidgetRJSF as ComponentType<WidgetProps>,
    [BaWidgetType.TimePicker]: TimePickerWidgetRJSF as ComponentType<WidgetProps>,
    [BaWidgetType.CustomComponents]: CustomComponentsWidgetRJSF as ComponentType<WidgetProps>,
  }),
  templates: {
    ObjectFieldTemplate: BAObjectFieldTemplate,
    ArrayFieldTemplate: BAArrayFieldTemplate,
    // It contains extra parentUiOptions prop that is not present in the original ArrayFieldItemTemplate, so we need to
    // cast it to the original type
    ArrayFieldItemTemplate: BAArrayFieldItemTemplate as ComponentType<ArrayFieldTemplateItemType>,
  },
}

const ThemedForm = withTheme(theme)

export default ThemedForm

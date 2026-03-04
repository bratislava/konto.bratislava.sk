import { ThemeProps, withTheme } from '@rjsf/core'
import { ArrayFieldItemTemplateProps, FieldProps, WidgetProps } from '@rjsf/utils'
import { defaultFormFields, DefaultFormFieldType } from 'forms-shared/form-utils/defaultFormFields'
import { BaFieldType, BaWidgetType } from 'forms-shared/generator/uiOptionsTypes'
import { ComponentType } from 'react'

import BAArrayFieldItemTemplate from '@/src/components/widget-wrappers/BAArrayFieldItemTemplate'
import BAArrayFieldTemplate from '@/src/components/widget-wrappers/BAArrayFieldTemplate'
import BAFieldTemplate from '@/src/components/widget-wrappers/BAFieldTemplate'
import BAObjectFieldTemplate from '@/src/components/widget-wrappers/BAObjectFieldTemplate'
import CheckboxGroupWidgetRJSF from '@/src/components/widget-wrappers/CheckboxGroupWidgetRJSF'
import CheckboxWidgetRJSF from '@/src/components/widget-wrappers/CheckboxWidgetRJSF'
import CustomComponentsFieldRJSF from '@/src/components/widget-wrappers/CustomComponentsFieldRJSF'
import DatePickerWidgetRJSF from '@/src/components/widget-wrappers/DatePickerWidgetRJSF'
import FileUploadMultipleWidgetRJSF from '@/src/components/widget-wrappers/FileUploadMultipleWidgetRJSF'
import FileUploadWidgetRJSF from '@/src/components/widget-wrappers/FileUploadWidgetRJSF'
import InputWidgetRJSF from '@/src/components/widget-wrappers/InputWidgetRJSF'
import NumberWidgetRJSF from '@/src/components/widget-wrappers/NumberWidgetRJSF'
import RadioGroupWidgetRJSF from '@/src/components/widget-wrappers/RadioGroupWidgetRJSF'
import SelectMultipleWidgetRJSF from '@/src/components/widget-wrappers/SelectMultipleWidgetRJSF'
import SelectWidgetRJSF from '@/src/components/widget-wrappers/SelectWidgetRJSF'
import TextAreaWidgetRJSF from '@/src/components/widget-wrappers/TextAreaWidgetRJSF'
import TimePickerWidgetRJSF from '@/src/components/widget-wrappers/TimePickerWidgetRJSF'

// ComponentType<WidgetProps> must be used for each widget, because the library won't accept our custom overridden
// `options` property.
const theme: ThemeProps = {
  widgets: {
    [BaWidgetType.Select]: SelectWidgetRJSF as ComponentType<WidgetProps>,
    [BaWidgetType.SelectMultiple]: SelectMultipleWidgetRJSF as ComponentType<WidgetProps>,
    [BaWidgetType.Input]: InputWidgetRJSF as ComponentType<WidgetProps>,
    [BaWidgetType.Number]: NumberWidgetRJSF as ComponentType<WidgetProps>,
    [BaWidgetType.RadioGroup]: RadioGroupWidgetRJSF as ComponentType<WidgetProps>,
    [BaWidgetType.TextArea]: TextAreaWidgetRJSF as ComponentType<WidgetProps>,
    [BaWidgetType.CheckboxGroup]: CheckboxGroupWidgetRJSF as ComponentType<WidgetProps>,
    [BaWidgetType.Checkbox]: CheckboxWidgetRJSF as ComponentType<WidgetProps>,
    [BaWidgetType.FileUpload]: FileUploadWidgetRJSF as ComponentType<WidgetProps>,
    [BaWidgetType.FileUploadMultiple]: FileUploadMultipleWidgetRJSF as ComponentType<WidgetProps>,
    [BaWidgetType.DatePicker]: DatePickerWidgetRJSF as ComponentType<WidgetProps>,
    [BaWidgetType.TimePicker]: TimePickerWidgetRJSF as ComponentType<WidgetProps>,
  } satisfies Record<BaWidgetType, ComponentType<WidgetProps>>,
  fields: {
    [BaFieldType.CustomComponents]: CustomComponentsFieldRJSF,
    ...defaultFormFields,
  } satisfies Record<BaFieldType & DefaultFormFieldType, ComponentType<FieldProps>>,
  templates: {
    ObjectFieldTemplate: BAObjectFieldTemplate,
    ArrayFieldTemplate: BAArrayFieldTemplate,
    FieldTemplate: BAFieldTemplate,
    ArrayFieldItemTemplate: BAArrayFieldItemTemplate as ComponentType<ArrayFieldItemTemplateProps>,
  },
}

const ThemedForm = withTheme(theme)

export default ThemedForm

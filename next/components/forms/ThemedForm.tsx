import { ThemeProps, withTheme } from '@rjsf/core'
import { ArrayFieldTemplateItemType, FieldProps, WidgetProps } from '@rjsf/utils'
import { defaultFormFields, DefaultFormFieldType } from 'forms-shared/form-utils/defaultFormFields'
import { BaFieldType, BaWidgetType } from 'forms-shared/generator/uiOptionsTypes'
import { ComponentType } from 'react'

import BAArrayFieldItemTemplate from '@/components/forms/widget-wrappers/BAArrayFieldItemTemplate'
import BAArrayFieldTemplate from '@/components/forms/widget-wrappers/BAArrayFieldTemplate'
import BAFieldTemplate from '@/components/forms/widget-wrappers/BAFieldTemplate'
import BAObjectFieldTemplate from '@/components/forms/widget-wrappers/BAObjectFieldTemplate'
import CheckboxGroupWidgetRJSF from '@/components/forms/widget-wrappers/CheckboxGroupWidgetRJSF'
import CheckboxWidgetRJSF from '@/components/forms/widget-wrappers/CheckboxWidgetRJSF'
import CustomComponentsFieldRJSF from '@/components/forms/widget-wrappers/CustomComponentsFieldRJSF'
import DatePickerWidgetRJSF from '@/components/forms/widget-wrappers/DatePickerWidgetRJSF'
import FileUploadMultipleWidgetRJSF from '@/components/forms/widget-wrappers/FileUploadMultipleWidgetRJSF'
import FileUploadWidgetRJSF from '@/components/forms/widget-wrappers/FileUploadWidgetRJSF'
import InputWidgetRJSF from '@/components/forms/widget-wrappers/InputWidgetRJSF'
import NumberWidgetRJSF from '@/components/forms/widget-wrappers/NumberWidgetRJSF'
import RadioGroupWidgetRJSF from '@/components/forms/widget-wrappers/RadioGroupWidgetRJSF'
import SelectMultipleWidgetRJSF from '@/components/forms/widget-wrappers/SelectMultipleWidgetRJSF'
import SelectWidgetRJSF from '@/components/forms/widget-wrappers/SelectWidgetRJSF'
import TextAreaWidgetRJSF from '@/components/forms/widget-wrappers/TextAreaWidgetRJSF'
import TimePickerWidgetRJSF from '@/components/forms/widget-wrappers/TimePickerWidgetRJSF'

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
    // It contains extra props that is not present in the original ArrayFieldItemTemplate, so we need to
    // cast it to the original type
    ArrayFieldItemTemplate: BAArrayFieldItemTemplate as ComponentType<ArrayFieldTemplateItemType>,
  },
}

const ThemedForm = withTheme(theme)

export default ThemedForm

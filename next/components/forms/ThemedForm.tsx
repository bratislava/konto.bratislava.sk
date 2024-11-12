import { getDefaultRegistry, ThemeProps, withTheme } from '@rjsf/core'
import { ArrayFieldTemplateItemType, WidgetProps } from '@rjsf/utils'
import DatePickerWidgetRJSF from 'components/forms/widget-wrappers/DatePickerWidgetRJSF'
import TimePickerWidgetRJSF from 'components/forms/widget-wrappers/TimePickerWidgetRJSF'
import { BaWidgetType } from 'forms-shared/generator/uiOptionsTypes'
import { ComponentType, useMemo } from 'react'

import { wrapWidgetsInContext } from './useFormWidget'
import BAArrayFieldItemTemplate from './widget-wrappers/BAArrayFieldItemTemplate'
import BAArrayFieldTemplate from './widget-wrappers/BAArrayFieldTemplate'
import BAObjectFieldTemplate from './widget-wrappers/BAObjectFieldTemplate'
import CheckboxGroupWidgetRJSF from './widget-wrappers/CheckboxGroupWidgetRJSF'
import CheckboxWidgetRJSF from './widget-wrappers/CheckboxWidgetRJSF'
import CustomComponentsWidgetRJSF from './widget-wrappers/CustomComponentsFieldWidgetRJSF'
import FileUploadMultipleWidgetRJSF from './widget-wrappers/FileUploadMultipleWidgetRJSF'
import FileUploadWidgetRJSF from './widget-wrappers/FileUploadWidgetRJSF'
import InputWidgetRJSF from './widget-wrappers/InputWidgetRJSF'
import NumberWidgetRJSF from './widget-wrappers/NumberWidgetRJSF'
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
    [BaWidgetType.Number]: NumberWidgetRJSF as ComponentType<WidgetProps>,
    [BaWidgetType.RadioGroup]: RadioGroupWidgetRJSF as ComponentType<WidgetProps>,
    [BaWidgetType.TextArea]: TextAreaWidgetRJSF as ComponentType<WidgetProps>,
    [BaWidgetType.CheckboxGroup]: CheckboxGroupWidgetRJSF as ComponentType<WidgetProps>,
    [BaWidgetType.Checkbox]: CheckboxWidgetRJSF as ComponentType<WidgetProps>,
    [BaWidgetType.FileUpload]: FileUploadWidgetRJSF as ComponentType<WidgetProps>,
    [BaWidgetType.FileUploadMultiple]: FileUploadMultipleWidgetRJSF as ComponentType<WidgetProps>,
    [BaWidgetType.DatePicker]: DatePickerWidgetRJSF as ComponentType<WidgetProps>,
    [BaWidgetType.TimePicker]: TimePickerWidgetRJSF as ComponentType<WidgetProps>,
    // @ts-ignore
    [BaWidgetType.CustomComponents]: CustomComponentsWidgetRJSF as ComponentType<WidgetProps>,
  } satisfies Record<BaWidgetType, ComponentType<WidgetProps>>),
  templates: {
    ObjectFieldTemplate: BAObjectFieldTemplate,
    // @ts-ignore
    ArrayFieldTemplate: BAArrayFieldTemplate,
    // It contains extra parentUiOptions prop that is not present in the original ArrayFieldItemTemplate, so we need to
    // cast it to the original type
    ArrayFieldItemTemplate: BAArrayFieldItemTemplate as ComponentType<ArrayFieldTemplateItemType>,
  },
  fields: {
    SchemaField: (props) => {
      const defaultRegistry = getDefaultRegistry()
      const DefaultSchemaField = defaultRegistry.fields.SchemaField
      const uiSchema = useMemo(
        () => ({ ...props.uiSchema, 'ui:options': props.schema.uiOptions }),
        [props.uiSchema, props.schema],
      )
      const schema = useMemo(() => {
        const newSchema = { ...props.schema }
        delete newSchema.uiOptions
        return newSchema
      }, [props.schema])
      console.log('uiSchema', props.uiSchema, uiSchema)

      return <DefaultSchemaField {...props} schema={schema} uiSchema={uiSchema} />
    },
    // AnyOfField: (props) => {
    //   const options = getUiOptions(props.uiSchema)
    //   if (options?.widget === 'CustomComponents') {
    //     debugger
    //     return <CustomComponentsWidgetRJSF id={props.id} schema={props.schema as any} />
    //   }
    //
    //   const defaultRegistry = getDefaultRegistry()
    //   const DefaultAnyOfField = defaultRegistry.fields.AnyOfField
    //
    //   return <DefaultAnyOfField {...props} />
    // },
  },
}

const ThemedForm = withTheme(theme)

export default ThemedForm

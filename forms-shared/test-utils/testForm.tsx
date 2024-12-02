import { ThemeProps, withTheme } from '@rjsf/core'
import React, { ComponentProps, ComponentType } from 'react'
import { FieldProps, WidgetProps } from '@rjsf/utils'
import { BaFieldType, BaWidgetType } from '../src/generator/uiOptionsTypes'
import { renderToString } from 'react-dom/server'

const wrapWidget = (widgetType: BaWidgetType) =>
  function wrap({ id, label, value, children }: WidgetProps) {
    return (
      <div>
        <span>{id}</span>
        <span>{widgetType}</span>
        <label>{label}</label>
        <span>{JSON.stringify(value)}</span>
        {children}
      </div>
    )
  }

const wrapField = (fieldType: BaFieldType) =>
  function wrap({ id, label, value, children }: FieldProps) {
    return (
      <div>
        <span>{id}</span>
        <span>{fieldType}</span>
        <label>{label}</label>
        <span>{JSON.stringify(value)}</span>
        {children}
      </div>
    )
  }

const theme: ThemeProps = {
  widgets: {
    [BaWidgetType.Select]: wrapWidget(BaWidgetType.Select),
    [BaWidgetType.SelectMultiple]: wrapWidget(BaWidgetType.SelectMultiple),
    [BaWidgetType.Input]: wrapWidget(BaWidgetType.Input),
    [BaWidgetType.Number]: wrapWidget(BaWidgetType.Number),
    [BaWidgetType.RadioGroup]: wrapWidget(BaWidgetType.RadioGroup),
    [BaWidgetType.TextArea]: wrapWidget(BaWidgetType.TextArea),
    [BaWidgetType.Checkbox]: wrapWidget(BaWidgetType.Checkbox),
    [BaWidgetType.CheckboxGroup]: wrapWidget(BaWidgetType.CheckboxGroup),
    [BaWidgetType.FileUpload]: wrapWidget(BaWidgetType.FileUpload),
    [BaWidgetType.FileUploadMultiple]: wrapWidget(BaWidgetType.FileUploadMultiple),
    [BaWidgetType.DatePicker]: wrapWidget(BaWidgetType.DatePicker),
    [BaWidgetType.TimePicker]: wrapWidget(BaWidgetType.TimePicker),
  } satisfies Record<BaWidgetType, ComponentType<WidgetProps>>,
  fields: {
    [BaFieldType.CustomComponents]: wrapField(BaFieldType.CustomComponents),
  } satisfies Record<BaFieldType, ComponentType<FieldProps>>,
}

const ThemedForm = withTheme(theme)

export const renderTestForm = (props: ComponentProps<typeof ThemedForm>) =>
  renderToString(<ThemedForm {...props} />)

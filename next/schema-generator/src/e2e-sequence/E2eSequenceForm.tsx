import React, { DetailedHTMLProps, Fragment, HTMLAttributes } from 'react'
import { ThemeProps, withTheme } from '@rjsf/core'
import { ArrayFieldTemplateProps, GenericObjectType, ObjectFieldTemplateProps } from '@rjsf/utils'
import {
  SummaryWidgetRJSFProps,
  SummaryWidgetType,
} from '../../../components/forms/steps/Summary/SummaryWidgetRJSF'

type CustomElement<P = {}> = DetailedHTMLProps<HTMLAttributes<HTMLElement> & P, HTMLElement>

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'e2e-sequence': CustomElement
      step: CustomElement<{ name: string }>
      array: CustomElement<{ id: string; length: number }>
      field: CustomElement<{ id: string; type: string; value: string }>
    }
  }
}

const wrapWidget = (widgetType: SummaryWidgetType) =>
  function wrap(props: Omit<SummaryWidgetRJSFProps, 'widgetType'>) {
    return <field id={props.id} type={widgetType} value={JSON.stringify(props.value)} />
  }

const FieldTemplate = ({ children }: { children: React.ReactNode }) => <>{children}</>

const ArrayFieldTemplate = ({ items, idSchema }: ArrayFieldTemplateProps) => {
  return (
    <>
      <array id={idSchema.$id} length={items.length} />
      <>
        {items.map((element, index) => (
          <Fragment key={index}>{element.children}</Fragment>
        ))}
      </>
    </>
  )
}

const ArrayFieldItemTemplate = ({ children }: { children: React.ReactNode }) => <>{children}</>

const ObjectFieldTemplate = ({ properties, idSchema }: ObjectFieldTemplateProps) => {
  const splitId = idSchema.$id.split('_')
  // const isRootObject = splitId.length === 1 && splitId[0] === 'root'
  const isStepObject = splitId.length === 2 && splitId[0] === 'root'

  const content = properties.map((element, index) => (
    <Fragment key={index}>{element.content}</Fragment>
  ))

  if (isStepObject) {
    const stepName = splitId[1]
    return (
      <>
        <step name={stepName} />
        {content}
      </>
    )
  }
  return <>{content}</>
}

const theme: ThemeProps = {
  templates: {
    FieldTemplate,
    ObjectFieldTemplate,
    ArrayFieldTemplate,
    ArrayFieldItemTemplate,
  },
  widgets: {
    Select: wrapWidget('select'),
    Input: wrapWidget('input'),
    RadioGroup: wrapWidget('radioGroup'),
    TextArea: wrapWidget('textArea'),
    Checkbox: wrapWidget('checkbox'),
    CheckboxGroup: wrapWidget('checkboxGroup'),
    FileUpload: wrapWidget('fileUpload'),
    DatePicker: wrapWidget('datePicker'),
    TimePicker: wrapWidget('timePicker'),
    CustomComponents: () => {
      return null
    },
  },
}

export const E2eSequenceForm = withTheme<GenericObjectType>(theme)

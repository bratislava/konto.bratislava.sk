import React, { Fragment, PropsWithChildren, ReactNode } from 'react'
import {
  SummaryJsonArray,
  SummaryJsonArrayItem,
  SummaryJsonElement,
  SummaryJsonField,
  SummaryJsonForm,
  SummaryJsonStep,
  SummaryJsonType,
} from '../summary-json/summaryJsonTypes'
import { ValidatedSummary } from './validateSummary'
import { FileInfoSummary } from '../form-files/fileStatus'
import {
  SummaryDisplayValue,
  SummaryDisplayValueType,
} from '../summary-json/getSummaryDisplayValue'

export type SummaryFormRendererProps = PropsWithChildren<{
  form: SummaryJsonForm
  hasError: boolean
}>

export type SummaryStepRendererProps = PropsWithChildren<{
  step: SummaryJsonStep
  hasError: boolean
}>

export type SummaryArrayRendererProps = PropsWithChildren<{
  array: SummaryJsonArray
  hasError: boolean
}>

export type SummaryFieldRendererProps = PropsWithChildren<{
  field: SummaryJsonField
  hasError: boolean
}>

export type SummaryArrayItemRendererProps = PropsWithChildren<{
  arrayItem: SummaryJsonArrayItem
  hasError: boolean
}>

export type SummaryStringValueRendererProps = {
  value: string
}

export type SummaryFileValueRendererProps = {
  id: string
  fileInfo: FileInfoSummary
}

type DisplayValueRendererProps = {
  displayValue: SummaryDisplayValue
  validatedSummary: ValidatedSummary
  renderStringValue: (props: SummaryStringValueRendererProps) => ReactNode
  renderFileValue: (props: SummaryFileValueRendererProps) => ReactNode
  renderNoneValue: () => ReactNode
  renderInvalidValue: () => ReactNode
}

type SummaryRendererProps = {
  summaryJson: SummaryJsonForm
  validatedSummary: ValidatedSummary
  renderForm: (props: SummaryFormRendererProps) => ReactNode
  renderStep: (props: SummaryStepRendererProps) => ReactNode
  renderField: (props: SummaryFieldRendererProps) => ReactNode
  renderArray: (props: SummaryArrayRendererProps) => ReactNode
  renderArrayItem: (props: SummaryArrayItemRendererProps) => ReactNode
} & Omit<DisplayValueRendererProps, 'displayValue'>

const DisplayValueRenderer = ({
  validatedSummary,
  displayValue,
  renderStringValue,
  renderFileValue,
  renderNoneValue,
  renderInvalidValue,
}: DisplayValueRendererProps) => {
  switch (displayValue.type) {
    case SummaryDisplayValueType.String:
      return <>{renderStringValue({ value: displayValue.value })}</>
    case SummaryDisplayValueType.File:
      const fileInfo = validatedSummary?.getFileById(displayValue.id)
      if (!fileInfo) {
        return <>{renderInvalidValue()}</>
      }

      return <>{renderFileValue({ id: displayValue.id, fileInfo })}</>
    case SummaryDisplayValueType.None:
      return <>{renderNoneValue()}</>
    case SummaryDisplayValueType.Invalid:
      return <>{renderInvalidValue()}</>
    default:
      return null
  }
}

/**
 * Renders a summary JSON to a React component.
 *
 * This encapsulates the common logic of rendering the summary JSON into a React component. See usage for more details.
 */
export const SummaryRenderer = ({
  summaryJson,
  validatedSummary,
  renderForm,
  renderStep,
  renderField,
  renderArray,
  renderArrayItem,
  ...rest
}: SummaryRendererProps) => {
  const renderElement = (element: SummaryJsonElement): ReactNode => {
    const renderChildren = (children: SummaryJsonElement[]) =>
      children.map((child) => <Fragment key={child.id}>{renderElement(child)}</Fragment>)
    const hasError = validatedSummary?.pathHasError(element.id) ?? false

    switch (element.type) {
      case SummaryJsonType.Form:
        return renderForm({
          form: element,
          children: renderChildren(element.steps),
          hasError,
        })
      case SummaryJsonType.Step:
        return renderStep({
          step: element,
          children: renderChildren(element.children),
          hasError,
        })
      case SummaryJsonType.Field:
        return renderField({
          field: element,
          hasError,
          children: element.displayValues.map((displayValue, index) => (
            <DisplayValueRenderer
              key={index}
              validatedSummary={validatedSummary}
              displayValue={displayValue}
              {...rest}
            ></DisplayValueRenderer>
          )),
        })
      case SummaryJsonType.Array:
        return renderArray({
          array: element,
          children: renderChildren(element.items),
          hasError,
        })
      case SummaryJsonType.ArrayItem:
        return renderArrayItem({
          arrayItem: element,
          children: renderChildren(element.children),
          hasError,
        })
      default:
        throw new Error(`Invalid element type`)
    }
  }

  return renderElement(summaryJson)
}

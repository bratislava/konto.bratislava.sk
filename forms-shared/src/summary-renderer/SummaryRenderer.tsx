import React, { Fragment, PropsWithChildren, ReactNode } from 'react'

import { SummaryDisplayValue } from '../summary-json/getSummaryDisplayValue'
import {
  SummaryJsonArray,
  SummaryJsonArrayItem,
  SummaryJsonElement,
  SummaryJsonField,
  SummaryJsonForm,
  SummaryJsonStep,
  SummaryJsonType,
} from '../summary-json/summaryJsonTypes'
import { checkPathForErrors } from './checkPathForErrors'
import { ValidatedSummary } from './validateSummary'

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

export type SummaryDisplayValueRendererProps = {
  displayValue: SummaryDisplayValue
}

type SummaryRendererProps = {
  summaryJson: SummaryJsonForm
  validatedSummary?: ValidatedSummary
  renderForm: (props: SummaryFormRendererProps) => ReactNode
  renderStep: (props: SummaryStepRendererProps) => ReactNode
  renderField: (props: SummaryFieldRendererProps) => ReactNode
  renderArray: (props: SummaryArrayRendererProps) => ReactNode
  renderArrayItem: (props: SummaryArrayItemRendererProps) => ReactNode
  renderDisplayValue: (props: SummaryDisplayValueRendererProps) => ReactNode
}

/**
 * Renders a summary JSON to a React component.
 *
 * This encapsulates the common logic of rendering the summary JSON into a React component. See usage for more details.
 */
const SummaryRenderer = ({
  summaryJson,
  validatedSummary,
  renderForm,
  renderStep,
  renderField,
  renderArray,
  renderArrayItem,
  renderDisplayValue,
}: SummaryRendererProps) => {
  const renderElement = (element: SummaryJsonElement): ReactNode => {
    const renderChildren = (children: SummaryJsonElement[]) =>
      children.map((child) => <Fragment key={child.id}>{renderElement(child)}</Fragment>)
    const hasError = validatedSummary?.errorSchema
      ? checkPathForErrors(element.id, validatedSummary.errorSchema)
      : false

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
            <Fragment key={index}>{renderDisplayValue({ displayValue })}</Fragment>
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

export default SummaryRenderer

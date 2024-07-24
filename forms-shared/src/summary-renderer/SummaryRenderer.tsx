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

type RendererPropsBase = {
  hasError: boolean
  index: number
  isFirst: boolean
  isLast: boolean
}

export type SummaryFormRendererProps = PropsWithChildren<
  {
    form: SummaryJsonForm
  } & RendererPropsBase
>

export type SummaryStepRendererProps = PropsWithChildren<
  {
    step: SummaryJsonStep
  } & RendererPropsBase
>

export type SummaryArrayRendererProps = PropsWithChildren<
  {
    array: SummaryJsonArray
  } & RendererPropsBase
>

export type SummaryFieldRendererProps = PropsWithChildren<
  {
    field: SummaryJsonField
  } & RendererPropsBase
>

export type SummaryArrayItemRendererProps = PropsWithChildren<
  {
    arrayItem: SummaryJsonArrayItem
  } & RendererPropsBase
>

type ValueRendererBase = {
  index: number
  isFirst: boolean
  isLast: boolean
}

export type SummaryStringValueRendererProps = {
  value: string
} & ValueRendererBase

export type SummaryFileValueRendererProps = {
  id: string
  fileInfo: FileInfoSummary
} & ValueRendererBase

export type SummaryNoneValueRendererProps = ValueRendererBase

export type SummaryInvalidValueRendererProps = ValueRendererBase

type DisplayValueRendererProps = {
  displayValue: SummaryDisplayValue
  validatedSummary: ValidatedSummary
  renderStringValue: (props: SummaryStringValueRendererProps) => ReactNode
  renderFileValue: (props: SummaryFileValueRendererProps) => ReactNode
  renderNoneValue: (props: SummaryNoneValueRendererProps) => ReactNode
  renderInvalidValue: (props: SummaryInvalidValueRendererProps) => ReactNode
} & ValueRendererBase

type SummaryRendererProps = {
  summaryJson: SummaryJsonForm
  validatedSummary: ValidatedSummary
  renderForm: (props: SummaryFormRendererProps) => ReactNode
  renderStep: (props: SummaryStepRendererProps) => ReactNode
  renderField: (props: SummaryFieldRendererProps) => ReactNode
  renderArray: (props: SummaryArrayRendererProps) => ReactNode
  renderArrayItem: (props: SummaryArrayItemRendererProps) => ReactNode
} & Pick<
  DisplayValueRendererProps,
  'renderStringValue' | 'renderFileValue' | 'renderNoneValue' | 'renderInvalidValue'
>

const DisplayValueRenderer = ({
  validatedSummary,
  displayValue,
  renderStringValue,
  renderFileValue,
  renderNoneValue,
  renderInvalidValue,
  index,
  isFirst,
  isLast,
}: DisplayValueRendererProps) => {
  switch (displayValue.type) {
    case SummaryDisplayValueType.String:
      return <>{renderStringValue({ value: displayValue.value, index, isFirst, isLast })}</>
    case SummaryDisplayValueType.File:
      const fileInfo = validatedSummary?.getFileById(displayValue.id)
      if (!fileInfo) {
        return <>{renderInvalidValue({ index, isFirst, isLast })}</>
      }

      return <>{renderFileValue({ id: displayValue.id, fileInfo, index, isFirst, isLast })}</>
    case SummaryDisplayValueType.None:
      return <>{renderNoneValue({ index, isFirst, isLast })}</>
    case SummaryDisplayValueType.Invalid:
      return <>{renderInvalidValue({ index, isFirst, isLast })}</>
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
  renderStringValue,
  renderFileValue,
  renderNoneValue,
  renderInvalidValue,
}: SummaryRendererProps) => {
  const renderElement = (
    element: SummaryJsonElement,
    index: number,
    isLast: boolean,
  ): ReactNode => {
    const renderChildren = (children: SummaryJsonElement[]) =>
      children.map((child, childIndex) => {
        const isLastChild = childIndex === children.length - 1

        return <Fragment key={child.id}>{renderElement(child, childIndex, isLastChild)}</Fragment>
      })
    const base = {
      hasError: validatedSummary?.pathHasError(element.id) ?? false,
      index,
      isFirst: index === 0,
      isLast,
    }

    switch (element.type) {
      case SummaryJsonType.Form:
        return renderForm({
          form: element,
          children: renderChildren(element.steps),
          ...base,
        })
      case SummaryJsonType.Step:
        return renderStep({
          step: element,
          children: renderChildren(element.children),
          ...base,
        })
      case SummaryJsonType.Field:
        return renderField({
          field: element,
          children: element.displayValues.map((displayValue, index) => (
            <DisplayValueRenderer
              key={index}
              validatedSummary={validatedSummary}
              displayValue={displayValue}
              renderStringValue={renderStringValue}
              renderFileValue={renderFileValue}
              renderNoneValue={renderNoneValue}
              renderInvalidValue={renderInvalidValue}
              index={index}
              isFirst={index === 0}
              isLast={index === element.displayValues.length - 1}
            ></DisplayValueRenderer>
          )),
          ...base,
        })
      case SummaryJsonType.Array:
        return renderArray({
          array: element,
          children: renderChildren(element.items),
          ...base,
        })
      case SummaryJsonType.ArrayItem:
        return renderArrayItem({
          arrayItem: element,
          children: renderChildren(element.children),
          ...base,
        })
      default:
        throw new Error(`Invalid element type`)
    }
  }

  return renderElement(summaryJson, 0, true)
}

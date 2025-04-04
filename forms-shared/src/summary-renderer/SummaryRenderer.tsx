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
import { FileInfoSummary } from '../form-files/fileStatus'
import {
  SummaryDisplayValue,
  SummaryDisplayValueType,
} from '../summary-json/getSummaryDisplayValue'
import { GenericObjectType, ValidationData } from '@rjsf/utils'
import { checkPathForErrors } from './checkPathForErrors'

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
  fileInfos: Record<string, FileInfoSummary>
  renderStringValue: (props: SummaryStringValueRendererProps) => ReactNode
  renderFileValue: (props: SummaryFileValueRendererProps) => ReactNode
  renderNoneValue: (props: SummaryNoneValueRendererProps) => ReactNode
  renderInvalidValue: (props: SummaryInvalidValueRendererProps) => ReactNode
} & ValueRendererBase

type SummaryRendererProps = {
  summaryJson: SummaryJsonForm
  fileInfos: Record<string, FileInfoSummary>
  /**
   * Required only for summaries that display validation errors (FE app, PDF).
   */
  validationData?: ValidationData<GenericObjectType>
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
  displayValue,
  fileInfos,
  renderStringValue,
  renderFileValue,
  renderNoneValue,
  renderInvalidValue,
  index,
  isFirst,
  isLast,
}: DisplayValueRendererProps) => {
  const childPropsBase = {
    index,
    isFirst,
    isLast,
  }

  switch (displayValue.type) {
    case SummaryDisplayValueType.String:
      return <>{renderStringValue({ value: displayValue.value, ...childPropsBase })}</>
    case SummaryDisplayValueType.File:
      const fileInfo = fileInfos[displayValue.id]
      if (!fileInfo) {
        return <>{renderInvalidValue(childPropsBase)}</>
      }

      return <>{renderFileValue({ id: displayValue.id, fileInfo, ...childPropsBase })}</>
    case SummaryDisplayValueType.None:
      return <>{renderNoneValue(childPropsBase)}</>
    case SummaryDisplayValueType.Invalid:
      return <>{renderInvalidValue(childPropsBase)}</>
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
  fileInfos,
  validationData,
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
      hasError: validationData ? checkPathForErrors(element.id, validationData.errorSchema) : false,
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
              fileInfos={fileInfos}
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

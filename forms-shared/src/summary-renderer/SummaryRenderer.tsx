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

type ComponentPropsBase = {
  hasError: boolean
  index: number
  isFirst: boolean
  isLast: boolean
}

export type SummaryFormComponentProps = PropsWithChildren<
  {
    form: SummaryJsonForm
  } & ComponentPropsBase
>

export type SummaryStepComponentProps = PropsWithChildren<
  {
    step: SummaryJsonStep
  } & ComponentPropsBase
>

export type SummaryArrayComponentProps = PropsWithChildren<
  {
    array: SummaryJsonArray
  } & ComponentPropsBase
>

export type SummaryFieldComponentProps = PropsWithChildren<
  {
    field: SummaryJsonField
  } & ComponentPropsBase
>

export type SummaryArrayItemComponentProps = PropsWithChildren<
  {
    arrayItem: SummaryJsonArrayItem
  } & ComponentPropsBase
>

type ValueRendererBase = {
  index: number
  isFirst: boolean
  isLast: boolean
}

export type SummaryStringValueComponentProps = {
  value: string
} & ValueRendererBase

export type SummaryFileValueComponentProps = {
  id: string
  fileInfo: FileInfoSummary
} & ValueRendererBase

export type SummaryNoneValueComponentProps = ValueRendererBase

export type SummaryInvalidValueComponentProps = ValueRendererBase

export type SummaryRendererComponents = {
  FormComponent: (props: SummaryFormComponentProps) => ReactNode
  StepComponent: (props: SummaryStepComponentProps) => ReactNode
  FieldComponent: (props: SummaryFieldComponentProps) => ReactNode
  ArrayComponent: (props: SummaryArrayComponentProps) => ReactNode
  ArrayItemComponent: (props: SummaryArrayItemComponentProps) => ReactNode
  StringValueComponent: (props: SummaryStringValueComponentProps) => ReactNode
  FileValueComponent: (props: SummaryFileValueComponentProps) => ReactNode
  NoneValueComponent: (props: SummaryNoneValueComponentProps) => ReactNode
  InvalidValueComponent: (props: SummaryInvalidValueComponentProps) => ReactNode
}

type SummaryRendererProps = {
  summaryJson: SummaryJsonForm
  fileInfos: Record<string, FileInfoSummary>
  /**
   * Required only for summaries that display validation errors (FE app, PDF).
   *
   * Must be explicitly set to `null` for summaries that do not display validation errors (e.g. PDF) to
   * express that the validation errors are not needed.
   */
  validationData: ValidationData<GenericObjectType> | null
  components: SummaryRendererComponents
}

const DisplayValueRenderer = ({
  displayValue,
  fileInfos,
  components,
  index,
  isFirst,
  isLast,
}: {
  displayValue: SummaryDisplayValue
} & Pick<SummaryRendererProps, 'fileInfos' | 'components'> &
  ValueRendererBase) => {
  const childPropsBase = {
    index,
    isFirst,
    isLast,
  }
  const { StringValueComponent, FileValueComponent, NoneValueComponent, InvalidValueComponent } =
    components

  switch (displayValue.type) {
    case SummaryDisplayValueType.String:
      return <StringValueComponent value={displayValue.value} {...childPropsBase} />
    case SummaryDisplayValueType.File:
      const fileInfo = fileInfos[displayValue.id]
      if (!fileInfo) {
        return <InvalidValueComponent {...childPropsBase} />
      }

      return <FileValueComponent id={displayValue.id} fileInfo={fileInfo} {...childPropsBase} />
    case SummaryDisplayValueType.None:
      return <NoneValueComponent {...childPropsBase} />
    case SummaryDisplayValueType.Invalid:
      return <InvalidValueComponent {...childPropsBase} />
    default:
      return null
  }
}

function ChildrenRenderer({
  childrenElements,
  components,
  fileInfos,
  validationData,
}: {
  childrenElements: SummaryJsonElement[]
} & Pick<SummaryRendererProps, 'fileInfos' | 'components' | 'validationData'>) {
  return (
    <Fragment>
      {childrenElements.map((child, index) => {
        const isLast = index === childrenElements.length - 1

        return (
          <ElementRenderer
            key={child.id}
            element={child}
            index={index}
            isLast={isLast}
            components={components}
            fileInfos={fileInfos}
            validationData={validationData}
          />
        )
      })}
    </Fragment>
  )
}

function ElementRenderer({
  element,
  index,
  isLast,
  components,
  validationData,
  fileInfos,
}: {
  element: SummaryJsonElement
  index: number
  isLast: boolean
} & Pick<SummaryRendererProps, 'fileInfos' | 'components' | 'validationData'>) {
  const { FormComponent, StepComponent, FieldComponent, ArrayComponent, ArrayItemComponent } =
    components

  const base: ComponentPropsBase = {
    hasError: validationData ? checkPathForErrors(element.id, validationData.errorSchema) : false,
    index,
    isFirst: index === 0,
    isLast,
  }

  if (element.type === SummaryJsonType.Form) {
    return (
      <FormComponent form={element} {...base}>
        <ChildrenRenderer
          childrenElements={element.steps}
          components={components}
          fileInfos={fileInfos}
          validationData={validationData}
        />
      </FormComponent>
    )
  } else if (element.type === SummaryJsonType.Step) {
    return (
      <StepComponent step={element} {...base}>
        <ChildrenRenderer
          childrenElements={element.children}
          components={components}
          fileInfos={fileInfos}
          validationData={validationData}
        />
      </StepComponent>
    )
  } else if (element.type === SummaryJsonType.Field) {
    return (
      <FieldComponent field={element} {...base}>
        {element.displayValues.map((displayValue, index) => (
          <DisplayValueRenderer
            key={index}
            index={index}
            isFirst={index === 0}
            isLast={index === element.displayValues.length - 1}
            displayValue={displayValue}
            components={components}
            fileInfos={fileInfos}
          />
        ))}
      </FieldComponent>
    )
  } else if (element.type === SummaryJsonType.Array) {
    return (
      <ArrayComponent array={element} {...base}>
        <ChildrenRenderer
          childrenElements={element.items}
          components={components}
          fileInfos={fileInfos}
          validationData={validationData}
        />
      </ArrayComponent>
    )
  } else if (element.type === SummaryJsonType.ArrayItem) {
    return (
      <ArrayItemComponent arrayItem={element} {...base}>
        <ChildrenRenderer
          childrenElements={element.children}
          components={components}
          fileInfos={fileInfos}
          validationData={validationData}
        />
      </ArrayItemComponent>
    )
  }

  throw new Error(`Invalid element type`)
}

/**
 * Renders a summary JSON to a React component.
 *
 * This encapsulates the common logic of rendering the summary JSON into a React component. See usage for more details.
 */
export function SummaryRenderer({
  summaryJson,
  components,
  fileInfos,
  validationData,
}: SummaryRendererProps) {
  return (
    <ElementRenderer
      element={summaryJson}
      index={0}
      isLast={true}
      components={components}
      fileInfos={fileInfos}
      validationData={validationData}
    />
  )
}

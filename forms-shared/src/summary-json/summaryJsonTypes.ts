import { SummaryDisplayValues } from './getSummaryDisplayValue'

export enum SummaryJsonType {
  Form = 'Form',
  Step = 'Step',
  Field = 'Field',
  Array = 'Array',
  ArrayItem = 'ArrayItem',
}

export type SummaryJsonForm = {
  type: SummaryJsonType.Form
  id: string
  title: string
  steps: SummaryJsonStep[]
}

export type SummaryJsonFieldOrArray = SummaryJsonField | SummaryJsonArray

export type SummaryJsonStep = {
  type: SummaryJsonType.Step
  id: string
  title: string
  children: SummaryJsonFieldOrArray[]
}

export type SummaryJsonField = {
  type: SummaryJsonType.Field
  id: string
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
  displayValues: SummaryDisplayValues
}

export type SummaryJsonArray = {
  type: SummaryJsonType.Array
  id: string
  length: number
  title: string
  items: SummaryJsonArrayItem[]
}

export type SummaryJsonArrayItem = {
  type: SummaryJsonType.ArrayItem
  id: string
  title: string
  children: SummaryJsonFieldOrArray[]
}

export type SummaryJsonElement =
  | SummaryJsonForm
  | SummaryJsonStep
  | SummaryJsonField
  | SummaryJsonArray
  | SummaryJsonArrayItem

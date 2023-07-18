export type FormStepIndex = number | 'summary'

export interface FormStepMetadata {
  index: FormStepIndex
  displayIndex: number
  title: string
  isSubmitted: boolean
  isSummary: boolean
}

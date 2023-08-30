export type FormStepIndex = number | 'summary'

export interface FormStepperStep {
  index: FormStepIndex
  displayIndex: number
  title: string
  hash: string
  isSubmitted: boolean
  isSummary: boolean
}

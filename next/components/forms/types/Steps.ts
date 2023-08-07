export type FormStepIndex = number | 'summary'

export interface FormStepperStep {
  index: FormStepIndex
  displayIndex: number
  title: string
  isSubmitted: boolean
  isSummary: boolean
}

export type FormStepIndex = number | 'summary'

export interface FormStepperStep {
  index: FormStepIndex
  displayIndex: number
  title: string
  description?: string
  stepperTitle?: string
  queryParam: string
  isSubmitted: boolean
  isSummary: boolean
}

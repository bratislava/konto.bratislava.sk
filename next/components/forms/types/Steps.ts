export type FormStepIndex = number | 'summary'

type StepBase = {
  displayIndex: number
  queryParam: string
}

type GenericStep = StepBase & {
  index: number
  title: string
  stepperTitle?: string
  isSubmitted: boolean
  description?: string
}

type SummaryStep = StepBase & {
  index: 'summary'
}

export type FormStepperStep = GenericStep | SummaryStep

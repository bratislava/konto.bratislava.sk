import { defineNewSubmissionEmail, type NewSubmissionEmailProps } from './components/NewSubmission'

export type FormsNewSubmissionTsbEmailProps = NewSubmissionEmailProps

/** Submissions of TSB forms, to the staff who handle them. */
export const formsNewSubmissionTsbEmail = defineNewSubmissionEmail('tsb')

export const renderFormsNewSubmissionTsbEmail = formsNewSubmissionTsbEmail.render

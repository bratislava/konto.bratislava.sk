import { defineNewSubmissionEmail, type NewSubmissionEmailProps } from './components/NewSubmission'

export type FormsNewSubmissionOloEmailProps = NewSubmissionEmailProps

/** Submissions of OLO forms, to the staff who handle them. */
export const formsNewSubmissionOloEmail = defineNewSubmissionEmail('olo')

export const renderFormsNewSubmissionOloEmail = formsNewSubmissionOloEmail.render

import { defineNewSubmissionEmail, type NewSubmissionEmailProps } from './components/NewSubmission'

export type FormsNewSubmissionBratislavaEmailProps = NewSubmissionEmailProps

/** Submissions of city forms handled by e-mail (not sent to GINIS), to the staff who handle them. */
export const formsNewSubmissionBratislavaEmail = defineNewSubmissionEmail('bratislava')

export const renderFormsNewSubmissionBratislavaEmail = formsNewSubmissionBratislavaEmail.render

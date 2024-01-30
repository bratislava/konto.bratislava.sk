import React from 'react'

import FormProviders from './FormProviders'
import SummaryForm from './steps/Summary/SummaryForm'
import { FormSummaryProvider } from './steps/Summary/useFormSummary'
import { FormContext } from './useFormContext'

export type PdfSummaryPageProps = {
  formContext: FormContext
}

const PdfSummaryPage = ({ formContext }: PdfSummaryPageProps) => {
  return (
    <FormProviders formContext={formContext}>
      <FormSummaryProvider isPdf>
        <h1 className="text-h1-form mb-4">{formContext.schema.title}</h1>
        <SummaryForm />
      </FormSummaryProvider>
    </FormProviders>
  )
}

export default PdfSummaryPage

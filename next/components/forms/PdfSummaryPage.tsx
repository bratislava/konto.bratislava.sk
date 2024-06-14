import React from 'react'

import FormProviders from './FormProviders'
import SummaryDetails from './steps/Summary/SummaryDetails'
import SummaryFormLegalText from './steps/Summary/SummaryFormLegalText'
import { FormSummaryProvider } from './steps/Summary/useFormSummary'
import { FormContext } from './useFormContext'

export type PdfSummaryPageProps = {
  formContext: FormContext
}

/**
 * This page wraps the form in needed providers but renders only the summary for PDF preview.
 */
const PdfSummaryPage = ({ formContext }: PdfSummaryPageProps) => {
  return (
    <FormProviders formContext={formContext}>
      <FormSummaryProvider>
        <div className="flex flex-col gap-4">
          <h1 className="text-h1-form">{formContext.schema.title}</h1>
          <SummaryDetails />
          <SummaryFormLegalText />
        </div>
      </FormSummaryProvider>
    </FormProviders>
  )
}

export default PdfSummaryPage

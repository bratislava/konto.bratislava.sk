import { useTranslation } from 'next-i18next'
import React from 'react'

import AccountMarkdown from '@/components/forms/segments/AccountMarkdown/AccountMarkdown'

import { useFormContext } from '../../useFormContext'

const SummaryFormLegalText = () => {
  const {
    formDefinition: { termsAndConditions },
  } = useFormContext()
  const { t } = useTranslation('forms')

  return (
    <div>
      <h3 className="mb-4 text-h3">{t('summary.vop_agreement_title')}</h3>
      <AccountMarkdown
        content={termsAndConditions}
        // TODO: Replace variant statusBar
        variant="statusBar"
        className="rounded-[10px] bg-gray-50 p-4 md:p-6 lg:p-8"
      />
    </div>
  )
}

export default SummaryFormLegalText

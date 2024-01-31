import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { useFormContext } from '../../useFormContext'

const SummaryFormLegalText = () => {
  const { isTaxForm } = useFormContext()
  const { t } = useTranslation('forms')

  return (
    <div>
      <h3 className="text-h3 mb-4">{t('summary.vop_agreement_title')}</h3>
      <AccountMarkdown
        content={
          isTaxForm ? t('summary.vop_agreement_content_tax') : t('summary.vop_agreement_content')
        }
        // TODO: Replace variant statusBar
        variant="statusBar"
        className="rounded-10 bg-gray-50 p-8"
      />
    </div>
  )
}

export default SummaryFormLegalText

import { renderFormAdditionalInfo } from 'forms-shared/string-templates/renderTemplate'
import { useTranslation } from 'next-i18next/pages'
import React, { useMemo } from 'react'

import AccountMarkdown from '@/src/components/formatting/AccountMarkdown'
import { useFormContext } from '@/src/components/forms/useFormContext'
import { useFormData } from '@/src/components/forms/useFormData'

const SummaryAdditionalInfo = () => {
  const { t } = useTranslation('forms')
  const { formDefinition } = useFormContext()
  const { formData } = useFormData()
  const additionalInfo = useMemo(
    () => renderFormAdditionalInfo(formDefinition, formData, true),
    [formDefinition, formData],
  )

  if (!additionalInfo) {
    return null
  }

  return (
    <div>
      <h3 className="text-h3 mb-4">{t('summary.additional_info')}</h3>
      <AccountMarkdown
        content={additionalInfo}
        // TODO: Replace variant statusBar
        variant="statusBar"
        className="rounded-[10px] bg-gray-50 p-4 md:p-6 lg:p-8"
      />
    </div>
  )
}

export default SummaryAdditionalInfo

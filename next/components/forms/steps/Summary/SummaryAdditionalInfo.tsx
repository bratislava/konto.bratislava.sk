import { useFormData } from 'components/forms/useFormData'
import { renderFormAdditionalInfo } from 'forms-shared/string-templates/renderTemplate'
import { useTranslation } from 'next-i18next'
import React, { useMemo } from 'react'

import AccountMarkdown from '../../segments/AccountMarkdown/AccountMarkdown'
import { useFormContext } from '../../useFormContext'

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
      <h3 className="mb-4 text-h3">{t('summary.additional_info')}</h3>
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

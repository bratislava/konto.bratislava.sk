import { Typography } from '@bratislava/component-library'
import { renderFormAdditionalInfo } from 'forms-shared/string-templates/renderTemplate'
import { useTranslation } from 'next-i18next/pages'
import { useMemo } from 'react'

import Markdown from '@/src/components/formatting/Markdown'
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
      <Typography variant="h3" className="mb-4">
        {t('summary.additional_info')}
      </Typography>
      <Markdown
        content={additionalInfo}
        variant="small"
        className="rounded-[10px] bg-gray-50 p-4 md:p-6 lg:p-8"
      />
    </div>
  )
}

export default SummaryAdditionalInfo

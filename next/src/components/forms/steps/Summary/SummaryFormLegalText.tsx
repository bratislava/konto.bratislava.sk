import { Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'

import Markdown from '@/src/components/formatting/Markdown'
import { useFormContext } from '@/src/components/forms/useFormContext'

const SummaryFormLegalText = () => {
  const { t } = useTranslation()

  const {
    formDefinition: { termsAndConditions },
  } = useFormContext()

  return (
    <div>
      <Typography variant="h3" className="mb-4">
        {t('SummaryFormLegalText.title')}
      </Typography>
      <Markdown
        content={termsAndConditions}
        variant="small"
        className="rounded-[10px] bg-gray-50 p-4 lg:p-8"
      />
    </div>
  )
}

export default SummaryFormLegalText

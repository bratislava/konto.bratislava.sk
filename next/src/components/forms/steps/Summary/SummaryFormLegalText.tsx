import { Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'

import AccountMarkdown from '@/src/components/formatting/AccountMarkdown'
import { useFormContext } from '@/src/components/forms/useFormContext'

const SummaryFormLegalText = () => {
  const {
    formDefinition: { termsAndConditions },
  } = useFormContext()
  const { t } = useTranslation('forms')

  return (
    <div>
      <Typography variant="h3" className="mb-4">{t('summary.vop_agreement_title')}</Typography>
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

import { Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'

import AccountMarkdown from '@/src/components/formatting/AccountMarkdown'
import Alert from '@/src/components/simple-components/Alert'
import MLink from '@/src/components/simple-components/MLink'
import { ROUTES } from '@/src/utils/routes'

const DznTaxFormAlert = () => {
  const { t } = useTranslation('account')

  return (
    <Alert
      type="info"
      fullWidth
      message={
        <>
          <Typography variant="h6" as="p" className="mb-2 font-semibold">
            {t('account_section_payment.tax_form_change_ownership_alert_title')}
          </Typography>

          <AccountMarkdown
            content={t('account_section_payment.tax_form_change_ownership_alert_text')}
            variant="sm"
          />
          <div className="pt-2">
            <MLink
              href={ROUTES.MUNICIPAL_SERVICES_FORM('priznanie-k-dani-z-nehnutelnosti')}
              variant="underlined-medium"
            >
              {t('account_section_payment.tax_form_change_ownership_alert_link_text')}
            </MLink>
          </div>
        </>
      }
    />
  )
}

export default DznTaxFormAlert

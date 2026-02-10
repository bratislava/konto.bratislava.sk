import Alert from 'components/forms/info-components/Alert'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import MLink from 'components/forms/simple-components/MLink'
import { ROUTES } from 'frontend/api/constants'
import { useTranslation } from 'next-i18next'
import React from 'react'

const DznTaxFormAlert = () => {
  const { t } = useTranslation('account')

  return (
    <Alert
      type="info"
      fullWidth
      message={
        <>
          <div className="mb-2 text-h6">
            {t('account_section_payment.tax_form_change_ownership_alert_title')}
          </div>

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

import MLinkNew from 'components/forms/simple-components/MLinkNew'
import { ROUTES } from 'frontend/api/constants'
import { useTranslation } from 'next-i18next'
import React from 'react'

import Alert from '../../../info-components/Alert'
import AccountMarkdown from '../../AccountMarkdown/AccountMarkdown'

const TaxFormAlert = () => {
  const { t } = useTranslation('account')

  return (
    <Alert
      type="info"
      fullWidth
      message={
        <>
          <span className="text-h6">
            {t('account_section_payment.tax_form_change_ownership_alert_title')}
          </span>

          <AccountMarkdown
            content={t('account_section_payment.tax_form_change_ownership_alert_text')}
            variant="sm"
          />
          <div className="pt-2">
            <MLinkNew
              href={ROUTES.MUNICIPAL_SERVICES_FORM('priznanie-k-dani-z-nehnutelnosti')}
              variant="underlined-medium"
            >
              {t('account_section_payment.tax_form_change_ownership_alert_link_text')}
            </MLinkNew>
          </div>
        </>
      }
    />
  )
}

export default TaxFormAlert

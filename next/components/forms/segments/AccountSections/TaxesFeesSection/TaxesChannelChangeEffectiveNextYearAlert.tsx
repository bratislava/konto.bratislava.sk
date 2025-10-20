import { TaxFragment } from '@clients/graphql-strapi/api'
import { ROUTES } from 'frontend/api/constants'
import { useTranslation } from 'next-i18next'
import React from 'react'

import Alert from '../../../info-components/Alert'
import AccountMarkdown from '../../AccountMarkdown/AccountMarkdown'

type TaxesChannelChangeEffectiveNextYearAlertProps = {
  strapiTax: TaxFragment
}

const TaxesChannelChangeEffectiveNextYearAlert = ({
  strapiTax: { channelChangeEffectiveNextYearTitle, channelChangeEffectiveNextYearText },
}: TaxesChannelChangeEffectiveNextYearAlertProps) => {
  const { t } = useTranslation('account')

  if (!channelChangeEffectiveNextYearTitle && !channelChangeEffectiveNextYearText) {
    return null
  }

  return (
    <Alert
      type="warning"
      fullWidth
      message={
        <>
          {channelChangeEffectiveNextYearTitle ? (
            <span className="text-h6">{channelChangeEffectiveNextYearTitle}</span>
          ) : null}
          {channelChangeEffectiveNextYearText ? (
            <AccountMarkdown content={channelChangeEffectiveNextYearText} variant="sm" />
          ) : null}
        </>
      }
      buttons={[
        {
          title: t('account_section_payment.effective_next_year_link_text'),
          link: ROUTES.HELP,
        },
      ]}
    />
  )
}

export default TaxesChannelChangeEffectiveNextYearAlert

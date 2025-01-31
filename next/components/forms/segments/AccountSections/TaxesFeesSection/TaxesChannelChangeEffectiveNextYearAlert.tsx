import { TaxFragment } from '@clients/graphql-strapi/api'
import React from 'react'

import Alert from '../../../info-components/Alert'
import AccountMarkdown from '../../AccountMarkdown/AccountMarkdown'

type TaxesChannelChangeEffectiveNextYearAlertProps = {
  strapiTax: TaxFragment
}

const TaxesChannelChangeEffectiveNextYearAlert = ({
  strapiTax: { channelChangeEffectiveNextYearTitle, channelChangeEffectiveNextYearText },
}: TaxesChannelChangeEffectiveNextYearAlertProps) => {
  if (!channelChangeEffectiveNextYearTitle && !channelChangeEffectiveNextYearText) {
    return null
  }

  return (
    <Alert
      type="info"
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
    />
  )
}

export default TaxesChannelChangeEffectiveNextYearAlert

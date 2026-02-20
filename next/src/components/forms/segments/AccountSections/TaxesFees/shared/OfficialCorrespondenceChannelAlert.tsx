import React from 'react'

import { TaxFragment } from '@/src/clients/graphql-strapi/api'
import Alert from '@/src/components/forms/info-components/Alert'
import AccountMarkdown from '@/src/components/forms/segments/AccountMarkdown/AccountMarkdown'

type Props = {
  strapiTax: TaxFragment
  variant: 'change-effective-next-year'
}

const OfficialCorrespondenceChannelAlert = ({ strapiTax }: Props) => {
  const { channelChangeEffectiveNextYearTitle, channelChangeEffectiveNextYearText } = strapiTax

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
    />
  )
}

export default OfficialCorrespondenceChannelAlert

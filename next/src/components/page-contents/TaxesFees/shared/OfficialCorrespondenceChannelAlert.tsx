import { Typography } from '@bratislava/component-library'

import { TaxFragment } from '@/src/clients/graphql-strapi/api'
import AccountMarkdown from '@/src/components/formatting/AccountMarkdown'
import Alert from '@/src/components/simple-components/Alert'

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
            <Typography variant="h6" as="span">
              {channelChangeEffectiveNextYearTitle}
            </Typography>
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

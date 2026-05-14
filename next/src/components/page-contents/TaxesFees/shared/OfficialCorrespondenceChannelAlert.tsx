import { Typography } from '@bratislava/component-library'

import { TaxFragment } from '@/src/clients/graphql-strapi/api'
import Markdown from '@/src/components/formatting/Markdown'
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
            <Markdown variant="small" content={channelChangeEffectiveNextYearText} />
          ) : null}
        </>
      }
    />
  )
}

export default OfficialCorrespondenceChannelAlert

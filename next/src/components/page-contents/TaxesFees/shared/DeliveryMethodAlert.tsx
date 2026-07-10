import { Typography } from '@bratislava/component-library'

import { MunicipalChargeConfigFragment } from '@/src/clients/graphql-strapi/api'
import Markdown from '@/src/components/formatting/Markdown'
import Alert from '@/src/components/simple-components/Alert'

type Props = {
  strapiTaxConfig: MunicipalChargeConfigFragment
  variant: 'change-effective-next-year'
}

const DeliveryMethodAlert = ({ strapiTaxConfig, variant }: Props) => {
  const { deliveryMethodChangePendingAlert } = strapiTaxConfig.deliveryMethod ?? {}
  const { title, content } = deliveryMethodChangePendingAlert ?? {}

  if (!title && !content) {
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (variant === 'change-effective-next-year') {
    return (
      <Alert
        type="warning"
        fullWidth
        message={
          <>
            {title ? (
              <Typography variant="h6" as="span">
                {title}
              </Typography>
            ) : null}
            {content ? <Markdown variant="small" content={content} /> : null}
          </>
        }
      />
    )
  }

  return null
}

export default DeliveryMethodAlert

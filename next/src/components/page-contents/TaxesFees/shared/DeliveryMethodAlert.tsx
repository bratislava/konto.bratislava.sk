import { Typography } from '@bratislava/component-library'

import Markdown from '@/src/components/formatting/Markdown'
import { useStrapiTaxConfig } from '@/src/components/page-contents/TaxesFees/useStrapiTaxConfig'
import Alert from '@/src/components/simple-components/Alert'

type Props = {
  variant: 'change-effective-next-year'
}

const DeliveryMethodAlert = ({ variant }: Props) => {
  const { deliveryMethod } = useStrapiTaxConfig()
  const { title, content } = deliveryMethod.deliveryMethodChangePendingAlert ?? {}

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

import { Typography } from '@bratislava/component-library'
import { PaymentRedirectStateEnum } from 'openapi-clients/tax'

import { usePaymentResultPropsMap } from '@/src/components/page-contents/PaymentResultPageContent/PaymentResultPageContent'
import ThankYouTile from '@/src/components/simple-components/ThankYouTile/ThankYouTile'
import { Stack } from '@/src/components/styleguide/Stack'

const variantLabels: Record<PaymentRedirectStateEnum, string> = {
  [PaymentRedirectStateEnum.PaymentSuccess]: 'Payment Success',
  [PaymentRedirectStateEnum.PaymentAlreadyPaid]: 'Payment Already Paid',
  [PaymentRedirectStateEnum.FailedToVerify]: 'Failed to Verify',
  [PaymentRedirectStateEnum.PaymentFailed]: 'Payment Failed',
}

const PaymentResultPageContentShowCase = () => {
  const { cardPropsMap } = usePaymentResultPropsMap({
    feedbackLink: '#',
    taxDetailLink: '#',
  })

  return (
    <>
      {Object.entries(cardPropsMap).map(([status, props]) => (
        <div key={status} className="flex flex-col items-start gap-1">
          <Typography variant="h5" as="h3">
            {variantLabels[status]}
          </Typography>
          <Stack className="justify-center">
            <ThankYouTile {...props} />
          </Stack>
        </div>
      ))}
    </>
  )
}

export default PaymentResultPageContentShowCase

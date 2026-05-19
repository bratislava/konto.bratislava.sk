import { Button, ButtonButtonProps, Typography } from '@bratislava/component-library'

import { FormatCurrencyFromCents } from '@/src/components/formatting/formatCurrency'
import Markdown from '@/src/components/formatting/Markdown'

interface TaxFeePaymentMethodsItemProps {
  title: string
  subtitle?: string
  amount: number
  buttonText: string
  buttonVariant: Extract<ButtonButtonProps['variant'], 'solid' | 'outline'>
  buttonHref: string
}

const TaxFeePaymentMethodsItem = ({
  title,
  subtitle,
  amount,
  buttonText,
  buttonVariant,
  buttonHref,
}: TaxFeePaymentMethodsItemProps) => {
  return (
    <div className="flex w-full flex-col justify-between gap-4 border-gray-200 p-4 nth-2:border-t lg:flex-row lg:gap-0 lg:p-6">
      <div className="flex flex-col items-start justify-center gap-3">
        <Markdown content={title} variant="small" />
        {subtitle ? (
          <Typography variant="p-small" className="font-semibold text-content-passive-secondary">
            {subtitle}
          </Typography>
        ) : null}
      </div>
      <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:gap-8">
        <Typography variant="p-large" className="font-semibold">
          <FormatCurrencyFromCents value={amount} />
        </Typography>
        <Button
          variant={buttonVariant}
          href={buttonHref}
          fullWidthMobile
          // fixed width is wanted, however size doesn't match figma,
          // Button has to be implemented as part of design system then we can adjust size,
          // otherwise text will be split into two lines
          className="lg:w-55"
        >
          {buttonText}
        </Button>
      </div>
    </div>
  )
}

export default TaxFeePaymentMethodsItem

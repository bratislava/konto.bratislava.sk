import { Button, ButtonButtonProps } from '@bratislava/component-library'

import { FormatCurrencyFromCents } from '@/src/components/formatting/formatCurrency'

interface TaxFeePaymentMethodsItemProps {
  title: React.ReactNode
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
        <div className="text-p2">{title}</div>
        {subtitle && <div className="text-p2-semibold text-category-600">{subtitle}</div>}
      </div>
      <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:gap-8">
        <span className="text-p1-semibold">
          <FormatCurrencyFromCents value={amount} />
        </span>
        <Button
          variant={buttonVariant}
          href={buttonHref}
          fullWidthMobile
          // fixed width is wanted, however size doesn't match figma,
          // Button has to be implemented as part of design system then we can adjust size,
          // othervise text will be split into two lines
          className="lg:w-55"
        >
          {buttonText}
        </Button>
      </div>
    </div>
  )
}

export default TaxFeePaymentMethodsItem

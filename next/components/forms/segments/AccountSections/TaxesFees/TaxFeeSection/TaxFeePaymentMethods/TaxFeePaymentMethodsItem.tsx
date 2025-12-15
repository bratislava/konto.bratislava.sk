import ButtonNew from 'components/forms/simple-components/ButtonNew'
import { FormatCurrencyFromCents } from 'frontend/utils/formatCurrency'

interface TaxFeePaymentMethodsItemProps {
  title: React.ReactNode
  subtitle: string
  amount: number
  buttonText: string
  buttonVariant: 'black-solid' | 'black-outline'
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
    // components in figma is not grouped properly, so gaps are all over the place to match figma design
    <div className="flex w-full flex-col justify-between gap-4 border-gray-200 p-4 nth-2:border-t-2 lg:flex-row lg:gap-0 lg:p-6">
      <div className="flex flex-col items-start gap-3">
        <div className="text-p2">{title}</div>
        <div className="text-p2-semibold text-category-600">{subtitle}</div>
      </div>
      <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:gap-8">
        <span className="text-p1-semibold">
          <FormatCurrencyFromCents value={amount} />
        </span>
        <ButtonNew
          variant={buttonVariant}
          href={buttonHref}
          fullWidthMobile
          hasLinkIcon
          // fixed width is wanted, however size doesn't match figma,
          // ButtonNew has to be implemented as part of design system then we can adjust size,
          // othervise text will be split into two lines
          className="lg:w-53"
        >
          {buttonText}
        </ButtonNew>
      </div>
    </div>
  )
}

export default TaxFeePaymentMethodsItem

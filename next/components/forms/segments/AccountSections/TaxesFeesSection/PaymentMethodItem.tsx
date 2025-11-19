import ButtonNew from 'components/forms/simple-components/ButtonNew'
import { FormatCurrencyFromCents } from 'frontend/utils/formatCurrency'

interface PaymentMethodItemProps {
  title: React.ReactNode
  subtitle: string
  amount: number
  buttonText: string
  buttonVariant: 'black-solid' | 'black-outline'
  buttonHref: string
}

const PaymentMethodItem = ({
  title,
  subtitle,
  amount,
  buttonText,
  buttonVariant,
  buttonHref,
}: PaymentMethodItemProps) => {
  return (
    <div className="flex w-full flex-col justify-between border-gray-200 nth-2:border-t-2 nth-2:pt-4 lg:flex-row">
      <div className="flex flex-col items-start gap-3 px-4 pt-4 lg:px-0 lg:pt-0 lg:pb-3">
        <div className="text-p2">{title}</div>
        <div className="text-p2-semibold text-category-600">{subtitle}</div>
      </div>
      <div className="flex flex-col items-start gap-4 px-4 pb-4 lg:flex-row lg:items-center lg:gap-8 lg:px-0 lg:pb-0">
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

export default PaymentMethodItem

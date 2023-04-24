import { TaxApiError } from '@utils/api'
import { useTaxes } from '@utils/apiHooks'
import { ROUTES } from '@utils/constants'
import logger from '@utils/logger'
import useAccount, { AccountStatus } from '@utils/useAccount'
import { taxStatusHelper } from '@utils/utils'
import AccountSectionHeader from 'components/forms/segments/AccountSectionHeader/AccountSectionHeader'
import TaxesFeesCard from 'components/forms/segments/AccountSections/TaxesFeesSection/TaxesFeesCard'
import TaxesFeesErrorCard from 'components/forms/segments/AccountSections/TaxesFeesSection/TaxesFeesErrorCard'
import TaxesFeesWaitingCard from 'components/forms/segments/AccountSections/TaxesFeesSection/TaxesFeesWaitingCard'
import Spinner from 'components/forms/simple-components/Spinner'
import { useTranslation } from 'next-i18next'

export type TaxesCardBase = {
  title: string
  yearPay: number
  createDate: string
  currentPaid: number
  finishPrice: number
  paidDate?: string
  status: 'paid' | 'unpaid' | 'partially_paid'
}

interface TaxesFeesSectionProps {
  isProductionDeployment?: boolean
}

const TaxesFeesSection: React.FC<TaxesFeesSectionProps> = () => {
  const { t } = useTranslation('account')
  const { status } = useAccount()

  const { data, error, isLoading } = useTaxes()

  const taxesFeesWaitingCardContent = `
<h4>${t('account_section_payment.waiting_card_title')}</h4>
<p>${t('account_section_payment.waiting_card_text')}</p>
`
  const taxesFeesErrorCardContent = `
<h4>${t('account_section_payment.error_card_title')}</h4>
<div>${t('account_section_payment.error_card_content.title')}
<ul>${
    status !== AccountStatus.IdentityVerificationSuccess
      ? t('account_section_payment.error_card_content.list.verification', {
          url: ROUTES.IDENTITY_VERIFICATION,
        })
      : ''
  }${t('account_section_payment.error_card_content.list.other')}</ul><br />${t(
    'account_section_payment.error_card_content.help_text',
    { url: ROUTES.I_HAVE_A_PROBLEM },
  )}</div>
`

  let content = null

  if (isLoading) {
    content = <Spinner className="mt-10 m-auto" />
  } else if (status !== AccountStatus.IdentityVerificationSuccess) {
    content = <TaxesFeesErrorCard content={taxesFeesErrorCardContent} />
  } else if (!isLoading && !data) {
    content =
      error instanceof TaxApiError && error.status === 422 ? (
        <TaxesFeesWaitingCard content={taxesFeesWaitingCardContent} />
      ) : (
        <TaxesFeesErrorCard content={taxesFeesErrorCardContent} />
      )
  } else if (data) {
    content = (
      <ul className="lg:px-0 my-2 lg:my-8 px-4 sm:px-6">
        <li className="mb-2 lg:mb-6">
          <TaxesFeesCard
            title={t('account_section_payment.tax_card_title')}
            yearPay={data?.year}
            createDate={new Date(data?.createdAt).toLocaleDateString('sk-SK')}
            currentPaid={data?.payedAmount}
            finishPrice={data?.amount}
            status={taxStatusHelper(data).paymentStatus}
            paidDate={data?.updatedAt}
          />
        </li>
      </ul>
    )
  } else {
    logger.error('TaxesFeesSection.tsx: unknown error - shoud never happen')
    content = (
      <div>
        Neočakávaná chyba pri načítaní dát - kontaktujte prosím podporu na info@bratislava.sk
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <AccountSectionHeader title={t('account_section_payment.title')} />
      <div className="max-w-screen-lg w-full m-auto">{content}</div>
    </div>
  )
}

export default TaxesFeesSection

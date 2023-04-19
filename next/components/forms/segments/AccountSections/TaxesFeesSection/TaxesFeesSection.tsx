import { useTaxes } from '@utils/apiHooks'
import { ROUTES } from '@utils/constants'
import useAccount, { AccountStatus } from '@utils/useAccount'
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
  status: 'negative' | 'warning' | 'success'
}

interface TaxesFeesSectionProps {
  isProductionDeployment?: boolean
}

const TaxesFeesSection = ({ isProductionDeployment }: TaxesFeesSectionProps) => {
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

  // TODO nicer loading
  if (isLoading) {
    content = <Spinner className="mt-10 m-auto" />
  } else if (isProductionDeployment) {
    // TOOD add if status !== AccountStatus.IdentityVerificationSuccess
    // prod shows no available taxes yet
    content = <TaxesFeesErrorCard content={taxesFeesErrorCardContent} />
  } else if (!isLoading && !data) {
    content = <TaxesFeesWaitingCard content={taxesFeesWaitingCardContent} />
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
            status={'negative'}
            paidDate={data?.updatedAt}
          />
        </li>
      </ul>
    )
  } else {
    content = 'TODO continue here error content'
  }

  if (data)
    return (
      <div className="flex flex-col">
        <AccountSectionHeader title={t('account_section_payment.title')} />
        <div className="max-w-screen-lg w-full m-auto">{content}</div>
      </div>
    )
}

export default TaxesFeesSection

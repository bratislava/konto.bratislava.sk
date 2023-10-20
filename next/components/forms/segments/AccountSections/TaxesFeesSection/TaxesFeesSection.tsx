// import { TaxApiError } from '@utils/api'
import AccountSectionHeader from 'components/forms/segments/AccountSectionHeader/AccountSectionHeader'
import TaxesFeesCard from 'components/forms/segments/AccountSections/TaxesFeesSection/TaxesFeesCard'
import TaxesFeesErrorCard from 'components/forms/segments/AccountSections/TaxesFeesSection/TaxesFeesErrorCard'
// import TaxesFeesWaitingCard from 'components/forms/segments/AccountSections/TaxesFeesSection/TaxesFeesWaitingCard'
import Spinner from 'components/forms/simple-components/Spinner'
import { useServerSideAuth } from 'frontend/hooks/useServerSideAuth'
import { useTranslation } from 'next-i18next'

import { ROUTES } from '../../../../../frontend/api/constants'
import { useTaxes } from '../../../../../frontend/hooks/apiHooks'
import { taxStatusHelper } from '../../../../../frontend/utils/general'
import logger from '../../../../../frontend/utils/logger'

export type TaxesCardBase = {
  title: string
  yearPay: number
  createDate: string
  currentPaid: number
  finishPrice: number
  paidDate?: string
  status: 'paid' | 'unpaid' | 'partially_paid'
}

const TaxesFeesSection = () => {
  const { t } = useTranslation('account')
  const { tierStatus } = useServerSideAuth()
  const { data, isPending } = useTaxes()

  //   const taxesFeesWaitingCardContent = `
  // <h4>${t('account_section_payment.waiting_card_title')}</h4>
  // <p>${t('account_section_payment.waiting_card_text')}</p>
  // `
  const taxesFeesErrorCardContent = `
<h4>${t('account_section_payment.error_card_title')}</h4>
<div>${t('account_section_payment.error_card_content.title')}
<ul>${
    !tierStatus.isIdentityVerified
      ? t('account_section_payment.error_card_content.list.verification', {
          url: ROUTES.IDENTITY_VERIFICATION,
        })
      : ''
  }${t('account_section_payment.error_card_content.list.other')}</ul><br />${t(
    'account_section_payment.error_card_content.help_text',
    { url: ROUTES.HELP },
  )}</div>
`

  let content: JSX.Element | null = null

  if (isPending) {
    content = <Spinner className="m-auto mt-10" />
  } else if (!tierStatus.isIdentityVerified) {
    content = <TaxesFeesErrorCard content={taxesFeesErrorCardContent} />
  } else if (!isPending && !data) {
    content = (
      // error instanceof TaxApiError && error.status === 422 ? (
      //   <TaxesFeesWaitingCard content={taxesFeesWaitingCardContent} />
      // ) : (
      <TaxesFeesErrorCard content={taxesFeesErrorCardContent} />
    )
  } else if (data) {
    content = (
      <ul className="my-2 px-4 sm:px-6 lg:my-8 lg:px-0">
        <li className="mb-2 lg:mb-6">
          <TaxesFeesCard
            title={t('account_section_payment.tax_card_title')}
            yearPay={data?.year}
            createDate={new Date(data?.createdAt).toLocaleDateString('sk-SK')}
            currentPaid={data?.payedAmount}
            finishPrice={data?.amount}
            status={taxStatusHelper(data).paymentStatus}
            // paidDate={data?.updatedAt}
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
      <div className="m-auto w-full max-w-screen-lg">{content}</div>
    </div>
  )
}

export default TaxesFeesSection

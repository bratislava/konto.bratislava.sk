import { StrapiTaxAdministrator } from '@backend/utils/tax-administrator'
import { ResponseGetTaxesDto, TaxPaidStatusEnum } from '@clients/openapi-tax'
import AccountSectionHeader from 'components/forms/segments/AccountSectionHeader/AccountSectionHeader'
import TaxesFeesCard from 'components/forms/segments/AccountSections/TaxesFeesSection/TaxesFeesCard'
// import TaxesFeesWaitingCard from 'components/forms/segments/AccountSections/TaxesFeesSection/TaxesFeesWaitingCard'
import { useTranslation } from 'next-i18next'

import { ROUTES } from '../../../../../frontend/api/constants'
import { useSsrAuth } from '../../../../../frontend/hooks/useSsrAuth'
import TaxesFeesErrorCard from './TaxesFeesErrorCard'

type TaxesFeesSectionProps = {
  taxesData: ResponseGetTaxesDto
  taxAdministrator: StrapiTaxAdministrator | null
}

export type TaxesCardBase = {
  title: string
  yearPay: number
  createDate: string
  currentPaid: number
  finishPrice: number
  paidDate?: string
  status: TaxPaidStatusEnum
}

const TaxesFeesSection = ({ taxesData }: TaxesFeesSectionProps) => {
  const { t } = useTranslation('account')
  const { tierStatus } = useSsrAuth()

  const taxesFeesErrorCardContent = `
  <h3>${t('account_section_payment.error_card_title')}</h3>
  <div>${t('account_section_payment.error_card_content.title')}
  <ul>${
    tierStatus.isIdentityVerified
      ? ''
      : t('account_section_payment.error_card_content.list.verification', {
          url: ROUTES.IDENTITY_VERIFICATION,
        })
  }${t('account_section_payment.error_card_content.list.other')}</ul><br />${t(
    'account_section_payment.error_card_content.help_text',
    { url: ROUTES.HELP },
  )}</div>
  `

  // const taxesFeesWaitingCardContent = `
  // <h4>${t('account_section_payment.waiting_card_title')}</h4>
  // <p>${t('account_section_payment.waiting_card_text')}</p>
  // `

  return (
    <div className="flex flex-col">
      <AccountSectionHeader title={t('account_section_payment.title')} />
      <div className="m-auto w-full max-w-screen-lg">
        {!taxesData.isInNoris && <TaxesFeesErrorCard content={taxesFeesErrorCardContent} />}
        <ul className="my-2 px-4 sm:px-6 lg:my-8 lg:px-0">
          <li className="mb-2 lg:mb-6">
            {taxesData.items.map((item) => (
              <TaxesFeesCard
                title={t('account_section_payment.tax_card_title')}
                yearPay={item?.year}
                createDate={new Date(item?.createdAt).toLocaleDateString('sk-SK')}
                currentPaid={item?.paidAmount}
                finishPrice={item?.amount}
                status={item.paidStatus}
                // paidDate={data?.updatedAt}
              />
            ))}
          </li>
        </ul>
      </div>
    </div>
  )
}

export default TaxesFeesSection

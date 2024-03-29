import { StrapiTaxAdministrator } from '@backend/utils/tax-administrator'
import { ResponseGetTaxesDto, TaxPaidStatusEnum } from '@clients/openapi-tax'
import AccountSectionHeader from 'components/forms/segments/AccountSectionHeader/AccountSectionHeader'
import TaxesFeesCard from 'components/forms/segments/AccountSections/TaxesFeesSection/TaxesFeesCard'
import { useTranslation } from 'next-i18next'

import { ROUTES } from '../../../../../frontend/api/constants'
import { useSsrAuth } from '../../../../../frontend/hooks/useSsrAuth'
import TaxesFeesErrorCard from './TaxesFeesErrorCard'
import TaxesFeesPreparingCard from './TaxesFeesPreparingCard'
import TaxesFeesTaxAdministratorCard from './TaxesFeesTaxAdministratorCard'

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

const TaxesFeesSection = ({ taxesData, taxAdministrator }: TaxesFeesSectionProps) => {
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

  const displayErrorCard = !taxesData.isInNoris
  const displayInPreparationCard =
    // TODO: Move this logic to BE
    taxesData.isInNoris && !taxesData.items.some((item) => item.year === new Date().getFullYear())
  const displayTaxCards = taxesData.items.length > 0

  return (
    <div className="flex flex-col">
      <AccountSectionHeader title={t('account_section_payment.title')} />
      <div className="m-auto flex w-full max-w-screen-lg flex-col gap-4 p-4 sm:px-6 lg:gap-8 lg:px-0 lg:py-8">
        {taxAdministrator && <TaxesFeesTaxAdministratorCard taxAdministrator={taxAdministrator} />}
        {displayErrorCard && <TaxesFeesErrorCard content={taxesFeesErrorCardContent} />}
        {(displayInPreparationCard || displayTaxCards) && (
          <div className="flex flex-col gap-4">
            {/* TODO: Translation */}
            <h2 className="text-h5-bold">Daň z nehnuteľností</h2>
            {displayInPreparationCard && <TaxesFeesPreparingCard />}
            {displayTaxCards && (
              <ul className="flex flex-col gap-4">
                {taxesData.items.map((item) => (
                  <li>
                    <TaxesFeesCard
                      key={item.year}
                      title={t('account_section_payment.tax_card_title')}
                      yearPay={item.year}
                      createDate={new Date(item.createdAt).toLocaleDateString('sk-SK')}
                      currentPaid={item.paidAmount}
                      finishPrice={item.amount}
                      status={item.paidStatus}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TaxesFeesSection

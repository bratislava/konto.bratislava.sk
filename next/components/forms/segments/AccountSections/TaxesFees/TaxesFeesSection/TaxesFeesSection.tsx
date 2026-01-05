import AccountSectionHeader from 'components/forms/segments/AccountSectionHeader/AccountSectionHeader'
import IdentityVerificationBanner from 'components/forms/segments/AccountSections/TaxesFees/shared/IdentityVerificationBanner'
import OfficialCorrespondenceChannelInformation from 'components/forms/segments/AccountSections/TaxesFees/shared/OfficialCorrespondenceChannelInformation'
import OfficialCorrespondenceChannelNeededBanner from 'components/forms/segments/AccountSections/TaxesFees/shared/OfficialCorrespondenceChannelNeededBanner'
import TaxesFeesAdministratorCardWrapper from 'components/forms/segments/AccountSections/TaxesFees/shared/TaxesFeesAdministratorCard/TaxesFeesAdministratorCardWrapper'
import TaxesFeesOverview from 'components/forms/segments/AccountSections/TaxesFees/TaxesFeesSection/TaxesFeesOverview'
import TaxesFeesTabs, {
  TaxTypeTabOptions,
} from 'components/forms/segments/AccountSections/TaxesFees/TaxesFeesSection/TaxesFeesTabs'
import { useOfficialCorrespondenceChannel } from 'components/forms/segments/AccountSections/TaxesFees/useOfficialCorrespondenceChannel'
import { useTaxesFeesSection } from 'components/forms/segments/AccountSections/TaxesFees/useTaxesFeesSection'
import { useSsrAuth } from 'frontend/hooks/useSsrAuth'
import { useTranslation } from 'next-i18next'
import { TaxType } from 'openapi-clients/tax'
import React, { useState } from 'react'
import { Key } from 'react-aria-components'

/**
 * Figma: https://www.figma.com/design/0VrrvwWs7n3T8YFzoHe92X/BK--Dizajn--DEV-?node-id=13580-1475&t=fznV5maoQK8a2irI-4
 */

const TaxesFeesSection = () => {
  const { t } = useTranslation('account')

  const {
    tierStatus: { isInQueue, isIdentityVerified },
  } = useSsrAuth()
  const { showChannelNeededBanner } = useOfficialCorrespondenceChannel()
  const { taxesData, strapiTaxAdministrator } = useTaxesFeesSection()

  const taxTypeTabOptions: TaxTypeTabOptions = [
    { title: t('account_section_payment.property_tax_title'), id: TaxType.Dzn },
    { title: t('account_section_payment.communal_waste_fee_title'), id: TaxType.Ko },
  ]

  const [selectedTaxType, setSelectedTaxType] = useState<TaxType>(taxTypeTabOptions[0].id)

  const handleTabChange = (key: Key) => {
    if (key === TaxType.Dzn || key === TaxType.Ko) {
      setSelectedTaxType(key)
    }
  }

  return (
    <>
      <AccountSectionHeader
        title={t('account_section_payment.title')}
        // not the best solution, but for proper one we need to rewrite components in Figma (pages, UserProfileView, HelpSection, IntroSection)
        titleWrapperClassName="pb-0 pt-8 lg:py-0"
        wrapperClassName="lg:pt-14"
      >
        <OfficialCorrespondenceChannelInformation />
        <TaxesFeesTabs
          selectedKey={selectedTaxType}
          onSelectionChange={handleTabChange}
          items={taxTypeTabOptions}
        />
      </AccountSectionHeader>
      <div className="m-auto flex w-full max-w-(--breakpoint-lg) flex-col gap-4 p-4 lg:gap-8 lg:px-0 lg:py-12">
        {!isIdentityVerified &&
          (isInQueue ? (
            <IdentityVerificationBanner variant="verification-in-process" />
          ) : (
            <IdentityVerificationBanner variant="verification-needed" />
          ))}
        {isIdentityVerified &&
          (showChannelNeededBanner ? (
            <OfficialCorrespondenceChannelNeededBanner />
          ) : (
            <div className="flex flex-col gap-4 lg:gap-6">
              {(taxesData[selectedTaxType]?.taxAdministrator || strapiTaxAdministrator) && (
                <TaxesFeesAdministratorCardWrapper
                  taxType={selectedTaxType}
                  beTaxAdministrator={taxesData[selectedTaxType]?.taxAdministrator ?? null}
                  strapiTaxAdministrator={strapiTaxAdministrator}
                />
              )}
              <TaxesFeesOverview taxesData={taxesData[selectedTaxType]} taxType={selectedTaxType} />
            </div>
          ))}
      </div>
    </>
  )
}

export default TaxesFeesSection

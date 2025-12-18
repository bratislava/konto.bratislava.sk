import AccountSectionHeader from 'components/forms/segments/AccountSectionHeader/AccountSectionHeader'
import IdentityVerificationInProcessBanner from 'components/forms/segments/AccountSections/TaxesFees/shared/IdentityVerificationInProcessBanner'
import IdentityVerificationNeededBanner from 'components/forms/segments/AccountSections/TaxesFees/shared/IdentityVerificationNeededBanner'
import OfficialCorrespondenceChannelInformation from 'components/forms/segments/AccountSections/TaxesFees/shared/OfficialCorrespondenceChannelInformation'
import OfficialCorrespondenceChannelNeededBanner from 'components/forms/segments/AccountSections/TaxesFees/shared/OfficialCorrespondenceChannelNeededBanner'
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
 * Figma: https://www.figma.com/design/myxp4iAtBRzxWej3osyzjV/BK--Dane-a-poplatky?node-id=1382-2696&p=f&t=cfC6ztqIUDfRkwYY-0
 * TODO Add new figma link when ready
 */

const TaxesFeesSection = () => {
  const { t } = useTranslation('account')

  const {
    tierStatus: { isIdentityVerificationNotYetAttempted, isInQueue, isIdentityVerified },
  } = useSsrAuth()
  const { channel, showChannelNeededBanner } = useOfficialCorrespondenceChannel()
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
        {channel && <OfficialCorrespondenceChannelInformation />}
        <TaxesFeesTabs
          selectedKey={selectedTaxType}
          onSelectionChange={handleTabChange}
          items={taxTypeTabOptions}
        />
      </AccountSectionHeader>
      <div className="m-auto flex w-full max-w-(--breakpoint-lg) flex-col gap-4 p-4 lg:gap-8 lg:px-0 lg:py-12">
        {(isIdentityVerificationNotYetAttempted || showChannelNeededBanner) &&
          (isIdentityVerified ? (
            <IdentityVerificationNeededBanner />
          ) : (
            <OfficialCorrespondenceChannelNeededBanner />
          ))}
        {isInQueue && <IdentityVerificationInProcessBanner />}
        {isIdentityVerified && !showChannelNeededBanner && (
          <TaxesFeesOverview
            taxesData={taxesData[selectedTaxType]}
            strapiTaxAdministrator={strapiTaxAdministrator}
          />
        )}
      </div>
    </>
  )
}

export default TaxesFeesSection

import { useTranslation } from 'next-i18next/pages'
import { TaxType } from 'openapi-clients/tax'
import { useState } from 'react'
import { Key } from 'react-aria-components/Breadcrumbs'

import SectionContainer from '@/src/components/layouts/SectionContainer'
import { resolveTaxAdministrator } from '@/src/components/page-contents/TaxesPageContent/resolveTaxAdministrator'
import DeliveryMethodInformation from '@/src/components/page-contents/TaxesPageContent/shared/DeliveryMethodInformation'
import DeliveryMethodNeededBanner from '@/src/components/page-contents/TaxesPageContent/shared/DeliveryMethodNeededBanner'
import IdentityVerificationBanner from '@/src/components/page-contents/TaxesPageContent/shared/IdentityVerificationBanner'
import TaxAdministratorCardWrapper from '@/src/components/page-contents/TaxesPageContent/shared/TaxAdministratorCardWrapper'
import TaxesOverview from '@/src/components/page-contents/TaxesPageContent/TaxesPageContent/TaxesOverview/TaxesOverview'
import TaxesPageTabs, {
  TaxesPageTabsProps,
} from '@/src/components/page-contents/TaxesPageContent/TaxesPageContent/TaxesPageTabs'
import { useStrapiTaxAdministrator } from '@/src/components/page-contents/TaxesPageContent/useStrapiTaxAdministrator'
import { useTaxesData } from '@/src/components/page-contents/TaxesPageContent/useTaxesData'
import PageHeader from '@/src/components/segments/PageHeader/PageHeader'
import { useGetDeliveryMethod } from '@/src/frontend/hooks/useDeliveryMethod'
import { useSsrAuth } from '@/src/frontend/hooks/useSsrAuth'

/**
 * Figma: https://www.figma.com/design/0VrrvwWs7n3T8YFzoHe92X/BK--Dizajn--DEV-?node-id=13580-1475&t=fznV5maoQK8a2irI-4
 */

const TaxesPageContent = () => {
  const { t } = useTranslation('account')

  const {
    tierStatus: { isInQueue, isIdentityVerified },
  } = useSsrAuth()
  const { showDeliveryMethodNeededBanner } = useGetDeliveryMethod()
  const taxesData = useTaxesData()
  const strapiTaxAdministrator = useStrapiTaxAdministrator()

  const taxTypeTabOptions: TaxesPageTabsProps['items'] = [
    { title: t('account_section_payment.property_tax_title'), id: TaxType.Dzn },
    { title: t('account_section_payment.communal_waste_fee_title'), id: TaxType.Ko },
  ]

  const [selectedTaxType, setSelectedTaxType] = useState<TaxType>(taxTypeTabOptions[0].id)

  const taxAdministrator = resolveTaxAdministrator({
    taxType: selectedTaxType,
    backendTaxAdministrator: taxesData[selectedTaxType]?.taxAdministrator ?? null,
    strapiTaxAdministrator,
  })

  const handleTabChange = (key: Key) => {
    if (key === TaxType.Dzn || key === TaxType.Ko) {
      setSelectedTaxType(key)
    }
  }

  return (
    <>
      <PageHeader
        title={t('account_section_payment.title')}
        // not the best solution, but for proper one we need to rewrite components in Figma (pages, UserProfileView, HelpSection, IntroSection)
        titleWrapperClassName="pb-0 pt-8 lg:py-0"
        className="lg:pt-14"
      >
        <DeliveryMethodInformation />
        <TaxesPageTabs
          selectedKey={selectedTaxType}
          onSelectionChange={handleTabChange}
          items={taxTypeTabOptions}
        />
      </PageHeader>
      <SectionContainer className="py-4 lg:py-12">
        <div className="flex flex-col gap-4 lg:gap-8">
          {!isIdentityVerified &&
            (isInQueue ? (
              <IdentityVerificationBanner variant="verification-in-process" />
            ) : (
              <IdentityVerificationBanner variant="verification-needed" />
            ))}
          {isIdentityVerified &&
            (showDeliveryMethodNeededBanner ? (
              <DeliveryMethodNeededBanner />
            ) : (
              <div className="flex flex-col gap-4 lg:gap-6">
                <TaxAdministratorCardWrapper
                  taxType={selectedTaxType}
                  taxAdministrator={taxAdministrator}
                />
                <TaxesOverview taxesData={taxesData[selectedTaxType]} taxType={selectedTaxType} />
              </div>
            ))}
        </div>
      </SectionContainer>
    </>
  )
}

export default TaxesPageContent

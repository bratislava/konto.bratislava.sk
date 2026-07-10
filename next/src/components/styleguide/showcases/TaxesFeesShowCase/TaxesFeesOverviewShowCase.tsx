import { useMemo, useState } from 'react'

import TaxesFeesPageContent from '@/src/components/page-contents/TaxesFees/TaxesFeesPageContent/TaxesFeesPageContent'
import { StrapiTaxAdministratorProvider } from '@/src/components/page-contents/TaxesFees/useStrapiTaxAdministrator'
import { TaxesDataProvider } from '@/src/components/page-contents/TaxesFees/useTaxesData'
import { SelectOption } from '@/src/components/widget-components/SelectField/SelectField'
import { Tier } from '@/src/frontend/dtos/accountDto'

import {
  createMockTaxesData,
  createQueryClient,
  deliveryMethodOptions,
  DeliveryMethodScenario,
  MOCK_USER_WITH_DELIVERY_METHOD,
  MOCK_USER_WITHOUT_DELIVERY_METHOD,
  tierOptions,
} from './mockData'
import { ShowcaseLayout, ShowcaseSelectField, TaxShowcaseProviders } from './shared'

type TaxDataScenario = 'available' | 'looking' | 'notOnRecord'

const taxDataOptions: SelectOption[] = [
  { value: 'available', label: 'Available — taxes found' },
  { value: 'looking', label: 'LookingForYourTax' },
  { value: 'notOnRecord', label: 'TaxNotOnRecord' },
]

const TaxesFeesOverviewShowCase = () => {
  const [tier, setTier] = useState<Tier>(Tier.IDENTITY_CARD)
  const [deliveryMethodScenario, setDeliveryMethodScenario] =
    useState<DeliveryMethodScenario>('with')
  const [taxDataScenario, setTaxDataScenario] = useState<TaxDataScenario>('available')

  const queryClient = useMemo(() => {
    const userData =
      deliveryMethodScenario === 'with'
        ? MOCK_USER_WITH_DELIVERY_METHOD
        : MOCK_USER_WITHOUT_DELIVERY_METHOD

    return createQueryClient(userData)
  }, [deliveryMethodScenario])

  const taxesData = useMemo(() => createMockTaxesData(taxDataScenario), [taxDataScenario])

  return (
    <ShowcaseLayout
      controls={
        <>
          <ShowcaseSelectField
            label="Tier / identity status"
            options={tierOptions}
            value={tier}
            onChange={setTier}
          />
          <ShowcaseSelectField
            label="Delivery method"
            options={deliveryMethodOptions}
            value={deliveryMethodScenario}
            onChange={setDeliveryMethodScenario}
          />
          <ShowcaseSelectField
            label="Tax data scenario"
            options={taxDataOptions}
            value={taxDataScenario}
            onChange={setTaxDataScenario}
          />
        </>
      }
    >
      <TaxShowcaseProviders key={deliveryMethodScenario} tier={tier} queryClient={queryClient}>
        <TaxesDataProvider taxesData={taxesData}>
          <StrapiTaxAdministratorProvider strapiTaxAdministrator={null}>
            <div className="bg-background-passive-base">
              <TaxesFeesPageContent />
            </div>
          </StrapiTaxAdministratorProvider>
        </TaxesDataProvider>
      </TaxShowcaseProviders>
    </ShowcaseLayout>
  )
}

export default TaxesFeesOverviewShowCase

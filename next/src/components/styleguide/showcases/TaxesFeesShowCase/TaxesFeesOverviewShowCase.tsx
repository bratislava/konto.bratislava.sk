import { useMemo, useState } from 'react'

import TaxesFeesPageContent from '@/src/components/page-contents/TaxesFees/TaxesFeesPageContent/TaxesFeesPageContent'
import { TaxesFeesProvider } from '@/src/components/page-contents/TaxesFees/useTaxesFees'
import { SelectOption } from '@/src/components/widget-components/SelectField/SelectField'
import { Tier } from '@/src/frontend/dtos/accountDto'

import {
  channelOptions,
  ChannelScenario,
  createMockTaxesData,
  createQueryClient,
  MOCK_USER_WITH_CHANNEL,
  MOCK_USER_WITHOUT_CHANNEL,
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
  const [channelScenario, setChannelScenario] = useState<ChannelScenario>('with')
  const [taxDataScenario, setTaxDataScenario] = useState<TaxDataScenario>('available')

  const queryClient = useMemo(() => {
    const userData = channelScenario === 'with' ? MOCK_USER_WITH_CHANNEL : MOCK_USER_WITHOUT_CHANNEL

    return createQueryClient(userData)
  }, [channelScenario])

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
            label="Official correspondence channel"
            options={channelOptions}
            value={channelScenario}
            onChange={setChannelScenario}
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
      <TaxShowcaseProviders key={channelScenario} tier={tier} queryClient={queryClient}>
        <TaxesFeesProvider taxesData={taxesData} strapiTaxAdministrator={null}>
          <div className="bg-background-passive-base">
            <TaxesFeesPageContent />
          </div>
        </TaxesFeesProvider>
      </TaxShowcaseProviders>
    </ShowcaseLayout>
  )
}

export default TaxesFeesOverviewShowCase

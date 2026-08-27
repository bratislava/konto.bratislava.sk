import { parseAsString, useQueryState } from 'nuqs'
import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components/Tabs'

import SectionContainer from '@/src/components/layouts/SectionContainer'
import TaxesOverviewShowCase from '@/src/components/styleguide/showcases/TaxesShowCase/TaxesOverviewShowCase'
import TaxPageContentShowCase from '@/src/components/styleguide/showcases/TaxesShowCase/TaxPageContentShowCase'
import TaxPaymentPageContentShowCase from '@/src/components/styleguide/showcases/TaxesShowCase/TaxPaymentPageContentShowCase'
import { Wrapper } from '@/src/components/styleguide/Wrapper'

const taxesShowcaseTabs = [
  { id: 'overview', label: 'Overview (TaxesPageContent)' },
  { id: 'detail', label: 'Tax Detail (TaxPageContent)' },
  { id: 'payment', label: 'Payment (TaxPaymentPageContent)' },
] as const

const TaxesShowCase = () => {
  const [selectedKey, setSelectedKey] = useQueryState(
    'taxes-tab',
    parseAsString.withDefault(taxesShowcaseTabs[0].id),
  )

  return (
    <Tabs
      selectedKey={selectedKey}
      onSelectionChange={(value) => setSelectedKey(value.toString())}
      className="flex flex-col"
    >
      <SectionContainer>
        <Wrapper direction="column" title="Taxes Pages (Dane a poplatky)">
          <TabList className="flex flex-wrap gap-2">
            {taxesShowcaseTabs.map(({ id, label }) => (
              <Tab
                key={id}
                id={id}
                className="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 hover:border-gray-500 hover:bg-gray-50 selected:border-gray-700 selected:bg-gray-100 selected:font-semibold"
              >
                {label}
              </Tab>
            ))}
          </TabList>
        </Wrapper>
      </SectionContainer>

      <TabPanel id="overview">
        <TaxesOverviewShowCase />
      </TabPanel>

      <TabPanel id="detail">
        <TaxPageContentShowCase />
      </TabPanel>

      <TabPanel id="payment">
        <TaxPaymentPageContentShowCase />
      </TabPanel>
    </Tabs>
  )
}

export default TaxesShowCase

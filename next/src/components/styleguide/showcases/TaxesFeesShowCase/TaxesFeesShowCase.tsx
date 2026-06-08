import { parseAsString, useQueryState } from 'nuqs'
import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components/Tabs'

import { Wrapper } from '@/src/components/styleguide/Wrapper'

import TaxesFeesOverviewShowCase from './TaxesFeesOverviewShowCase'
import TaxFeeDetailShowCase from './TaxFeeDetailShowCase'
import TaxFeePaymentShowCase from './TaxFeePaymentShowCase'

const taxesFeesShowcaseTabs = [
  { id: 'overview', label: 'Overview (TaxesFeesPageContent)' },
  { id: 'detail', label: 'Tax Detail (TaxFeePageContent)' },
  { id: 'payment', label: 'Payment (TaxFeePaymentPageContent)' },
] as const

const TaxesFeesShowCase = () => {
  const [selectedKey, setSelectedKey] = useQueryState(
    'taxes-tab',
    parseAsString.withDefault(taxesFeesShowcaseTabs[0].id),
  )

  return (
    <Wrapper direction="column" title="Taxes & Fees Pages">
      <Tabs
        selectedKey={selectedKey}
        onSelectionChange={(value) => setSelectedKey(value.toString())}
        className="flex flex-col gap-4"
      >
        <TabList className="flex flex-wrap gap-2">
          {taxesFeesShowcaseTabs.map(({ id, label }) => (
            <Tab
              key={id}
              id={id}
              className="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 hover:border-gray-500 hover:bg-gray-50 selected:border-gray-700 selected:bg-gray-100 selected:font-semibold"
            >
              {label}
            </Tab>
          ))}
        </TabList>

        <TabPanel id="overview">
          <TaxesFeesOverviewShowCase />
        </TabPanel>

        <TabPanel id="detail">
          <TaxFeeDetailShowCase />
        </TabPanel>

        <TabPanel id="payment">
          <TaxFeePaymentShowCase />
        </TabPanel>
      </Tabs>
    </Wrapper>
  )
}

export default TaxesFeesShowCase

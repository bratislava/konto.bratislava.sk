import { parseAsString, useQueryState } from 'nuqs'
import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components/Tabs'

import FormSentPageContentShowCase from '@/src/components/styleguide/showcases/FormSentPageContentShowCase'
import PaymentResultPageContentShowCase from '@/src/components/styleguide/showcases/PaymentResultPageContentShowCase'
import { Wrapper } from '@/src/components/styleguide/Wrapper'

const showcaseTabs = [
  { id: 'form', label: 'Form send', component: <FormSentPageContentShowCase /> },
  { id: 'payment', label: 'Payment result', component: <PaymentResultPageContentShowCase /> },
] as const

const ThankYouTileShowCase = () => {
  const [selectedKey, setSelectedKey] = useQueryState(
    'thank-you-type',
    parseAsString.withDefault(showcaseTabs[0].id),
  )

  return (
    <Wrapper title="ThankYou Tiles" direction="column">
      <Tabs
        selectedKey={selectedKey}
        onSelectionChange={(value) => setSelectedKey(value.toString())}
        className="flex flex-col gap-4"
      >
        <TabList className="flex flex-wrap gap-2">
          {showcaseTabs.map(({ id, label }) => (
            <Tab
              key={id}
              id={id}
              className="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 hover:border-gray-500 hover:bg-gray-50 selected:border-gray-700 selected:bg-gray-100 selected:font-semibold"
            >
              {label}
            </Tab>
          ))}
        </TabList>

        {showcaseTabs.map(({ id, component }) => (
          <TabPanel key={id} id={id}>
            {component}
          </TabPanel>
        ))}
      </Tabs>
    </Wrapper>
  )
}

export default ThankYouTileShowCase

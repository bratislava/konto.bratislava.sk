import { parseAsString, useQueryState } from 'nuqs'
import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components/Tabs'

import SectionContainer from '@/src/components/layouts/SectionContainer'
import { Wrapper } from '@/src/components/styleguide/Wrapper'

import MyApplicationDetailShowCase from './MyApplicationDetailShowCase'
import MyApplicationsListShowCase from './MyApplicationsListShowCase'

const myApplicationsShowcaseTabs = [
  { id: 'list', label: 'List (MyApplicationsPageContent)' },
  { id: 'detail', label: 'Detail (MyApplicationDetails)' },
] as const

const MyApplicationsShowCase = () => {
  const [selectedKey, setSelectedKey] = useQueryState(
    'my-applications-tab',
    parseAsString.withDefault(myApplicationsShowcaseTabs[0].id),
  )

  return (
    <Tabs
      selectedKey={selectedKey}
      onSelectionChange={(value) => setSelectedKey(value.toString())}
      className="flex flex-col"
    >
      <SectionContainer>
        <Wrapper direction="column" title="My Applications Pages">
          <TabList className="flex flex-wrap gap-2">
            {myApplicationsShowcaseTabs.map(({ id, label }) => (
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

      <TabPanel id="list">
        <MyApplicationsListShowCase />
      </TabPanel>

      <TabPanel id="detail">
        <MyApplicationDetailShowCase />
      </TabPanel>
    </Tabs>
  )
}

export default MyApplicationsShowCase

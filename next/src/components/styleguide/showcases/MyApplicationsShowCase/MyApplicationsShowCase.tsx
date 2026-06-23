import { parseAsString, useQueryState } from 'nuqs'
import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components/Tabs'

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
    <Wrapper direction="column" title="My Applications Pages">
      <Tabs
        selectedKey={selectedKey}
        onSelectionChange={(value) => setSelectedKey(value.toString())}
        className="flex flex-col gap-4"
      >
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

        <TabPanel id="list">
          <MyApplicationsListShowCase />
        </TabPanel>

        <TabPanel id="detail">
          <MyApplicationDetailShowCase />
        </TabPanel>
      </Tabs>
    </Wrapper>
  )
}

export default MyApplicationsShowCase

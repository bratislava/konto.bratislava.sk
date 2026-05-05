import { parseAsString, useQueryState } from 'nuqs'
import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components/Tabs'

import AccountMarkdown from '@/src/components/formatting/AccountMarkdown'
import FormMarkdown from '@/src/components/formatting/FormMarkdown/FormMarkdown'
import Markdown from '@/src/components/formatting/Markdown'
import { Stack } from '@/src/components/styleguide/Stack'
import { styleguideMarkdownMock } from '@/src/components/styleguide/utils/styleguideMarkdownMock'

import { Wrapper } from '../Wrapper'

const markdownShowcaseTabs = [
  {
    id: 'markdown',
    label: 'Markdown',
    panel: (
      <Stack className="grid items-start lg:grid-cols-4">
        <Markdown content={`variant: small ${styleguideMarkdownMock}`} variant="small" />
        <Markdown content={`variant: large ${styleguideMarkdownMock}`} variant="large" />
        <Markdown content={`variant: accordion ${styleguideMarkdownMock}`} variant="accordion" />
        <Markdown content={`variant: default ${styleguideMarkdownMock}`} />
      </Stack>
    ),
  },
  {
    id: 'account-markdown',
    label: 'AccountMarkdown',
    panel: (
      <Stack className="grid items-start lg:grid-cols-3">
        <AccountMarkdown content={`variant: small ${styleguideMarkdownMock}`} variant="sm" />
        <AccountMarkdown
          content={`variant: statusBar ${styleguideMarkdownMock}`}
          variant="statusBar"
        />
        <AccountMarkdown content={`variant: normal ${styleguideMarkdownMock}`} />
      </Stack>
    ),
  },
  {
    id: 'form-markdown',
    label: 'FormMarkdown',
    panel: <FormMarkdown>{styleguideMarkdownMock}</FormMarkdown>,
  },
] as const

const MarkdownShowCase = () => {
  const [selectedKey, setSelectedKey] = useQueryState(
    'markdown-component',
    parseAsString.withDefault(markdownShowcaseTabs[0].id),
  )

  const validKey = markdownShowcaseTabs.some((t) => t.id === selectedKey)
    ? selectedKey
    : markdownShowcaseTabs[0].id

  return (
    <Wrapper direction="column" title="Markdown">
      <Tabs
        selectedKey={validKey}
        onSelectionChange={(value) => setSelectedKey(value.toString())}
        className="flex flex-col gap-4"
      >
        <TabList className="flex flex-wrap gap-2">
          {markdownShowcaseTabs.map(({ id, label }) => (
            <Tab
              key={id}
              id={id}
              className="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 hover:border-gray-500 hover:bg-gray-50 selected:border-gray-700 selected:bg-gray-100 selected:font-semibold"
            >
              {label}
            </Tab>
          ))}
        </TabList>
        {markdownShowcaseTabs.map(({ id, panel }) => (
          <TabPanel key={id} id={id}>
            {panel}
          </TabPanel>
        ))}
      </Tabs>
    </Wrapper>
  )
}

export default MarkdownShowCase

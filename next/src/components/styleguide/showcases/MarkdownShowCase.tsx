/* eslint-disable i18next/no-literal-string */
import { Typography } from '@bratislava/component-library'
import { parseAsString, useQueryState } from 'nuqs'
import { useState } from 'react'
import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components/Tabs'

import Checkbox from '@/src/components/fields/Checkbox'
import FormMarkdown from '@/src/components/formatting/FormMarkdown/FormMarkdown'
import Markdown, { MarkdownProps } from '@/src/components/formatting/Markdown'
import { Stack } from '@/src/components/styleguide/Stack'
import { styleguideMarkdownContent } from '@/src/components/styleguide/utils/styleguideMarkdownContent'
import cn from '@/src/utils/cn'

import { Wrapper } from '../Wrapper'

const markdownShowcaseTabs = [
  { id: 'markdown', label: 'Markdown' },
  { id: 'form-markdown', label: 'FormMarkdown' },
] as const

const markdownVariants: { id: string; label: string; variant?: MarkdownProps['variant'] }[] = [
  { id: 'small', label: 'Small', variant: 'small' },
  { id: 'large', label: 'Large', variant: 'large' },
  { id: 'accordion', label: 'Accordion', variant: 'accordion' },
  { id: 'default', label: 'Default', variant: 'default' },
]

const MarkdownShowCase = () => {
  const [selectedKey, setSelectedKey] = useQueryState(
    'markdown-component',
    parseAsString.withDefault(markdownShowcaseTabs[0].id),
  )
  const [selectedVariants, setSelectedVariants] = useState(markdownVariants.map((v) => v.id))

  const visibleVariants = markdownVariants.filter(({ id }) => selectedVariants.includes(id))

  return (
    <Wrapper direction="column" title="Markdown">
      <Tabs
        selectedKey={selectedKey}
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
        <TabPanel id="markdown">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-3">
              <Typography variant="p-small" className="text-gray-700">
                Variant:
              </Typography>
              {markdownVariants.map(({ id, label }) => (
                <Checkbox
                  key={id}
                  isSelected={selectedVariants.includes(id)}
                  onChange={(checked) =>
                    setSelectedVariants((prev) =>
                      checked ? [...prev, id] : prev.filter((v) => v !== id),
                    )
                  }
                  className="w-fit"
                >
                  {label}
                </Checkbox>
              ))}
            </div>
            <Stack
              className={cn('grid items-start', {
                'lg:grid-cols-1': visibleVariants.length === 1,
                'lg:grid-cols-2': visibleVariants.length === 2,
                'lg:grid-cols-3': visibleVariants.length === 3,
                'lg:grid-cols-4': visibleVariants.length >= 4,
              })}
            >
              {visibleVariants.map(({ id, variant }) => (
                <Markdown
                  key={id}
                  content={`variant: ${variant} ${styleguideMarkdownContent}`}
                  variant={variant}
                />
              ))}
            </Stack>
          </div>
        </TabPanel>
        <TabPanel id="form-markdown">
          <FormMarkdown>{styleguideMarkdownContent}</FormMarkdown>
        </TabPanel>
      </Tabs>
    </Wrapper>
  )
}

export default MarkdownShowCase

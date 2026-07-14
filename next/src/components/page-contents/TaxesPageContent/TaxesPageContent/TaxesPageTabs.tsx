import { TaxType } from 'openapi-clients/tax'
import { Tab, TabList, Tabs, TabsProps } from 'react-aria-components/Tabs'

import cn from '@/src/utils/cn'

type TaxesPageTabsOptions = {
  title: string
  id: TaxType
}[]

export type TaxesPageTabsProps = Pick<TabsProps, 'selectedKey' | 'onSelectionChange'> & {
  items: TaxesPageTabsOptions
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19551-21069&m=dev
 * Based on RAC Tabs https://react-spectrum.adobe.com/react-aria/Tabs.html
 *
 * TODO Unify with other Tabs usages
 */

const TaxesPageTabs = ({ selectedKey, onSelectionChange, items }: TaxesPageTabsProps) => {
  return (
    <Tabs selectedKey={selectedKey} onSelectionChange={onSelectionChange} className="flex flex-col">
      <TabList className="scrollbar-hide flex gap-4 overflow-auto whitespace-nowrap lg:gap-6">
        {items.map((item) => {
          return (
            <Tab
              key={item.id}
              id={item.id}
              data-before-text={item.title}
              className={cn(
                'cursor-pointer p-4 text-center text-size-p-large lg:px-0 lg:text-size-p-large',
                'hover:border-gray-700 hover:font-semibold',
                'selected:border-b-2 selected:border-gray-700 selected:font-semibold',
                // Hover without layout shift based on: https://stackoverflow.com/a/20249560
                'before:invisible before:block before:h-0 before:overflow-hidden before:font-semibold before:content-[attr(data-before-text)]',
              )}
            >
              {item.title}
            </Tab>
          )
        })}
      </TabList>
    </Tabs>
  )
}

export default TaxesPageTabs

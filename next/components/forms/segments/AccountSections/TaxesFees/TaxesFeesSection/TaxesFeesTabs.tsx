import cn from 'frontend/cn'
import { TaxType } from 'openapi-clients/tax'
import React from 'react'
import { Tab, TabList, Tabs, TabsProps } from 'react-aria-components'

export type TaxTypeTabOptions = {
  title: string
  id: TaxType
}[]

type Props = Pick<TabsProps, 'selectedKey' | 'onSelectionChange'> & {
  items: TaxTypeTabOptions
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19551-21069&m=dev
 * Based on RAC Tabs https://react-spectrum.adobe.com/react-aria/Tabs.html
 *
 * TODO Unify with other Tabs usages
 */

const TaxesFeesTabs = ({ selectedKey, onSelectionChange, items }: Props) => {
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
                'cursor-pointer px-4 py-4 text-center text-20 lg:px-0',
                'hover:border-gray-700 hover:text-20-semibold',
                'data-selected:border-b-2 data-selected:border-gray-700 data-selected:text-20-semibold',
                // Hover without layout shift based on: https://stackoverflow.com/a/20249560
                'before:invisible before:block before:h-0 before:overflow-hidden before:text-20-semibold before:content-[attr(data-before-text)]',
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

export default TaxesFeesTabs

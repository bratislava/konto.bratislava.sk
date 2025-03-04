import { ChevronDownIcon } from '@assets/ui-icons'
import { ReactNode } from 'react'

export type AccordionV2Props = {
  title: string | ReactNode | null | undefined
  noTitleWrapper?: boolean
  children?: ReactNode
}

/**
 * Figma: https://www.figma.com/file/17wbd0MDQcMW9NbXl6UPs8/DS-ESBS%3A-Component-library?node-id=819-1909&t=CkadtTtIKVOlB7Sz-0
 * Adopted from: https://github.com/bratislava/bratislava.sk/blob/master/next/components/ui/AccordionV2/AccordionV2.tsx
 */
const AccordionV2 = ({ title, noTitleWrapper, children }: AccordionV2Props) => {
  const renderTitle = () => {
    if (noTitleWrapper) {
      return <>{title}</>
    }
    return <h3 className="text-h4 min-w-0 grow font-semibold">{title}</h3>
  }

  return (
    <details className="group flex w-full flex-col rounded-xl border-2 border-gray-200 bg-white open:border-gray-700 hover:border-gray-500 open:hover:border-gray-700">
      <summary className="flex cursor-pointer items-center gap-4 p-4 text-left group-open:pb-2 lg:px-8 lg:py-6 lg:group-open:pb-4">
        {renderTitle()}
        <span className="shrink-0" aria-hidden>
          <ChevronDownIcon className="size-6 text-category-700 transition-transform group-open:rotate-180 lg:size-8" />
        </span>
      </summary>

      <div className="mx-4 mb-4 lg:mx-8 lg:mb-6">{children}</div>
    </details>
  )
}

export default AccordionV2

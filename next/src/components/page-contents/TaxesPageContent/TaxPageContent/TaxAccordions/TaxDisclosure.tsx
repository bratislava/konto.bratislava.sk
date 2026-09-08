import { Typography } from '@bratislava/component-library'
import { PropsWithChildren } from 'react'

import Disclosure from '@/src/components/simple-components/Disclosure/Disclosure'
import DisclosureHeader from '@/src/components/simple-components/Disclosure/DisclosureHeader'
import DisclosurePanel from '@/src/components/simple-components/Disclosure/DisclosurePanel'

export type TaxDisclosureProps = PropsWithChildren<{
  title: string
  secondTitle?: string
}>

/**
 * Single tax disclosure item, used both in DznAccordionContent and KoAccordionContent.
 */

const TaxDisclosure = ({ title, secondTitle, children }: TaxDisclosureProps) => {
  return (
    <Disclosure className="w-full">
      <DisclosureHeader className="py-2 lg:py-3">
        <div className="flex w-full justify-between pr-4">
          <Typography variant="h5">{title}</Typography>

          <Typography variant="h5" as="span" className="font-semibold">
            {secondTitle}
          </Typography>
        </div>
      </DisclosureHeader>

      <DisclosurePanel>
        <div className="flex size-full flex-col gap-6">{children}</div>
      </DisclosurePanel>
    </Disclosure>
  )
}

export default TaxDisclosure

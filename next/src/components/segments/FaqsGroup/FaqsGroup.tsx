import { Typography } from '@bratislava/component-library'
import { Fragment } from 'react'

import AccountMarkdown from '@/src/components/formatting/AccountMarkdown'
import Disclosure from '@/src/components/simple-components/Disclosure/Disclosure'
import DisclosureGroup from '@/src/components/simple-components/Disclosure/DisclosureGroup'
import DisclosureHeader from '@/src/components/simple-components/Disclosure/DisclosureHeader'
import DisclosurePanel from '@/src/components/simple-components/Disclosure/DisclosurePanel'
import HorizontalDivider from '@/src/components/simple-components/HorizontalDivider'
import { isDefined } from '@/src/frontend/utils/general'
import { AccordionTitleLevel } from '@/src/utils/getCardTitleLevel'

type Faq = {
  title: string
  content: string
}

export type FaqsGroupProps = {
  faqs?: Faq[]
  accordionTitleLevel?: AccordionTitleLevel
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=16846-52391&t=fTPL7wUUSn8SXVWH-4
 * Based on bratislava.sk: https://github.com/bratislava/bratislava.sk/blob/master/next/src/components/common/FaqsGroup/FaqsGroup.tsx
 */

const FaqsGroup = ({ faqs, accordionTitleLevel = 'h2' }: FaqsGroupProps) => {
  return (
    <DisclosureGroup className="border-border-active-default bg-background-passive-base rounded-lg border py-2">
      {faqs?.filter(isDefined).map((faq, index) => (
        <Fragment key={index}>
          {index > 0 ? <HorizontalDivider className="mx-4 lg:mx-6" /> : null}
          <Disclosure id={`disclosure-faq-${index}`}>
            <DisclosureHeader className="p-4 ring-inset lg:px-6">
              <Typography
                variant="h5"
                as={accordionTitleLevel}
                // TODO handle font style properly through correct css variables
                className="text-[1rem] font-semibold leading-5 lg:text-[1.25rem] lg:leading-7"
              >
                {faq.title}
              </Typography>
            </DisclosureHeader>
            <DisclosurePanel className="px-4 lg:px-6">
              <AccountMarkdown content={faq.content} />
            </DisclosurePanel>
          </Disclosure>
        </Fragment>
      ))}
    </DisclosureGroup>
  )
}

export default FaqsGroup

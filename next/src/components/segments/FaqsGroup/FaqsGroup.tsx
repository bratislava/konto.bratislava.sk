import { Typography } from '@bratislava/component-library'

import Markdown from '@/src/components/formatting/Markdown'
import Disclosure from '@/src/components/simple-components/Disclosure/Disclosure'
import DisclosureGroup from '@/src/components/simple-components/Disclosure/DisclosureGroup'
import DisclosureHeader from '@/src/components/simple-components/Disclosure/DisclosureHeader'
import DisclosurePanel from '@/src/components/simple-components/Disclosure/DisclosurePanel'
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
    <DisclosureGroup>
      {faqs?.filter(isDefined).map((faq, index) => (
        <Disclosure key={index} id={`disclosure-faq-${index}`}>
          <DisclosureHeader>
            <Typography variant="h5" as={accordionTitleLevel}>
              {faq.title}
            </Typography>
          </DisclosureHeader>

          <DisclosurePanel>
            <Markdown variant="accordion" content={faq.content} />
          </DisclosurePanel>
        </Disclosure>
      ))}
    </DisclosureGroup>
  )
}

export default FaqsGroup

import FaqDisclosure, { Faq } from '@/src/components/segments/FaqDisclosure/FaqDisclosure'
import DisclosureGroup from '@/src/components/simple-components/Disclosure/DisclosureGroup'
import { isDefined } from '@/src/frontend/utils/general'
import { AccordionTitleLevel } from '@/src/utils/getCardTitleLevel'

export type FaqsGroupProps = {
  faqs?: Faq[]
  accordionTitleLevel?: AccordionTitleLevel
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=16846-52391&t=fTPL7wUUSn8SXVWH-4
 * Based on bratislava.sk: https://github.com/bratislava/bratislava.sk/blob/master/next/src/components/sections/FaqsSection/FaqsGroup.tsx
 */

const FaqsGroup = ({ faqs, accordionTitleLevel = 'h2' }: FaqsGroupProps) => {
  return (
    <DisclosureGroup>
      {faqs?.filter(isDefined).map((faq, index) => (
        <FaqDisclosure
          key={index}
          id={`disclosure-faq-${index}`}
          faq={faq}
          accordionTitleLevel={accordionTitleLevel}
        />
      ))}
    </DisclosureGroup>
  )
}

export default FaqsGroup

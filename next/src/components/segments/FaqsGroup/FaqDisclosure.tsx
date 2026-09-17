import { Typography } from '@bratislava/component-library'

import Markdown from '@/src/components/formatting/Markdown'
import Disclosure from '@/src/components/simple-components/Disclosure/Disclosure'
import DisclosureHeader from '@/src/components/simple-components/Disclosure/DisclosureHeader'
import DisclosurePanel from '@/src/components/simple-components/Disclosure/DisclosurePanel'
import { DisclosureTitleLevel } from '@/src/utils/getCardTitleLevel'

export type Faq = {
  title: string
  content: string
}

export type FaqDisclosureProps = {
  faq: Faq
  id: string
  disclosureTitleLevel?: DisclosureTitleLevel
}

/**
 * Single faq disclosure item, used in FaqsGroup.
 *
 * Based on bratislava.sk: https://github.com/bratislava/bratislava.sk/blob/master/next/src/components/sections/FaqsSection/FaqDisclosure.tsx
 */

const FaqDisclosure = ({ faq, id, disclosureTitleLevel = 'h2' }: FaqDisclosureProps) => {
  return (
    <Disclosure id={id}>
      <DisclosureHeader>
        <Typography variant="h5" as={disclosureTitleLevel}>
          {faq.title}
        </Typography>
      </DisclosureHeader>

      <DisclosurePanel>
        <Markdown variant="accordion" content={faq.content} />
      </DisclosurePanel>
    </Disclosure>
  )
}

export default FaqDisclosure

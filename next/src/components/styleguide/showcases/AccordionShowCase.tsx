import { Typography } from '@bratislava/component-library'

import Markdown from '@/src/components/formatting/Markdown'
import Disclosure from '@/src/components/simple-components/Disclosure/Disclosure'
import DisclosureGroup from '@/src/components/simple-components/Disclosure/DisclosureGroup'
import DisclosureHeader from '@/src/components/simple-components/Disclosure/DisclosureHeader'
import DisclosurePanel from '@/src/components/simple-components/Disclosure/DisclosurePanel'
import { styleguideMarkdownContent } from '@/src/components/styleguide/utils/styleguideMarkdownContent'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const AccordionShowCase = () => {
  return (
    <Wrapper direction="column" title="Accordion">
      <Stack direction="column">
        <DisclosureGroup>
          <Disclosure>
            <DisclosureHeader>
              <Typography variant="h4">Accordion</Typography>
            </DisclosureHeader>

            <DisclosurePanel>
              <Markdown variant="accordion" content={styleguideMarkdownContent} />
            </DisclosurePanel>
          </Disclosure>
        </DisclosureGroup>
      </Stack>
    </Wrapper>
  )
}

export default AccordionShowCase

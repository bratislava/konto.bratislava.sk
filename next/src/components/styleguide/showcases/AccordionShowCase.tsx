import Markdown from '@/src/components/formatting/Markdown'
import AccordionV2 from '@/src/components/simple-components/AccordionV2'
import { styleguideMarkdownMock } from '@/src/components/styleguide/utils/styleguideMarkdownMock'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const AccordionShowCase = () => {
  return (
    <Wrapper direction="column" title="Accordion">
      <Stack direction="column">
        <AccordionV2 title="Accordion">
          <Markdown variant="accordion" content={styleguideMarkdownMock} />
        </AccordionV2>
      </Stack>
    </Wrapper>
  )
}

export default AccordionShowCase

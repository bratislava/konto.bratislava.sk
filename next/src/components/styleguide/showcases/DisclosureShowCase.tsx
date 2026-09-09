import { Typography } from '@bratislava/component-library'

import Markdown from '@/src/components/formatting/Markdown'
import FaqDisclosure from '@/src/components/segments/FaqsGroup/FaqDisclosure'
import Disclosure from '@/src/components/simple-components/Disclosure/Disclosure'
import DisclosureGroup from '@/src/components/simple-components/Disclosure/DisclosureGroup'
import DisclosureHeader from '@/src/components/simple-components/Disclosure/DisclosureHeader'
import DisclosurePanel from '@/src/components/simple-components/Disclosure/DisclosurePanel'
import { styleguideMarkdownContent } from '@/src/components/styleguide/utils/styleguideMarkdownContent'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const items = [
  { title: 'First disclosure', content: styleguideMarkdownContent },
  { title: 'Second disclosure', content: styleguideMarkdownContent },
  { title: 'Third disclosure', content: styleguideMarkdownContent },
]

const DisclosureShowCase = () => {
  return (
    <Wrapper direction="column" title="Disclosure">
      <Stack direction="column">
        <Typography variant="h5">Standalone disclosure (variant boxed - default)</Typography>
        <Disclosure className="w-full">
          <DisclosureHeader>
            <Typography variant="h4" as="h3">
              Disclosure title
            </Typography>
          </DisclosureHeader>

          <DisclosurePanel>
            <Markdown variant="accordion" content={styleguideMarkdownContent} />
          </DisclosurePanel>
        </Disclosure>
      </Stack>

      <Stack direction="column">
        <Typography variant="h5">Disclosure group (variant boxed)</Typography>
        <DisclosureGroup className="w-full">
          {items.map((item, index) => (
            <Disclosure key={index} id={`disclosure-${index}`}>
              <DisclosureHeader>
                <Typography variant="h5" as="h3">
                  {item.title}
                </Typography>
              </DisclosureHeader>

              <DisclosurePanel>
                <Markdown variant="accordion" content={item.content} />
              </DisclosurePanel>
            </Disclosure>
          ))}
        </DisclosureGroup>
      </Stack>

      <Stack direction="column">
        <Typography variant="h5">Standalone disclosure (variant unstyled)</Typography>
        <Disclosure variant="unstyled" className="w-full">
          <DisclosureHeader>
            <Typography variant="h5" as="h3">
              Unstyled disclosure
            </Typography>
          </DisclosureHeader>

          <DisclosurePanel>
            <Markdown variant="accordion" content={styleguideMarkdownContent} />
          </DisclosurePanel>
        </Disclosure>
      </Stack>

      <Stack direction="column">
        <Typography variant="h5">FaqDisclosure</Typography>
        <DisclosureGroup className="w-full">
          {items.map((item, index) => (
            <FaqDisclosure
              key={index}
              id={`disclosure-faq-${index}`}
              faq={item}
              disclosureTitleLevel="h3"
            />
          ))}
        </DisclosureGroup>
      </Stack>
    </Wrapper>
  )
}

export default DisclosureShowCase

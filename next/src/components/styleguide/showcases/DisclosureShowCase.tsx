import { Typography } from '@bratislava/component-library'
import { Fragment } from 'react'

import Markdown from '@/src/components/formatting/Markdown'
import Disclosure from '@/src/components/simple-components/Disclosure/Disclosure'
import DisclosureGroup from '@/src/components/simple-components/Disclosure/DisclosureGroup'
import DisclosureHeader from '@/src/components/simple-components/Disclosure/DisclosureHeader'
import DisclosurePanel from '@/src/components/simple-components/Disclosure/DisclosurePanel'
import HorizontalDivider from '@/src/components/simple-components/HorizontalDivider'
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
        <Typography variant="h5">Single disclosure</Typography>
        <DisclosureGroup className="w-full rounded-lg border border-border-active-default bg-background-passive-base py-2">
          <Disclosure>
            <DisclosureHeader className="p-4 ring-inset lg:px-6">
              <Typography variant="h4" as="h3">
                Disclosure title
              </Typography>
            </DisclosureHeader>

            <DisclosurePanel className="px-4 lg:px-6">
              <Markdown variant="accordion" content={styleguideMarkdownContent} />
            </DisclosurePanel>
          </Disclosure>
        </DisclosureGroup>
      </Stack>

      <Stack direction="column">
        <Typography variant="h5">Disclosure group</Typography>
        <DisclosureGroup className="w-full rounded-lg border border-border-active-default bg-background-passive-base py-2">
          {items.map((item, index) => (
            <Fragment key={index}>
              {index > 0 ? <HorizontalDivider className="mx-4 lg:mx-6" /> : null}
              <Disclosure id={`disclosure-${index}`}>
                <DisclosureHeader className="p-4 ring-inset lg:px-6">
                  <Typography variant="h5" as="h3">
                    {item.title}
                  </Typography>
                </DisclosureHeader>

                <DisclosurePanel className="px-4 lg:px-6">
                  <Markdown variant="accordion" content={item.content} />
                </DisclosurePanel>
              </Disclosure>
            </Fragment>
          ))}
        </DisclosureGroup>
      </Stack>
    </Wrapper>
  )
}

export default DisclosureShowCase

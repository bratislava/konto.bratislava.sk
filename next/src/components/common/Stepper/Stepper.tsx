import { Typography } from '@bratislava/component-library'
import { Fragment } from 'react'

import { StepperSectionFragment } from '@/src/clients/graphql-strapi/api'
import { Checklist } from '@/src/components/common/Stepper/Checklist'
import Markdown from '@/src/components/formatting/Markdown'
import SectionHeader from '@/src/components/layouts/SectionHeader'
import Disclosure from '@/src/components/simple-components/Disclosure/Disclosure'
import DisclosureGroup from '@/src/components/simple-components/Disclosure/DisclosureGroup'
import DisclosureHeader from '@/src/components/simple-components/Disclosure/DisclosureHeader'
import DisclosurePanel from '@/src/components/simple-components/Disclosure/DisclosurePanel'
import HorizontalDivider from '@/src/components/simple-components/HorizontalDivider'
import { isDefined } from '@/src/frontend/utils/general'

type Props = {
  section: StepperSectionFragment
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=16846-14458&t=FB9MA6UJV5t84NVu-4
 *        https://www.figma.com/design/0VrrvwWs7n3T8YFzoHe92X/BK--Dizajn--DEV-?node-id=15560-17717&m=dev
 */

const IndexIcon = ({ index }: { index: number }) => {
  return (
    <div className="flex size-10 items-center justify-center rounded-full bg-background-passive-inverted-base">
      <Typography
        variant="p-small"
        as="span"
        className="font-bold text-content-passive-inverted-primary"
      >
        {index + 1}
      </Typography>
    </div>
  )
}

export const Stepper = ({ section: { title, description, checklists } }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      <SectionHeader title={title} text={description} asRichtext />

      <DisclosureGroup
        defaultExpandedKeys={['disclosure-0']}
        className="rounded-lg border border-border-active-default bg-background-passive-base py-2"
      >
        {checklists?.filter(isDefined).map((checklist, index) => (
          <Fragment key={index}>
            {index > 0 ? <HorizontalDivider className="mx-4 lg:mx-6" /> : null}

            <Disclosure id={`disclosure-${index}`}>
              <DisclosureHeader className="p-4 ring-inset lg:px-6">
                <div className="flex flex-row gap-3 lg:gap-4">
                  <IndexIcon index={index} />

                  <Typography variant="h4" className="mt-1.5">
                    {checklist.title}
                  </Typography>
                </div>
              </DisclosureHeader>

              <DisclosurePanel className="px-4 lg:ml-14 lg:px-6">
                <div className="flex flex-col gap-6">
                  <Markdown variant="default" content={checklist.description} />

                  <Checklist checklistItems={checklist.checklistItems?.filter(isDefined)} />
                </div>
              </DisclosurePanel>
            </Disclosure>
          </Fragment>
        ))}
      </DisclosureGroup>
    </div>
  )
}

import { Typography } from '@bratislava/component-library'
import { Fragment } from 'react'

import { StepperSectionFragment } from '@/src/clients/graphql-strapi/api'
import { Checklist } from '@/src/components/common/Stepper/Checklist'
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
 */

const IndexIcon = ({ index }: { index: number }) => {
  return (
    <div className="flex size-10 items-center justify-center rounded-full bg-black">
      <Typography variant="p-small" as="span" className="font-bold text-white">
        {index + 1}
      </Typography>
    </div>
  )
}

export const Stepper = ({ section }: Props) => {
  const { title, description, checklists } = section

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader title={title} text={description} />

      <DisclosureGroup className="rounded-lg border border-border-active-default bg-background-passive-base py-2">
        {checklists?.filter(isDefined).map((checklist, index) => (
          <Fragment key={`fragment-checklist-${index}`}>
            {index > 0 ? <HorizontalDivider className="mx-4 lg:mx-6" /> : null}

            <Disclosure id={`disclosure-faq-${index}`}>
              <DisclosureHeader className="p-4 ring-inset lg:px-6">
                <div className="flex flex-row gap-4">
                  <IndexIcon index={index} />

                  <Typography variant="h3">{checklist.title}</Typography>
                </div>
              </DisclosureHeader>

              <DisclosurePanel className="ml-14 px-4 lg:px-6">
                <Checklist
                  description={checklist.description}
                  checklistItems={checklist.checklistItems?.filter(isDefined)}
                />
              </DisclosurePanel>
            </Disclosure>
          </Fragment>
        ))}
      </DisclosureGroup>
    </div>
  )
}

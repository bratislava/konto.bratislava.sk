import { Typography } from '@bratislava/component-library'
import { Fragment } from 'react'

import { StepperSectionFragment } from '@/src/clients/graphql-strapi/api'
import { Checklist } from '@/src/components/page-contents/Stepper/Checklist'
import Disclosure from '@/src/components/simple-components/Disclosure/Disclosure'
import DisclosureGroup from '@/src/components/simple-components/Disclosure/DisclosureGroup'
import DisclosureHeader from '@/src/components/simple-components/Disclosure/DisclosureHeader'
import DisclosurePanel from '@/src/components/simple-components/Disclosure/DisclosurePanel'
import HorizontalDivider from '@/src/components/simple-components/HorizontalDivider'
import { isDefined } from '@/src/frontend/utils/general'

type Props = {
  section: StepperSectionFragment
}

export const Stepper = ({ section }: Props) => {
  const { title, description, checklists } = section

  const NumberedOrderComponent = ({ order }: { order: number }) => {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-black font-bold text-white"
        style={{ height: '40px', width: '40px', fontSize: '16px' }}
      >
        {order + 1}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Typography variant="h2">{title}</Typography>

      <Typography variant="p-default">{description}</Typography>

      <DisclosureGroup className="rounded-lg border border-border-active-default bg-background-passive-base py-2">
        {checklists?.filter(isDefined).map((checklist, index) => (
          <Fragment key={`fragment-checklist-${index}`}>
            {index > 0 ? <HorizontalDivider className="mx-4 lg:mx-6" /> : null}
            <Disclosure id={`disclosure-faq-${index}`}>
              <DisclosureHeader className="p-4 ring-inset lg:px-6">
                <div className="flex flex-row gap-4">
                  <NumberedOrderComponent order={index} />

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

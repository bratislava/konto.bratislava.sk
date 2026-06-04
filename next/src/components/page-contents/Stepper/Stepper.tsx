import { Typography } from '@bratislava/component-library'

import { StepperSectionFragment } from '@/src/clients/graphql-strapi/api'
import { Checklist } from '@/src/components/page-contents/Stepper/Checklist'
import { isDefined } from '@/src/frontend/utils/general'

type Props = {
  section: StepperSectionFragment
}

export const Stepper = ({ section }: Props) => {
  const { title, description, checklists } = section

  return (
    <div className="flex flex-col gap-2">
      <Typography variant="h2" className="font-bold">
        {title}
      </Typography>

      <Typography variant="p-default">{description}</Typography>

      <div className="flex flex-col gap-2 rounded-xl border border-gray-200 px-5 py-6">
        {checklists?.filter(isDefined).map((checklist, index) => (
          <>
            <Checklist
              key={`checklist-${index}`}
              title={checklist.title}
              description={checklist.description}
              checklistItems={checklist.checklistItems?.filter(isDefined)}
              order={index + 1}
            />

            {index !== checklists.length - 1 && <div className="h-px w-full bg-gray-200" />}
          </>
        ))}
      </div>
    </div>
  )
}

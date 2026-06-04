import { StepperFragment } from '@/src/clients/graphql-strapi/api'
import { Checklist } from '@/src/components/page-contents/Stepper/Checklist'
import { isDefined } from '@/src/frontend/utils/general'

type Props = {
  section: StepperFragment
}

export const Stepper = ({ section }: Props) => {
  const { title, description, checklists } = section

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-size-h2 font-bold">{title}</h2>

      <p className="text-size-p-large">{description}</p>

      <div className="flex flex-col gap-2">
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

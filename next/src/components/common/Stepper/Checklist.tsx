import { ChecklistItem, ChecklistItemProps } from '@/src/components/common/Stepper/ChecklistItem'

type Props = {
  checklistItems?: ChecklistItemProps[] | null
}

export const Checklist = ({ checklistItems }: Props) => {
  return (
    <div className="flex flex-col gap-5">
      <ul className="list-inside list-disc space-y-5">
        {checklistItems?.map((item, index) => (
          <ChecklistItem key={index} {...item} />
        ))}
      </ul>
    </div>
  )
}

import { ChecklistItem, ChecklistItemProps } from '@/src/components/common/Stepper/ChecklistItem'

type Props = {
  checklistItems?: ChecklistItemProps[] | null
}

export const Checklist = ({ checklistItems }: Props) => {
  return (
    <ul className="list-inside list-disc space-y-5">
      {checklistItems?.map((item, index) => (
        <ChecklistItem key={index} {...item} />
      ))}
    </ul>
  )
}

import ChecklistItem, { ChecklistItemProps } from '@/src/components/common/StepByStep/ChecklistItem'

type Props = {
  checklistItems?: ChecklistItemProps[] | null
}

const Checklist = ({ checklistItems }: Props) => {
  if (!checklistItems || checklistItems.length === 0) {
    return null
  }

  return (
    <ul className="list-inside list-disc space-y-5">
      {checklistItems?.map((item, index) => (
        <ChecklistItem key={index} {...item} />
      ))}
    </ul>
  )
}

export default Checklist

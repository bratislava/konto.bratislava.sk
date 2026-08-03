import ChecklistItem, { ChecklistItemProps } from '@/src/components/common/StepByStep/ChecklistItem'

type Props = {
  checklistItems: ChecklistItemProps[]
}

const Checklist = ({ checklistItems }: Props) => {
  if (!checklistItems.length) {
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

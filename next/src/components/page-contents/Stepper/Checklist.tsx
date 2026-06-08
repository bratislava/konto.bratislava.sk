import Markdown from '@/src/components/formatting/Markdown'
import {
  ChecklistItem,
  ChecklistItemProps,
} from '@/src/components/page-contents/Stepper/ChecklistItem'

export type ChecklistProps = {
  description?: string | null
  checklistItems?: ChecklistItemProps[] | null
}
export const Checklist = ({ description, checklistItems }: ChecklistProps) => {
  return (
    <div className="flex flex-col gap-5">
      <Markdown variant="default" content={description} />

      {checklistItems?.map((item, index) => (
        <ChecklistItem key={`checklist-item-${index}`} {...item} />
      ))}
    </div>
  )
}

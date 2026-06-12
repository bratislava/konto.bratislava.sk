import { ChecklistItem, ChecklistItemProps } from '@/src/components/common/Stepper/ChecklistItem'
import Markdown from '@/src/components/formatting/Markdown'

type Props = {
  description?: string | null
  checklistItems?: ChecklistItemProps[] | null
}

export const Checklist = ({ description, checklistItems }: Props) => {
  return (
    <div className="flex flex-col gap-5">
      <Markdown variant="default" content={description} />

      <ul className="list-inside list-disc">
        {checklistItems?.map((item, index) => (
          <ChecklistItem key={index} {...item} />
        ))}
      </ul>
    </div>
  )
}

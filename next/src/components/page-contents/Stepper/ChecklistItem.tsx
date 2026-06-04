import { CheckInCircleIcon } from '@/src/assets/ui-icons'

export type ChecklistItemProps = {
  title?: string | null
  content?: string | null
}

export const ChecklistItem = ({ title, content }: ChecklistItemProps) => {
  return (
    <div className="flex flex-row gap-2">
      <CheckInCircleIcon className="size-6 text-gray-0" />

      <div className="flex flex-col gap-2">
        <h3 className="text-size-p-large font-bold">{title}</h3>

        <div className="text-size-p-large">{content}</div>
      </div>
    </div>
  )
}

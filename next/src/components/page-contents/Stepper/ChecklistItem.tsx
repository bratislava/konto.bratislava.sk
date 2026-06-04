import { Typography } from '@bratislava/component-library'

import { CheckInCircleIcon } from '@/src/assets/ui-icons'

export type ChecklistItemProps = {
  title?: string | null
  content?: string | null
}

export const ChecklistItem = ({ title, content }: ChecklistItemProps) => {
  return (
    <div className="flex flex-row gap-2">
      <CheckInCircleIcon className="size-6 text-black" />

      <div className="flex flex-col gap-2">
        <Typography variant="h4" className="font-bold">
          {title}
        </Typography>

        <Typography variant="p-default">{content}</Typography>
      </div>
    </div>
  )
}

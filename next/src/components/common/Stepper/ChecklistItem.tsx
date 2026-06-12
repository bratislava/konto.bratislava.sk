import { Typography } from '@bratislava/component-library'

import { CheckInCircleIcon } from '@/src/assets/ui-icons'
import Markdown from '@/src/components/formatting/Markdown'

export type ChecklistItemProps = {
  title?: string | null
  content?: string | null
}

export const ChecklistItem = ({ title, content }: ChecklistItemProps) => {
  return (
    <div className="flex flex-row items-start gap-4">
      <CheckInCircleIcon className="mt-0.5 size-6 shrink-0 text-content-passive-secondary" />

      <div className="flex flex-col gap-1">
        <Typography variant="p-default" className="font-medium">
          {title}
        </Typography>

        <Markdown variant="small" content={content} />
      </div>
    </div>
  )
}

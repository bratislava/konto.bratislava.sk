import { Typography } from '@bratislava/component-library'

import { CheckInCircleIcon } from '@/src/assets/ui-icons'
import Markdown from '@/src/components/formatting/Markdown'

export type ChecklistItemProps = {
  title?: string | null
  content?: string | null
}

export const ChecklistItem = ({ title, content }: ChecklistItemProps) => {
  return (
    <div className="flex flex-row items-start gap-2">
      <CheckInCircleIcon className="mt-0.5 size-6 shrink-0 text-black" />

      <div className="flex flex-col gap-2">
        <Typography variant="h4" className="font-bold">
          {title}
        </Typography>

        <Markdown variant="default" content={content} />
      </div>
    </div>
  )
}

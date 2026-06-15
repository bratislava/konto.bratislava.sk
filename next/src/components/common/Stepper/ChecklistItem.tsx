import { Typography } from '@bratislava/component-library'

import Markdown from '@/src/components/formatting/Markdown'
import Icon from '@/src/components/icon-components/Icon'

export type ChecklistItemProps = {
  title?: string | null
  content?: string | null
}

export const ChecklistItem = ({ title, content }: ChecklistItemProps) => {
  return (
    <div className="flex flex-row items-start gap-4">
      <Icon name="check-circle" className="size-6 shrink-0 text-content-passive-secondary" />

      <div className="flex flex-col gap-1">
        <Typography variant="p-default">{title}</Typography>

        <Markdown variant="small" content={content} />
      </div>
    </div>
  )
}

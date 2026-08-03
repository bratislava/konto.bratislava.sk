import { Typography } from '@bratislava/component-library'

import Markdown from '@/src/components/formatting/Markdown'
import Icon from '@/src/components/icon-components/Icon'

export type ChecklistItemProps = {
  title?: string | null
  content?: string | null
}

const ChecklistItem = ({ title, content }: ChecklistItemProps) => {
  return (
    <li className="flex flex-row items-start gap-4">
      <Icon
        name="check-circle"
        // Added custom lg:mt-0.5 to align the icon with the text vertically
        className="size-6 shrink-0 text-content-passive-secondary lg:mt-0.5"
      />

      <div className="flex flex-col gap-1">
        <Typography variant="p-default" className="font-medium">
          {title}
        </Typography>

        <Markdown variant="small" content={content} />
      </div>
    </li>
  )
}

export default ChecklistItem

import { Typography } from '@bratislava/component-library'

import Markdown from '@/src/components/formatting/Markdown'
import cn from '@/src/utils/cn'

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=16846-53650&t=3bAQNX1OVCIBqvlg-4
 */

export type LabelValueRowProps = {
  variant?: 'align-value-right'
  label: string
  value: string
  valueAsMarkdown?: boolean
  className?: string
}

const LabelValueRow = ({
  variant,
  label,
  value,
  valueAsMarkdown,
  className,
}: LabelValueRowProps) => {
  return (
    <div
      className={cn(
        'grid gap-2 py-3.5 text-content-passive-secondary lg:grid-cols-2 lg:gap-4 lg:py-4',
        className,
      )}
    >
      <Typography variant="p-small" className="font-semibold">
        {label}
      </Typography>
      {valueAsMarkdown ? (
        <Markdown
          variant="small"
          content={value}
          className={cn({
            'text-right': variant === 'align-value-right',
          })}
        />
      ) : (
        <Typography
          variant="p-small"
          className={cn({
            'text-right': variant === 'align-value-right',
          })}
        >
          {value}
        </Typography>
      )}
    </div>
  )
}

export default LabelValueRow

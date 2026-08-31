import { Typography } from '@bratislava/component-library'

import cn from '@/src/utils/cn'

type Props = {
  variant?: 'default' | 'warning' | 'success' | 'error'
  size?: 'small' | 'large'
  text: string
  shorthand?: boolean
}

const MAX_SHORTHAND_TEXT_LENGTH = 10

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=16846-13191&m=dev
 * TODO align with design system
 */

const Tag = ({ variant = 'default', text, shorthand, size = 'small' }: Props) => {
  const textToRender = shorthand
    ? `${text.slice(0, MAX_SHORTHAND_TEXT_LENGTH)}${text.length > MAX_SHORTHAND_TEXT_LENGTH ? '...' : ''}`
    : text

  return (
    <div
      className={cn(
        'flex items-center rounded-sm px-2 py-0.5',
        { 'py-1': size === 'large' },
        'bg-background-passive-secondary text-content-passive-secondary',
        {
          'bg-background-success-soft-default text-content-success-default': variant === 'success',
          'bg-background-warning-soft-default text-content-warning-default': variant === 'warning',
          'bg-background-error-soft-default text-content-error-default': variant === 'error',
        },
      )}
    >
      <Typography variant="p-small" className="inline-block cursor-default select-none">
        {textToRender}
      </Typography>
    </div>
  )
}

export default Tag

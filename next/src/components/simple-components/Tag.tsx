import { Button, Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { FC, useState } from 'react'

import { CrossIcon } from '@/src/assets/ui-icons'
import cn from '@/src/utils/cn'

interface TagProps {
  text: string
  removable?: boolean
  size?: 'large' | 'small'
  branded?: boolean
  shorthand?: boolean
  onRemove?: () => void
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=16846-13191&m=dev
 * TODO align with design system
 */

const Tag: FC<TagProps> = ({ text, removable, size, branded, shorthand, onRemove }: TagProps) => {
  const { t } = useTranslation('account')

  // STATE
  const [isHovered, setIsHovered] = useState<boolean>(false)

  // STYLES
  const classStyles = cn('flex h-5 min-w-14 items-center gap-2.5 px-2 text-center', {
    'text-size-p-small-r lg:text-size-p-small': size === 'large',
    'text-size-p-tiny-r lg:text-size-p-tiny': size === 'small' || !size,
    'py-0.5': size === 'large',
    'rounded-lg': size === 'large',
    rounded: size === 'small' || !size,
    'bg-gray-100': removable || !branded,
    'text-gray-700': (removable || !branded) && !isHovered,
    'text-gray-600': removable && isHovered,
    'bg-category-200': !removable && branded,
    'text-category-800': !removable && branded,
    underline: !removable && isHovered,
  })

  const iconClassStyles = cn({
    'size-3 text-size-p-small-r lg:text-size-p-small': size === 'large',
    'size-2.5 text-size-p-tiny-r lg:text-size-p-tiny': size === 'small' || !size,
  })

  const MAX_TEXT_SIZE = 10
  const tagText = shorthand
    ? `${text.slice(0, MAX_TEXT_SIZE)}${text.length > MAX_TEXT_SIZE ? '...' : ''}`
    : text

  // RENDER
  /* class name tag is crucial for good working of select dropdown */
  return (
    <div
      className={classStyles}
      onMouseOver={() => setIsHovered(true)}
      onFocus={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Typography className="inline-block cursor-default select-none">{tagText}</Typography>
      {removable && (
        // TODO implement correct variant and larger clickable area
        <Button
          icon={<CrossIcon className={iconClassStyles} />}
          onPress={onRemove}
          aria-label={t('Tag.remove_button.aria')}
          className="shrink-0"
        />
      )}
    </div>
  )
}

export default Tag

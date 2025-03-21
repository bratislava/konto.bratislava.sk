import { CrossIcon } from '@assets/ui-icons'
import { FC, useState } from 'react'

import cn from '../../../frontend/cn'

interface TagProps {
  text: string
  removable?: boolean
  size?: 'large' | 'small'
  branded?: boolean
  shorthand?: boolean
  onRemove?: () => void
}

const Tag: FC<TagProps> = ({ text, removable, size, branded, shorthand, onRemove }: TagProps) => {
  // STATE
  const [isHovered, setIsHovered] = useState<boolean>(false)

  // STYLES
  const classStyles = cn(
    'tag align-items-center flex h-5 min-w-14 items-center gap-2.5 px-2 text-center',
    {
      'text-16': size === 'large',
      'text-p3': size === 'small' || !size,
      'py-0.5': size === 'large',
      'rounded-lg': size === 'large',
      rounded: size === 'small' || !size,
      'bg-gray-100': removable || !branded,
      'text-gray-700': (removable || !branded) && !isHovered,
      'text-gray-600': removable && isHovered,
      'bg-category-200': !removable && branded,
      'text-category-800': !removable && branded,
      underline: !removable && isHovered,
    },
  )

  const iconClassStyles = cn('tag mx-1 inline-block cursor-pointer self-center', {
    'h-3 w-3 text-16': size === 'large',
    'h-2.5 w-2.5 text-p3': size === 'small' || !size,
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
      <p className="tag inline-block cursor-default select-none">{tagText}</p>
      {removable && <CrossIcon className={iconClassStyles} onClick={onRemove} />}
    </div>
  )
}

export default Tag

import CloseIcon from '@assets/images/new-icons/ui/cross.svg'
import cx from 'classnames'
import { FC, useState } from 'react'

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
  const classStyles = cx(
    'tag align-items-center min-w-14 flex items-center h-5 inline-block px-2 gap-2.5 text-center',
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

  const iconClassStyles = cx('tag cursor-pointer self-center inline-block mx-1', {
    'text-16 w-3 h-3': size === 'large',
    'text-p3 w-2.5 h-2.5': size === 'small' || !size,
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
      <p className="tag cursor-default select-none inline-block">{tagText}</p>
      {removable && <CloseIcon className={iconClassStyles} onClick={onRemove} />}
    </div>
  )
}

export default Tag

import { CheckIcon } from '@/assets/ui-icons'
import cn from '@/frontend/cn'

interface SelectCheckboxProps {
  checked?: boolean
  className?: string
}

const CheckboxIcon = ({ checked, className }: SelectCheckboxProps) => {
  // STYLES
  const checkboxClassName = cn(
    'flex h-6 w-6 flex-col justify-center rounded-sm',
    {
      'bg-gray-700': checked,
      'border-2 border-gray-600': !checked,
    },
    className,
  )

  const iconClassName = cn('m-auto h-5 w-5 text-gray-0', {
    dropdown: className && className.split(' ').includes('dropdown'),
  })

  // RENDER
  return (
    <div className={checkboxClassName}>{checked && <CheckIcon className={iconClassName} />}</div>
  )
}

export default CheckboxIcon

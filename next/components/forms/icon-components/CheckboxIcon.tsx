import { CheckIcon } from '@assets/ui-icons'
import cx from 'classnames'

interface SelectCheckboxProps {
  checked?: boolean
  className?: string
}

const CheckboxIcon = ({ checked, className }: SelectCheckboxProps) => {
  // STYLES
  const checkboxClassName = cx(
    'rounded w-6 h-6 flex flex-col justify-center',
    {
      'bg-gray-700': checked,
      'border-2 border-gray-600': !checked,
    },
    className,
  )

  const iconClassName = cx('m-auto text-gray-0 w-5 h-5', {
    dropdown: className && className.split(' ').includes('dropdown'),
  })

  // RENDER
  return (
    <div className={checkboxClassName}>{checked && <CheckIcon className={iconClassName} />}</div>
  )
}

export default CheckboxIcon

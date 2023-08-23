import { CheckIcon } from '@assets/ui-icons'
import cx from 'classnames'

interface SelectCheckboxProps {
  checked?: boolean
  className?: string
}

const CheckboxIcon = ({ checked, className }: SelectCheckboxProps) => {
  // STYLES
  const checkboxClassName = cx(
    'flex h-6 w-6 flex-col justify-center rounded',
    {
      'bg-gray-700': checked,
      'border-2 border-gray-600': !checked,
    },
    className,
  )

  const iconClassName = cx('m-auto h-5 w-5 text-gray-0', {
    dropdown: className && className.split(' ').includes('dropdown'),
  })

  // RENDER
  return (
    <div className={checkboxClassName}>{checked && <CheckIcon className={iconClassName} />}</div>
  )
}

export default CheckboxIcon

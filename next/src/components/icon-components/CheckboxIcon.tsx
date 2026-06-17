import Icon from '@/src/components/icon-components/Icon'
import cn from '@/src/utils/cn'

interface SelectCheckboxProps {
  checked?: boolean
  className?: string
}

const CheckboxIcon = ({ checked, className }: SelectCheckboxProps) => {
  // STYLES
  const checkboxClassName = cn(
    'flex size-6 flex-col justify-center rounded-sm',
    {
      'bg-gray-700': checked,
      'border-2 border-gray-600': !checked,
    },
    className,
  )

  const iconClassName = cn('m-auto size-5 text-gray-0', {
    dropdown: className && className.split(' ').includes('dropdown'),
  })

  // RENDER
  return (
    <div className={checkboxClassName}>
      {checked && <Icon name="check" className={iconClassName} />}
    </div>
  )
}

export default CheckboxIcon

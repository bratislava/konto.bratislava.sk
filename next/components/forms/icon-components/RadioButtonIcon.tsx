import cn from '@/frontend/cn'

interface RadioButtonIconProps {
  selected?: boolean
  className?: string
}

const RadioButtonIcon = ({ selected, className }: RadioButtonIconProps) => {
  const radioButtonClassName = cn(
    'justify-align flex h-6 w-6 flex-col rounded-full border-2 border-gray-800',
    className,
  )

  return (
    <div className={radioButtonClassName}>
      {selected && <div className="m-auto size-4 rounded-full bg-gray-800" />}
    </div>
  )
}

export default RadioButtonIcon

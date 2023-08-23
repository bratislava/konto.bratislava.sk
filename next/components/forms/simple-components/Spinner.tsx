import cx from 'classnames'

type SpinnerBase = {
  size?: 'lg' | 'md' | 'sm'
  variant?: 'black' | 'gray' | 'category' | 'negative'
  className?: string
}

const Spinner = ({ size = 'md', variant = 'black', className }: SpinnerBase) => {
  const style = cx(
    'animate-spin rounded-[50%] border-solid',
    {
      'border-category-400 border-t-gray-50': variant === 'category',
      'border-gray-400 border-t-gray-50': variant === 'gray',
      'border-gray-700 border-t-gray-300': variant === 'black',
      'border-negative-400 border-t-gray-50': variant === 'negative',
    },
    className,
    {
      'h-5 w-5 border-2 border-t-2': size === 'sm',
      'h-8 w-8 border-3 border-t-3': size === 'md',
      'h-12 w-12 border-4 border-t-4': size === 'lg',
    },
  )
  return <div className={style} />
}

export default Spinner

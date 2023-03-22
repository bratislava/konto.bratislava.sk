import cx from 'classnames'

type SpinnerBase = {
  size?: 'lg' | 'md' | 'sm'
  variant?: 'black' | 'gray' | 'category' | 'negative'
  className?: string
}

const Spinner = ({ size = 'md', variant = 'black', className }: SpinnerBase) => {
  const style = cx(
    'rounded-[50%] animate-spin border-solid',
    {
      'border-category-400 border-t-gray-50': variant === 'category',
      'border-gray-400 border-t-gray-50': variant === 'gray',
      'border-gray-700 border-t-gray-300': variant === 'black',
      'border-negative-400 border-t-gray-50': variant === 'negative',
    },
    className,
    {
      'w-5 h-5 border-2 border-t-2': size === 'sm',
      'w-8 h-8 border-3 border-t-3': size === 'md',
      'w-12 h-12 border-4 border-t-4': size === 'lg',
    },
  )
  return <div className={style} />
}

export default Spinner

import cx from 'classnames'
import React, { ReactNode } from 'react'

interface ButtonProps {
  icon?: ReactNode
  buttonTrigger?: ReactNode
  className?: string
  buttonVariant: 'gray' | 'main' | 'none'
  isOpen: boolean
  buttonSize?: 'sm' | 'lg'
}

const MenuTrigger = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const {
    icon,
    className,
    buttonTrigger,
    buttonVariant,
    isOpen,
    buttonSize = 'sm',
    ...rest
  } = props

  return (
    <button
      type="button"
      ref={ref}
      {...rest}
      className={cx(
        'flex justify-center items-center focus:outline-none',
        {
          'w-10 h-10 rounded-lg border-2 border-gray-200 bg-transparent text-gray-700 focus:border-gray-300 focus:text-gray-800':
            buttonVariant === 'gray',
          'text-gray-800 border-gray-300': isOpen && buttonVariant === 'gray',
        },
        {
          'w-10 h-10 rounded-lg border-2 border-main-700 bg-transparent text-gray-700 focus:border-main-800 focus:text-gray-800':
            buttonVariant === 'main',
          'text-gray-800 border-main-800': isOpen && buttonVariant === 'main',
        },
        {
          '': buttonVariant === 'none',
        },
        { 'w-12 h-12': buttonSize === 'lg' },
      )}
    >
      {buttonTrigger}
    </button>
  )
})

export default MenuTrigger

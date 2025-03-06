import { useObjectRef } from '@react-aria/utils'
import { PressEvent } from '@react-types/shared'
import cn from 'frontend/cn'
import { forwardRef, ReactNode } from 'react'
import { useButton } from 'react-aria'

type PaginationButtonBase = {
  variant?: 'pagination-selected' | 'pagination'
  type?: 'button' | 'arrow'
  disabled?: boolean
  children: ReactNode
  onPress: (event: PressEvent) => void
}

const PaginationButton = forwardRef<HTMLButtonElement, PaginationButtonBase>(
  ({ type, variant = 'pagination', children, disabled, onPress }, forwardedRef) => {
    const ref = useObjectRef(forwardedRef)
    const { buttonProps } = useButton(
      {
        elementType: 'button',
        isDisabled: disabled,
        onPress,
      },
      ref,
    )
    return (
      <button
        type="button"
        ref={ref}
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full outline-hidden md:h-12 md:w-12',
          {
            'border-2 text-gray-700 hover:border-gray-700': variant === 'pagination',
            'border-2 border-gray-700 bg-gray-700 text-white': variant === 'pagination-selected',
            'border-none': type === 'arrow',
          },
        )}
        {...buttonProps}
      >
        <span className="text-p2-semibold">{children}</span>
      </button>
    )
  },
)
export default PaginationButton

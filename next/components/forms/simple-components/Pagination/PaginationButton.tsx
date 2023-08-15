import { PressEvent } from '@react-types/shared'
import cx from 'classnames'
import { forwardRef, ReactNode, RefObject } from 'react'
import { useButton } from 'react-aria'

type PaginationButtonBase = {
  variant?: 'pagination-selected' | 'pagination'
  type?: 'button' | 'arrow'
  disabled?: boolean
  children: ReactNode
  onPress: (event: PressEvent) => void
}

const PaginationButton = forwardRef<HTMLButtonElement, PaginationButtonBase>(
  ({ type, variant = 'pagination', children, disabled, onPress }, ref) => {
    const { buttonProps } = useButton(
      {
        elementType: 'button',
        isDisabled: disabled,
        onPress,
      },
      ref as RefObject<HTMLButtonElement>,
    )
    return (
      <button
        type="button"
        ref={ref as RefObject<HTMLButtonElement>}
        className={cx(
          'flex h-10 w-10 items-center justify-center rounded-full outline-none md:h-12 md:w-12',
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

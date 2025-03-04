import { useObjectRef } from '@react-aria/utils'
import { AriaButtonProps } from '@react-types/button'
import React from 'react'
import { mergeProps, useButton, useFocusRing } from 'react-aria'

interface ButtonProps extends AriaButtonProps {
  isPressed: boolean
}

const MenuButton = React.forwardRef<HTMLButtonElement, ButtonProps>((props, forwardedRef) => {
  const ref = useObjectRef(forwardedRef)
  const { buttonProps } = useButton(props, ref)
  const { focusProps } = useFocusRing()
  const { children } = props

  return (
    <button
      type="button"
      {...mergeProps(buttonProps, focusProps)}
      ref={ref}
      className="focus:outline-hidden relative flex cursor-pointer items-center"
    >
      {children}
    </button>
  )
})

export default MenuButton

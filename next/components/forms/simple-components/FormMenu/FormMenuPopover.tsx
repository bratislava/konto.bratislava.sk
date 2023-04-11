import type { AriaPopoverProps } from '@react-aria/overlays'
import { DismissButton, Overlay, usePopover } from '@react-aria/overlays'
import * as React from 'react'
import { RefObject, useRef } from 'react'
import { FocusScope, mergeProps } from 'react-aria'
import type { OverlayTriggerState } from 'react-stately'

interface PopoverProps extends Omit<AriaPopoverProps, 'popoverRef'> {
  children: React.ReactNode
  state: OverlayTriggerState
  className?: string
  popoverRef?: React.RefObject<HTMLDivElement>
}

const FormMenuPopover = (props: PopoverProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const { popoverRef = ref, state, children, className } = props

  const { popoverProps } = usePopover(
    {
      ...props,
      popoverRef,
    },
    state,
  )

  return (
    <Overlay>
      <div
        {...popoverProps}
        ref={popoverRef}
        className={`z-10 shadow-md bg-white rounded-lg ${className}`}
      >
        {/* <DismissButton onDismiss={state.close} /> */}
        {children}
        <DismissButton onDismiss={state.close} />
      </div>
    </Overlay>
  )
}

export default FormMenuPopover

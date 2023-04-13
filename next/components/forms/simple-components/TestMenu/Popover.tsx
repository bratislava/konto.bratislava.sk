import type { AriaPopoverProps } from '@react-aria/overlays'
import { DismissButton, Overlay, usePopover } from '@react-aria/overlays'
import * as React from 'react'
import type { OverlayTriggerState } from 'react-stately'

interface PopoverProps extends Omit<AriaPopoverProps, 'popoverRef'> {
  children: React.ReactNode
  state: OverlayTriggerState
}

export const Popover = (props: PopoverProps) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const { state, children } = props

  const { popoverProps, underlayProps } = usePopover(
    {
      ...props,
      popoverRef: ref,
    },
    state,
  )

  return (
    <Overlay>
      <div {...underlayProps} className="fixed inset-0" />
      <div
        {...popoverProps}
        ref={ref}
        className="z-10 shadow-lg border border-gray-300 bg-white rounded-md mt-2"
      >
        <DismissButton onDismiss={state.open} />
        {children}
        <DismissButton onDismiss={state.open} />
      </div>
    </Overlay>
  )
}

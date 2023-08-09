import { CrossIcon } from '@assets/ui-icons'
import React, { PropsWithChildren } from 'react'
import { useIsSSR } from 'react-aria'
import {
  Button as AriaButton,
  Dialog,
  Modal,
  ModalOverlay,
  ModalOverlayProps,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'

export type ModalV2Props = PropsWithChildren<ModalOverlayProps> & {
  modalClassname?: string
  mobileFullScreen?: boolean
}

// WIP
// TODO: Examine why focus trap doesn't work.
const ModalV2 = ({ children, modalClassname, mobileFullScreen, ...rest }: ModalV2Props) => {
  const isSSR = useIsSSR()

  // `ReferenceError: window is not defined` in server environment
  // TODO: Examine
  if (isSSR) {
    return null
  }

  return (
    <ModalOverlay
      className="fixed left-0 top-0 z-50 flex h-[var(--visual-viewport-height)] w-screen items-center justify-center bg-gray-800/40"
      {...rest}
    >
      <Modal
        {...rest}
        className={twMerge(
          'relative overflow-auto bg-gray-0 px-4 outline-0 md:mx-4 md:h-min md:max-h-full md:max-w-[592px] md:rounded-2xl md:p-6',
          mobileFullScreen
            ? 'mx-0 h-full w-full max-w-none rounded-none p-4 pt-12'
            : 'mx-4 h-min max-h-full w-full rounded-xl pb-4 pt-6',
          modalClassname,
        )}
      >
        {/* TODO: Examine why onClose is needed. */}
        <Dialog className="outline-0" onClose={() => rest?.onOpenChange?.(false)}>
          {({ close }) => (
            <>
              <AriaButton
                className="absolute right-3 top-3 cursor-pointer  md:right-4 md:top-4"
                onPress={close}
              >
                <CrossIcon className="h-6 w-6" />
              </AriaButton>
              {children}
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}

export default ModalV2

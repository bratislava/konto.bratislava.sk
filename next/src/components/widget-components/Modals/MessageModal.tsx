import { PropsWithChildren, ReactNode } from 'react'
import { Heading } from 'react-aria-components/Heading'

import Icon from '@/src/components/icon-components/Icon'
import Dialog from '@/src/components/simple-components/Dialog'
import Modal, { ModalProps } from '@/src/components/simple-components/Modal'
import cn from '@/src/utils/cn'

export type MessageModalProps = PropsWithChildren<{
  type: 'warning' | 'info' | 'error' | 'success'
  title: string
  primaryButton?: ReactNode
  secondaryButton?: ReactNode
  noCloseButton?: boolean
}> &
  Pick<ModalProps, 'isOpen' | 'onOpenChange' | 'isDismissable' | 'mobileFullScreen' | 'dataCy'>

// TODO: remove these
const icons = {
  error: <Icon name="error" className="text-(--color-negative-700)" />,
  info: <Icon name="info" className="text-(--color-gray-700)" />,
  warning: <Icon name="warning" className="text-(--color-warning-700)" />,
  success: <Icon name="check-circle" className="text-(--color-success-700)" />,
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19823-40590
 */

const MessageModal = ({
  type,
  children,
  title,
  primaryButton,
  secondaryButton,
  noCloseButton,
  ...rest
}: MessageModalProps) => {
  return (
    <Modal isDismissable {...rest}>
      <Dialog noCloseButton={noCloseButton}>
        <div className="flex flex-col items-center gap-4 lg:gap-6">
          <div
            className={cn('rounded-full p-4 *:size-6', {
              'bg-background-passive-secondary': type === 'info',
              'bg-background-warning-soft-default': type === 'warning',
              'bg-background-error-soft-default': type === 'error',
              'bg-background-success-soft-default': type === 'success',
            })}
          >
            {icons[type]}
          </div>
          <div className="flex w-full flex-col gap-5 lg:gap-6">
            <div className="flex flex-col gap-2">
              {/* Accessible heading */}
              <Heading
                slot="title"
                className="w-full text-center text-size-h5-r font-semibold lg:text-size-h5"
              >
                {title}
              </Heading>
              <div className="flex w-full flex-col gap-4 text-center text-size-p-small-r whitespace-pre-wrap lg:text-size-p-small">
                {children}
              </div>
            </div>
            <div className="flex flex-col-reverse gap-3 *:w-full empty:hidden lg:flex-row">
              {secondaryButton}
              {primaryButton}
            </div>
          </div>
        </div>
      </Dialog>
    </Modal>
  )
}

export default MessageModal

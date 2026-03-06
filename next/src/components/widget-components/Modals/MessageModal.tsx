import React, { PropsWithChildren, ReactNode } from 'react'

import ErrorIcon from '@/src/components/icon-components/ErrorIcon'
import InfoIcon from '@/src/components/icon-components/InfoIcon'
import SuccessIcon from '@/src/components/icon-components/SuccessIcon'
import WarningIcon from '@/src/components/icon-components/WarningIcon'
import Modal, { ModalProps } from '@/src/components/simple-components/Modal'
import cn from '@/src/utils/cn'

export type MessageModalProps = PropsWithChildren<{
  type: 'warning' | 'info' | 'error' | 'success'
  title: string
  primaryButton?: ReactNode
  secondaryButton?: ReactNode
}> &
  Pick<
    ModalProps,
    'isOpen' | 'onOpenChange' | 'isDismissable' | 'noCloseButton' | 'mobileFullScreen' | 'dataCy'
  >

const icons = {
  error: <ErrorIcon />,
  info: <InfoIcon />,
  warning: <WarningIcon />,
  success: <SuccessIcon />,
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
  ...rest
}: MessageModalProps) => {
  return (
    <Modal isDismissable {...rest}>
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
            <div className="w-full text-center text-h5 font-semibold">{title}</div>
            <div className="flex w-full flex-col gap-4 text-center text-p2 text-p-base whitespace-pre-wrap">
              {children}
            </div>
          </div>
          <div className="flex flex-col-reverse gap-3 *:w-full empty:hidden lg:flex-row">
            {secondaryButton}
            {primaryButton}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default MessageModal

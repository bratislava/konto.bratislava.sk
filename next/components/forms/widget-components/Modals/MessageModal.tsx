import React, { Fragment, PropsWithChildren, ReactNode } from 'react'

import ErrorIcon from '@/components/forms/icon-components/ErrorIcon'
import InfoIcon from '@/components/forms/icon-components/InfoIcon'
import SuccessIcon from '@/components/forms/icon-components/SuccessIcon'
import WarningIcon from '@/components/forms/icon-components/WarningIcon'
import Modal, { ModalProps } from '@/components/forms/simple-components/Modal'
import cn from '@/frontend/cn'

export type MessageModalProps = PropsWithChildren<{
  type: 'warning' | 'info' | 'error' | 'success'
  variant?: 'horizontal' | 'vertical'
  buttonsAlign?: 'left' | 'center' | 'right'
  title: string
  buttons?: ReactNode[]
  afterContent?: ReactNode
  titleClassName?: string
  childrenClassName?: string
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

const MessageModal = ({
  type,
  variant = 'horizontal',
  buttonsAlign = 'right',
  children,
  title,
  buttons,
  afterContent,
  titleClassName,
  childrenClassName,
  ...rest
}: MessageModalProps) => {
  return (
    <Modal isDismissable {...rest}>
      <div
        className={cn('flex items-center gap-3 p-0 md:gap-5', {
          'flex-col': variant === 'vertical',
          'md:grid-row-2 flex-col md:grid md:grid-cols-[3.5rem] md:flex-row md:items-start':
            variant === 'horizontal',
        })}
      >
        <div
          className={cn(
            'relative flex flex-row items-start gap-2 rounded-full p-4 md:col-start-1 md:col-end-1 md:row-start-1 md:row-end-2',
            {
              'bg-gray-100': type === 'info',
              'bg-warning-100': type === 'warning',
              'bg-negative-100': type === 'error',
              'bg-success-100': type === 'success',
            },
          )}
        >
          <div className="flex size-6 items-center justify-center">
            <span className="">{icons[type]}</span>
          </div>
        </div>
        <div
          className={cn(
            'flex h-14 items-center text-center text-h-base font-semibold md:col-start-2 md:col-end-3 md:row-start-1 md:row-end-1 md:text-left',
            titleClassName,
          )}
        >
          {title}
        </div>
        <div className="md:col-start-2 md:col-end-3 md:row-start-2 md:row-end-3">
          <div
            className={cn(
              'text-center text-p2 whitespace-pre-wrap md:text-left',
              childrenClassName,
            )}
          >
            {children}
          </div>
          {buttons && buttons.length > 0 && (
            <div
              className={cn('order-1 mt-6 flex flex-wrap items-center gap-6 p-0', {
                'flex-col-reverse justify-center md:flex-row md:justify-end':
                  buttonsAlign === 'right',
                'flex-col-reverse justify-center md:flex-row md:justify-start':
                  buttonsAlign === 'left',
                'flex-row justify-center': buttonsAlign === 'center',
              })}
            >
              {buttons.map((button, index) => (
                <Fragment key={index}>{button}</Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      {afterContent}
    </Modal>
  )
}

export default MessageModal

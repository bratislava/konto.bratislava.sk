import cx from 'classnames'
import React, { Fragment, PropsWithChildren, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

import ErrorIcon from '../../icon-components/ErrorIcon'
import InfoIcon from '../../icon-components/InfoIcon'
import SuccessIcon from '../../icon-components/SuccessIcon'
import WarningIcon from '../../icon-components/WarningIcon'
import ModalV2, { ModalV2Props } from '../../simple-components/ModalV2'

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
  Pick<ModalV2Props, 'isOpen' | 'onOpenChange' | 'isDismissable' | 'noCloseButton'>

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
    <ModalV2 isDismissable {...rest}>
      <div
        className={cx('flex items-center gap-5 p-0  md:gap-6', {
          'flex-col': variant === 'vertical',
          'flex-col md:flex-row md:items-start': variant === 'horizontal',
        })}
      >
        <div
          className={cx('relative flex flex-row items-start gap-2 rounded-full p-4', {
            'bg-gray-100': type === 'info',
            'bg-warning-100': type === 'warning',
            'bg-negative-100': type === 'error',
            'bg-success-100': type === 'success',
          })}
        >
          <div className="flex h-6 w-6 items-center justify-center">
            <span className="">{icons[type]}</span>
          </div>
        </div>
        <div className="flex w-full flex-col gap-6 p-0">
          <div
            className={cx('flex flex-col items-center p-0', {
              'md:items-start': variant === 'horizontal',
            })}
          >
            <div
              className={twMerge(
                'h-14 text-center text-h-base font-semibold md:text-left',
                titleClassName,
              )}
            >
              {title}
            </div>
            <div
              className={twMerge(
                'text-p2 whitespace-pre-wrap text-center md:text-left',
                childrenClassName,
              )}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
      {buttons && buttons.length > 0 && (
        <div
          className={cx('order-1 mt-6 flex flex-wrap items-center gap-6 p-0', {
            'flex-col-reverse justify-center md:flex-row md:justify-end': buttonsAlign === 'right',
            'flex-col-reverse justify-center md:flex-row md:justify-start': buttonsAlign === 'left',
            'flex-row justify-center': buttonsAlign === 'center',
          })}
        >
          {buttons.map((button, index) => (
            <Fragment key={index}>{button}</Fragment>
          ))}
        </div>
      )}
      {afterContent}
    </ModalV2>
  )
}

export default MessageModal

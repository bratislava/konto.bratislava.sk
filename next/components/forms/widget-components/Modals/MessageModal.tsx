import cx from 'classnames'
import React from 'react'

import ErrorIcon from '../../icon-components/ErrorIcon'
import InfoIcon from '../../icon-components/InfoIcon'
import SuccessIcon from '../../icon-components/SuccessIcon'
import WarningIcon from '../../icon-components/WarningIcon'
import ButtonNew from '../../simple-components/ButtonNew'
import ModalV2, { ModalV2Props } from '../../simple-components/ModalV2'

type MessageModalProps = {
  type: 'warning' | 'info' | 'error' | 'success'
  children: React.ReactNode
  title: string
  submitHandler?: () => void
  cancelHandler?: () => void
  confirmLabel?: string
  cancelLabel?: string
  excludeButtons?: boolean
} & ModalV2Props

const icons = {
  error: <ErrorIcon />,
  info: <InfoIcon />,
  warning: <WarningIcon />,
  success: <SuccessIcon />,
}

const MessageModal = ({
  type,
  children,
  title,
  submitHandler = () => {},
  cancelHandler = () => {},
  confirmLabel,
  cancelLabel,
  excludeButtons,
  ...rest
}: MessageModalProps) => {
  return (
    <ModalV2 {...rest}>
      <div
        className={cx(
          'flex flex-col items-center gap-5 p-0',
          'md:flex-row md:items-start md:gap-6',
        )}
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
        <div className="flex w-full flex-col items-center gap-6 p-0">
          <div className={cx('flex flex-col items-center p-0', 'md:items-start')}>
            <div className="flex h-14 items-center text-h-base font-semibold">{title}</div>
            <div className="text-p2">{children}</div>
          </div>
        </div>
      </div>
      {!excludeButtons && (
        <div className="order-1 mt-6 flex flex-row flex-wrap items-center justify-end gap-6 p-0">
          <ButtonNew onPress={cancelHandler}>{cancelLabel}</ButtonNew>
          <ButtonNew
            onPress={submitHandler}
            variant={type === 'error' ? 'category-solid' : 'black-solid'}
          >
            {confirmLabel}
          </ButtonNew>
        </div>
      )}
    </ModalV2>
  )
}

export default MessageModal

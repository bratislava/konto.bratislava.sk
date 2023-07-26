import { CrossIcon } from '@assets/ui-icons'
import cx from 'classnames'
import React from 'react'

import { handleOnKeyPress } from '../../../../frontend/utils/general'
import ErrorIcon from '../../icon-components/ErrorIcon'
import InfoIcon from '../../icon-components/InfoIcon'
import SuccessIcon from '../../icon-components/SuccessIcon'
import WarningIcon from '../../icon-components/WarningIcon'
import Button from '../../simple-components/Button'

type MessageModalBase = {
  type: 'warning' | 'info' | 'error' | 'success'
  children: React.ReactNode
  show: boolean
  title: string
  submitHandler: () => void
  cancelHandler: () => void
  confirmLabel?: string
  cancelLabel?: string
  className?: string
  excludeButtons?: boolean
}

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
  submitHandler,
  cancelHandler,
  confirmLabel,
  show,
  cancelLabel,
  className,
  excludeButtons,
}: MessageModalBase) => {
  // useEffect(() => {
  //   document.body.style.overflow = show ? 'hidden' : 'visible'
  // }, [show])

  if (!show) {
    return null
  }
  return (
    <div
      role="button"
      tabIndex={0}
      className="fixed top-0 z-50 flex h-full w-full items-center justify-center"
      style={{ background: 'rgba(var(--color-gray-800), .4)', marginTop: '0' }}
      onClick={cancelHandler}
      onKeyPress={(event: React.KeyboardEvent) => handleOnKeyPress(event, cancelHandler)}
    >
      <div className={cx('flex flex-col items-end rounded-lg bg-white p-3', className)}>
        <div className="absolute flex h-6 w-6 items-center justify-center">
          <CrossIcon className="h-6 w-6" onClick={cancelHandler} type="info" />
        </div>
        <div className="p-3">
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
            <div className="flex w-full flex-col items-end gap-6 p-0">
              <div className={cx('flex flex-col items-center p-0', 'md:items-start')}>
                <div className="flex h-14 items-center text-h-base font-semibold">{title}</div>
                <div className="text-p2">{children}</div>
              </div>
            </div>
          </div>
          {!excludeButtons && (
            <div className="order-1 mt-6 flex flex-row items-center justify-end gap-6 p-0">
              <div
                role="button"
                tabIndex={0}
                className="text-p2 flex cursor-pointer flex-row items-center justify-center gap-2 px-2 py-1 font-semibold not-italic"
                onClick={cancelHandler}
                onKeyPress={(event: React.KeyboardEvent) => handleOnKeyPress(event, cancelHandler)}
              >
                {cancelLabel}
              </div>
              <Button
                onPress={submitHandler}
                variant={type === 'error' ? 'negative' : 'black'}
                text={confirmLabel}
                size="sm"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MessageModal

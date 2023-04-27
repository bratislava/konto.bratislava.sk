import SuccessIcon from '@assets/images/new-icons/ui/check-mark.svg'
import CloseIcon from '@assets/images/new-icons/ui/cross.svg'
import ErrorIcon from '@assets/images/new-icons/ui/exclamation-mark.svg'
import WarningIcon from '@assets/images/new-icons/ui/exclamation-mark-triangle.svg'
import InfoIcon from '@assets/images/new-icons/ui/info.svg'
import cx from 'classnames'
import Link from 'next/link'
import React, { ReactNode } from 'react'

type AlertButtonBase = {
  title: string
  handler?: () => void | Promise<boolean>
  link?: string
}

type AlertButtonsBase = {
  buttons: AlertButtonBase[]
  className?: string
}

const AlertButtons = ({ buttons, className }: AlertButtonsBase) => {
  return (
    buttons?.length > 0 && (
      <div className={cx('w-max flex items-start gap-5', className)}>
        {buttons?.map((button, i) => (
          <React.Fragment key={i}>
            {button.link ? (
              <Link
                className="text-16-medium w-max underline underline-offset-4"
                href={button.link}
              >
                {button.title}
              </Link>
            ) : (
              <button
                type="button"
                className="text-16-medium w-max underline underline-offset-4"
                onClick={button.handler}
              >
                {button.title}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>
    )
  )
}

type AlertBase = {
  title?: string
  message?: ReactNode
  type: 'error' | 'success' | 'info' | 'warning'
  close?: () => void
  className?: string
  buttons?: AlertButtonBase[]
  fullWidth?: boolean
  solid?: boolean
}

const Alert = ({
  title,
  message,
  type,
  close,
  className,
  buttons,
  fullWidth = false,
  solid = false,
}: AlertBase) => {
  const icons = {
    error: <ErrorIcon className="w-6 h-6" />,
    success: <SuccessIcon className="w-6 h-6" />,
    info: <InfoIcon className="w-6 h-6" />,
    warning: <WarningIcon className="w-6 h-6" />,
  }

  const alertContainer = cx(
    'flex flex-col items-start gap-2 rounded-lg lg:px-5 px-3 lg:py-4 py-3',
    className,
    {
      'bg-negative-100 text-negative-700': type === 'error' && !solid,
      'bg-success-50 text-success-700': type === 'success' && !solid,
      'bg-gray-100 text-gray-700': type === 'info' && !solid,
      'bg-warning-50 text-warning-700': type === 'warning' && !solid,

      'bg-negative-700 text-white': type === 'error' && solid,
      'bg-success-700 text-white': type === 'success' && solid,
      'bg-gray-700 text-white': type === 'info' && solid,
      'bg-warning-700 text-white': type === 'warning' && solid,
    },
    { 'w-full max-w-none': fullWidth },
    { 'w-full max-w-[480px]': !fullWidth },
  )

  const contentStyle = cx('', {
    'text-16-semibold': title,
    'text-16': !title,
    'text-white': solid,
    'text-gray-700': !solid,
  })

  return (
    <div className={alertContainer}>
      <div className="w-full flex justify-between">
        <div className="flex gap-[14px]">
          <span className="flex min-w-[22px] justify-center">{icons[type]}</span>
          <div className={contentStyle}>{title || message}</div>
        </div>
        {close && (
          <span className="flex h-6 w-6 items-center justify-center cursor-pointer">
            <CloseIcon onClick={close} className="w-6 h-6" />
          </span>
        )}
      </div>
      {message && title && (
        <div
          className={cx('text-p2 w-full pl-9 font-normal', {
            'text-gray-0': solid,
            'text-gray-700': !solid,
          })}
        >
          {title && message}
        </div>
      )}
      <AlertButtons className="pl-9" buttons={buttons} />
    </div>
  )
}

export default Alert

import SuccessIcon from '@assets/images/new-icons/ui/check-mark.svg'
import CloseIcon from '@assets/images/new-icons/ui/cross.svg'
import ErrorIcon from '@assets/images/new-icons/ui/exclamation-mark.svg'
import WarningIcon from '@assets/images/new-icons/ui/exclamation-mark-triangle.svg'
import InfoIcon from '@assets/images/new-icons/ui/info.svg'
import cx from 'classnames'

type AlertButtons = {
  title: string
  handler: () => void
}

type ArrayLengthMutationKeys = 'splice' | 'push' | 'pop' | 'shift' | 'unshift' | number
type ArrayItems<T extends Array<AlertButtons>> = T extends Array<infer TItems> ? TItems : never
type FixedLengthArray<T extends AlertButtons[]> = Pick<
  T,
  Exclude<keyof T, ArrayLengthMutationKeys>
> & {
  [Symbol.iterator]: () => IterableIterator<ArrayItems<T>>
}

type AlertBase = {
  type: 'error' | 'success' | 'info' | 'warning'
  variant?: 'basic' | 'message'
  solid?: boolean
  content?: string
  message: string
  close?: () => void
  buttons?: FixedLengthArray<[AlertButtons, AlertButtons]>
  className?: string
  fullWidth?: boolean
}

const Alert = ({
  solid = false,
  close,
  type,
  variant = 'basic',
  content,
  message,
  className,
  fullWidth = false,
  ...rest
}: AlertBase) => {
  const icons = {
    error: <ErrorIcon className="w-6 h-6" />,
    success: <SuccessIcon className="w-6 h-6" />,
    info: <InfoIcon className="w-6 h-6" />,
    warning: <WarningIcon className="w-6 h-6" />,
  }

  const alertContainer = cx(
    'flex justify-between rounded-lg lg:px-5 px-3',
    className,
    {
      'text-gray-800 flex-col lg:py-4 py-3': variant === 'message',
      'bg-negative-100 text-negative-700': type === 'error' && !solid,
      'bg-success-50 text-success-700': type === 'success' && !solid,
      'bg-gray-100 text-gray-700': type === 'info' && !solid,
      'bg-warning-50 text-warning-700': type === 'warning' && !solid,

      'lg:py-4 p-3 items-center': variant === 'basic',
      'bg-negative-700 text-white': type === 'error' && solid,
      'bg-success-700 text-white': type === 'success' && solid,
      'bg-gray-700 text-white': type === 'info' && solid,
      'bg-warning-700 text-white': type === 'warning' && solid,
    },
    { 'w-fit max-w-none': fullWidth },
    { 'w-full max-w-[480px]': !fullWidth },
  )

  const contentStyle = cx('w-full', {
    'text-16': variant === 'basic',
    'text-16-semibold': variant === 'message',
    'text-gray-0': solid,
    'text-gray-700': !solid,
  })

  const extraButtonStyle = cx('text-16-medium underline underline-offset-4')

  return variant === 'basic' ? (
    <div className={alertContainer}>
      <div className="flex items-center gap-[14px]">
        <span className="flex min-w-[22px] justify-center">{icons[type]}</span>
        <div className={contentStyle}>{message}</div>
      </div>
      {close && (
        <span className="flex h-6 w-6 items-center justify-center">
          <CloseIcon onClick={close} className="w-6 h-6" />
        </span>
      )}
    </div>
  ) : (
    <div className={alertContainer}>
      <div className="flex flex-row items-center gap-[14px]">
        <span className="flex min-w-[22px] justify-center">{icons[type]}</span>
        <div className={contentStyle}>{message}</div>
      </div>
      <div
        className={cx('text-p2 mt-2 w-full pl-9 font-normal', {
          'text-gray-0': solid,
          'text-gray-700': !solid,
        })}
      >
        {content}
      </div>
      {rest.buttons ? (
        <div className="lg:mt-5 mt-3 flex w-full gap-5 pl-9">
          <button type="button" className={extraButtonStyle} onClick={rest.buttons[0].handler}>
            {rest.buttons[0].title}
          </button>
          <button type="button" className={extraButtonStyle} onClick={rest.buttons[1].handler}>
            {rest.buttons[1].title}
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default Alert

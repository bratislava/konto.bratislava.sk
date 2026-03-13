import { useTranslation } from 'next-i18next'
import type { CSSProperties } from 'react'
import {
  Text,
  type ToastProps,
  UNSTABLE_Toast as ReactAriaToast,
  UNSTABLE_ToastContent as ToastContent,
  UNSTABLE_ToastQueue as ToastQueue,
  UNSTABLE_ToastRegion as ToastRegion,
} from 'react-aria-components'
import { flushSync } from 'react-dom'

import { CrossIcon } from '@/src/assets/ui-icons'
import Button from '@/src/components/simple-components/Button'
import cn from '@/src/utils/cn'

export type ToastVariant = 'info' | 'success' | 'error' | 'warning'

export type AppToastContent = {
  message: string
  variant: ToastVariant
  isDelayedToast: boolean
}

export const toastReplacementDelay = 250

export const toastQueue = new ToastQueue<AppToastContent>({
  wrapUpdate(fn) {
    if ('startViewTransition' in document) {
      document.startViewTransition(() => {
        flushSync(fn)
      })
    } else {
      fn()
    }
  },
})

const Toast = ({ className, ...props }: ToastProps<AppToastContent>) => {
  return (
    <ReactAriaToast
      {...props}
      style={{ viewTransitionName: props.toast.key } as CSSProperties}
      className={cn(
        'pointer-events-auto flex w-full max-w-[672px] items-center rounded text-white shadow-lg outline-none [view-transition-class:toast] sm:w-auto sm:min-w-[334px]',
        className,
      )}
    />
  )
}

const AppToastRegion = () => {
  const { t } = useTranslation('account')

  return (
    <ToastRegion
      queue={toastQueue}
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center px-2 outline-none"
    >
      {({ toast }) => (
        <Toast
          className={cn({
            'bg-gray-700': toast.content.variant === 'info',
            'bg-negative-700': toast.content.variant === 'error',
            'bg-success-700': toast.content.variant === 'success',
            'bg-warning-700': toast.content.variant === 'warning',
          })}
          toast={toast}
        >
          <ToastContent className="flex min-w-0 flex-1 items-center">
            <Text
              slot="title"
              className="flex-1 px-4 py-[14px] text-left text-sm leading-5 font-normal"
            >
              {toast.content.message}
            </Text>
          </ToastContent>
          <Button
            slot="close"
            variant="icon-wrapped"
            icon={<CrossIcon className="size-2" aria-hidden />}
            aria-label={t('Toast.aria.close')}
            className="mr-2 text-white"
          />
        </Toast>
      )}
    </ToastRegion>
  )
}

export default AppToastRegion

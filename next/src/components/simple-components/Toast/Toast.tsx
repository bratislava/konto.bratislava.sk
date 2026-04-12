import { Button } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next'
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
import cn from '@/src/utils/cn'

export type ToastVariant = 'info' | 'success' | 'error' | 'warning'

export type AppToastContent = {
  message: string
  variant: ToastVariant
}

// Copied from RAC documentation.
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
      className={cn(
        'pointer-events-auto flex w-full max-w-2xl items-center rounded text-white shadow-lg transition duration-150 ease-out outline-none data-exiting:translate-y-4 data-exiting:opacity-0 sm:w-auto sm:min-w-83.5 starting:translate-y-4 starting:opacity-0',
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
      // z-[60] is there to display it above modal (z-[50])
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
              className="flex-1 px-4 py-3.5 text-left text-sm font-normal leading-5"
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

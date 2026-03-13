import { useCallback } from 'react'

import { toastQueue, type ToastVariant } from '@/src/components/simple-components/Toast'

type ToastOptions = {
  message: string
  variant: ToastVariant
  duration?: number
}

export const defaultToastDuration = 5000
export const toastReplacementDelay = 250

export default function useToast() {
  const closeToasts = useCallback(() => {
    toastQueue.visibleToasts.forEach((toast) => {
      toastQueue.close(toast.key)
    })
  }, [])

  const showToast = useCallback(
    (options: ToastOptions) => {
      const hasVisibleToasts = toastQueue.visibleToasts.length > 0
      if (hasVisibleToasts) {
        closeToasts()
      }

      const additionalDelay = hasVisibleToasts ? toastReplacementDelay : 0
      toastQueue.add(
        {
          message: options.message,
          variant: options.variant,
          isDelayedToast: hasVisibleToasts,
        },
        {
          timeout: (options.duration ?? defaultToastDuration) + additionalDelay,
        },
      )
    },
    [closeToasts],
  )

  return { showToast, closeToasts }
}

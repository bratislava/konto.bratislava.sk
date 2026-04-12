import { useCallback } from 'react'

import { toastQueue, type ToastVariant } from './Toast'

type ToastOptions = {
  message: string
  variant: ToastVariant
  duration?: number
}

const defaultToastDuration = 5000
const toastReplacementDelay = 250

let pendingToastTimer: ReturnType<typeof setTimeout> | null = null

// Intentionally mirrors the previous react-simple-snackbar behavior, including allowing
// only one active toast at a time and replacing it after a short delay.
export default function useToast() {
  const closeToasts = useCallback(() => {
    toastQueue.visibleToasts.forEach((toast) => {
      toastQueue.close(toast.key)
    })
    if (pendingToastTimer) {
      clearTimeout(pendingToastTimer)
      pendingToastTimer = null
    }
  }, [])

  const showToast = useCallback(
    (options: ToastOptions) => {
      if (pendingToastTimer) {
        clearTimeout(pendingToastTimer)
        pendingToastTimer = null
      }

      const addToast = () => {
        toastQueue.add(
          {
            message: options.message,
            variant: options.variant,
          },
          {
            timeout: options.duration ?? defaultToastDuration,
          },
        )
      }

      const hasVisibleToasts = toastQueue.visibleToasts.length > 0
      if (hasVisibleToasts) {
        closeToasts()
        pendingToastTimer = setTimeout(addToast, toastReplacementDelay)
      } else {
        addToast()
      }
    },
    [closeToasts],
  )

  return { showToast, closeToasts }
}

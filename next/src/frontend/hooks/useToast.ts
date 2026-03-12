import { Key, useCallback } from 'react'

import {
  defaultToastDuration,
  toastQueue,
  toastReplacementDelay,
  type ToastVariant,
} from '@/src/components/simple-components/Toast'

type ToastHookOptions = {
  variant?: ToastVariant
}

type ToastOptions =
  | {
      message?: string
      variant?: ToastVariant
      duration?: number
    }
  | number

type ToastHookResult = [
  showToast: (message: string, options?: ToastOptions) => void,
  closeToast: () => void,
]

let currentToastKey: Key | null = null
let pendingToastTimer: ReturnType<typeof setTimeout> | null = null

const clearPendingToastTimer = () => {
  if (pendingToastTimer) {
    clearTimeout(pendingToastTimer)
    pendingToastTimer = null
  }
}

const closeCurrentToast = () => {
  clearPendingToastTimer()

  if (currentToastKey !== null) {
    toastQueue.close(currentToastKey)
    currentToastKey = null
  }
}

const normalizeToastOptions = (message: string, variant: ToastVariant, options?: ToastOptions) => {
  if (typeof options === 'number') {
    return {
      duration: options,
      message,
      variant,
    }
  }

  return {
    duration: options?.duration ?? defaultToastDuration,
    message: options?.message ?? message,
    variant: options?.variant ?? variant,
  }
}

export default function useToast({ variant = 'info' }: ToastHookOptions): ToastHookResult {
  const showToast = useCallback(
    (message: string, options?: ToastOptions) => {
      const normalizedOptions = normalizeToastOptions(message, variant, options)
      const isToastOpen = currentToastKey !== null

      const openToast = () => {
        pendingToastTimer = null

        const nextToastKey = toastQueue.add(
          {
            message: normalizedOptions.message,
            variant: normalizedOptions.variant,
          },
          {
            onClose: () => {
              if (currentToastKey === nextToastKey) {
                currentToastKey = null
              }
            },
            timeout: normalizedOptions.duration,
          },
        )

        currentToastKey = nextToastKey
      }

      clearPendingToastTimer()

      if (currentToastKey !== null) {
        toastQueue.close(currentToastKey)
        currentToastKey = null
      }

      if (isToastOpen) {
        pendingToastTimer = setTimeout(openToast, toastReplacementDelay)

        return
      }

      openToast()
    },
    [variant],
  )

  return [showToast, closeCurrentToast]
}

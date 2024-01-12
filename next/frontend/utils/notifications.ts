import { AlertIcon, CheckInCircleIcon, ErrorIcon, InfoIcon } from '@assets/ui-icons'
import { Id, toast, ToastOptions } from 'react-toastify'

type SnackbarType = 'success' | 'info' | 'error' | 'warning'

export const showSnackbar = (message: string, variant: SnackbarType, options?: ToastOptions) => {
  const icons = {
    error: ErrorIcon,
    success: CheckInCircleIcon,
    info: InfoIcon,
    warning: AlertIcon,
  }

  return toast[variant](message, {
    position: 'bottom-center',
    autoClose: 3000,
    theme: 'colored',
    pauseOnFocusLoss: true,
    icon: icons[variant],
    ...options,
  })
}

export const dismissSnackbar = (toastId?: Id) => toast.dismiss(toastId || undefined)

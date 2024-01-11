import { Id, toast, ToastOptions } from 'react-toastify'

type SnackbarType = 'success' | 'info' | 'error' | 'warning'

export const showSnackbar = (message: string, type: SnackbarType, options?: ToastOptions) => {
  return toast[type](message, {
    position: 'bottom-center',
    autoClose: 3000,
    theme: 'colored',
    pauseOnFocusLoss: false,
    ...options,
  })
}

export const dismissSnackbar = (toastId?: Id) => toast.dismiss(toastId || undefined)

import { useSnackbar as useSimpleSnackbar } from 'react-simple-snackbar'

type Variant = 'info' | 'success' | 'error' | 'warning'

type SnackbarHookOptions = {
  variant?: Variant
}

type SnackbarOptions =
  | {
      message: string
      variant: 'success' | 'warning' | 'error' | 'info'
      duration?: number
    }
  | number

type SnackbarHookResult = [
  showSnackbar: (message: string, options?: SnackbarOptions) => void,
  closeSnackbar: () => void,
]

const getBackgroundColor = (variant: Variant) => {
  switch (variant) {
    case 'error':
      return 'rgb(var(--color-negative-700))'
    case 'warning':
      return 'rgb(var(--color-warning-700))'
    case 'success':
      return 'rgb(var(--color-success-700))'
    default:
      return 'rgb(var(--color-gray-700))'
  }
}

export default function useSnackbar({ variant = 'info' }: SnackbarHookOptions): SnackbarHookResult {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return useSimpleSnackbar({
    style: {
      backgroundColor: getBackgroundColor(variant),
    },
  }) as SnackbarHookResult
}

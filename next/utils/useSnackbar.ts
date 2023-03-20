import { useSnackbar as useSimpleSnackbar } from 'react-simple-snackbar'

type Variant = 'info' | 'success' | 'error' | 'warning'

type Options = {
  variant?: Variant
}

const getBackgroundColor = (variant: Variant) => {
  switch (variant) {
    case 'error':
      return 'rgb(var(--color-negative-700))'
    case 'warning':
      return 'rgb(var(--color-warning-700))'
    case 'success':
      return 'rgb(var(--color-success-700))'
    case 'info':
    default:
      return 'rgb(var(--color-gray-700))'
  }
}

export default function useSnackbar({ variant = 'info' }: Options) {
  return useSimpleSnackbar({
    style: {
      backgroundColor: getBackgroundColor(variant),
    },
  })
}

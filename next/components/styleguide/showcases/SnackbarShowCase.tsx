import useSnackbar from '@/frontend/hooks/useSnackbar'

import Button from '../../forms/simple-components/Button'
import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const SnackbarShowCase = () => {
  const [openSnackbarSuccess] = useSnackbar({ variant: 'success' })
  const [openSnackbarWarning] = useSnackbar({ variant: 'warning' })
  const [openSnackbarError] = useSnackbar({ variant: 'error' })
  const [openSnackbarInfo] = useSnackbar({ variant: 'info' })

  return (
    <Wrapper direction="column" title="Snackbar">
      <Stack>
        <Button onPress={() => openSnackbarSuccess('Success')}>Success</Button>
        <Button onPress={() => openSnackbarError('Error')}>Error</Button>
        <Button onPress={() => openSnackbarInfo('Info')}>Info</Button>
        <Button onPress={() => openSnackbarWarning('Warning')}>Warning</Button>
      </Stack>
    </Wrapper>
  )
}

export default SnackbarShowCase

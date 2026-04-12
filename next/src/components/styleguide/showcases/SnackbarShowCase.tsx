import { Button } from '@bratislava/component-library'

import useToast from '@/src/frontend/hooks/useToast'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const SnackbarShowCase = () => {
  const { showToast } = useToast()

  return (
    <Wrapper direction="column" title="Snackbar">
      <Stack>
        <Button onPress={() => showToast({ message: 'Success', variant: 'success' })}>
          Success
        </Button>
        <Button onPress={() => showToast({ message: 'Error', variant: 'error' })}>Error</Button>
        <Button onPress={() => showToast({ message: 'Info', variant: 'info' })}>Info</Button>
        <Button onPress={() => showToast({ message: 'Warning', variant: 'warning' })}>
          Warning
        </Button>
      </Stack>
    </Wrapper>
  )
}

export default SnackbarShowCase

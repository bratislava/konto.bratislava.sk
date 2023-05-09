import useSnackbar from '../../../frontend/hooks/useSnackbar'
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
        <Button
          text="Success"
          onPress={() => {
            openSnackbarSuccess('Success')
          }}
        />
        <Button
          text="Error"
          onPress={() => {
            openSnackbarError('Error')
          }}
        />
        <Button
          text="Info"
          onPress={() => {
            openSnackbarInfo('Info')
          }}
        />
        <Button
          text="Warning"
          onPress={() => {
            openSnackbarWarning('Warning')
          }}
        />
      </Stack>
    </Wrapper>
  )
}

export default SnackbarShowCase

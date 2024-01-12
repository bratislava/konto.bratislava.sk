import { showSnackbar } from 'frontend/utils/notifications'

import Button from '../../forms/simple-components/Button'
import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const SnackbarShowCase = () => {
  return (
    <Wrapper direction="column" title="Snackbar">
      <Stack>
        <Button
          text="Success"
          onPress={() => {
            showSnackbar('Success', 'success')
          }}
        />
        <Button
          text="Error"
          onPress={() => {
            showSnackbar('Error', 'error')
          }}
        />
        <Button
          text="Info"
          onPress={() => {
            showSnackbar('Info', 'info')
          }}
        />
        <Button
          text="Warning"
          onPress={() => {
            showSnackbar('Warning', 'warning')
          }}
        />
      </Stack>
    </Wrapper>
  )
}

export default SnackbarShowCase

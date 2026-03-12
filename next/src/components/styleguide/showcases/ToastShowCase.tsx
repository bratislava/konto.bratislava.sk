/* eslint-disable i18next/no-literal-string */

import Button from '@/src/components/simple-components/Button'
import useToast from '@/src/frontend/hooks/useToast'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const ToastShowCase = () => {
  const [openToastSuccess] = useToast({ variant: 'success' })
  const [openToastWarning] = useToast({ variant: 'warning' })
  const [openToastError] = useToast({ variant: 'error' })
  const [openToastInfo] = useToast({ variant: 'info' })

  return (
    <Wrapper direction="column" title="Toast">
      <Stack>
        <Button variant="solid" className="border-success-700 bg-success-700" onPress={() => openToastSuccess('Success')}>Success</Button>
        <Button variant="solid" className="border-negative-700 bg-negative-700" onPress={() => openToastError('Error')}>Error</Button>
        <Button variant="solid" onPress={() => openToastInfo('Info')}>Info</Button>
        <Button variant="solid" className="border-warning-700 bg-warning-700" onPress={() => openToastWarning('Warning')}>Warning</Button>
      </Stack>
    </Wrapper>
  )
}

export default ToastShowCase

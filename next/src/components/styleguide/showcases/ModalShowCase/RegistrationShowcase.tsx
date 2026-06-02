/* eslint-disable i18next/no-literal-string */

import { Button, Typography } from '@bratislava/component-library'

import { useFormModals } from '@/src/components/modals/FormModals/useFormModals'
import RegistrationModal, { RegistrationModalType } from '@/src/components/modals/RegistrationModal'
import { Stack } from '@/src/components/styleguide/Stack'
import { Wrapper } from '@/src/components/styleguide/Wrapper'

const RegistrationShowcase = () => {
  const formModals = useFormModals()

  return (
    <Wrapper title="Registration modal" direction="column" noBorder>
      <Typography>
        <strong>Where is this used:</strong> Form page. Each variant is shown when the user is not
        signed in: <strong>Initial</strong> when opening a form that requires sign-in;{' '}
        <strong>NotAuthenticatedConceptSave</strong> when tapping Save draft;{' '}
        <strong>NotAuthenticatedSubmitForm</strong> when tapping Send.
      </Typography>
      <Stack direction="column">
        <Button
          variant="solid"
          onPress={() => formModals.setRegistrationModal(RegistrationModalType.Initial)}
        >
          Variant: Initial
        </Button>
        <Button
          variant="solid"
          onPress={() =>
            formModals.setRegistrationModal(RegistrationModalType.NotAuthenticatedConceptSave)
          }
        >
          Variant: NotAuthenticatedConceptSave
        </Button>
        <Button
          variant="solid"
          onPress={() =>
            formModals.setRegistrationModal(RegistrationModalType.NotAuthenticatedSubmitForm)
          }
        >
          Variant: NotAuthenticatedSubmitForm
        </Button>
        <RegistrationModal
          type={formModals.registrationModal}
          isOpen={formModals.registrationModal != null}
          onOpenChange={(value) => {
            if (!value) {
              formModals.setRegistrationModal(null)
            }
          }}
          login={() => {}}
          register={() => {}}
        />
      </Stack>
    </Wrapper>
  )
}

export default RegistrationShowcase

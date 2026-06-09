/* eslint-disable i18next/no-literal-string */

import { Button, Typography } from '@bratislava/component-library'

import { useFormModals } from '@/src/components/modals/FormModals/useFormModals'
import IdentityVerificationModal from '@/src/components/modals/IdentityVerificationModal'
import { Stack } from '@/src/components/styleguide/Stack'
import { Wrapper } from '@/src/components/styleguide/Wrapper'

const IdentityVerificationShowcase = () => {
  const formModals = useFormModals()

  return (
    <Wrapper title="Identity verification modal" direction="column" noBorder>
      <Typography>
        <strong>Where is this used:</strong> Usage: explains that identity verification is required
        and offers a button to go to the verification page. Shown when the user needs to verify
        their identity in the form context (e.g. before sending or from a verify-identity action).
      </Typography>
      <Stack direction="column">
        <Button variant="solid" onPress={() => formModals.setIdentityVerificationModal(true)}>
          Identity verification modal
        </Button>
        <IdentityVerificationModal
          isOpen={formModals.identityVerificationModal}
          onOpenChange={formModals.setIdentityVerificationModal}
          accountType={undefined}
        />
      </Stack>
    </Wrapper>
  )
}

export default IdentityVerificationShowcase

/* eslint-disable i18next/no-literal-string */

import { Button, Typography } from '@bratislava/component-library'

import { useFormModals } from '@/src/components/modals/FormModals/useFormModals'
import TaxFormPdfExportModal from '@/src/components/modals/TaxFormPdfExportModal/TaxFormPdfExportModal'
import { Stack } from '@/src/components/styleguide/Stack'
import { Wrapper } from '@/src/components/styleguide/Wrapper'

const TaxFormPdfExportShowcase = () => {
  const formModals = useFormModals()

  return (
    <Wrapper title="Tax form PDF export modal" direction="column" noBorder>
      <Typography>
        <strong>Where is this used:</strong> Usage: when the user exports form as PDF (form menu →
        Export PDF). Shows loading while the PDF is generated, then success when done. Used only for
        tax forms.
      </Typography>
      <Stack direction="column">
        <Button
          variant="solid"
          onPress={() =>
            formModals.setTaxFormPdfExportModal({ type: 'loading', onClose: () => {} })
          }
        >
          Tax form PDF export - loading state
        </Button>
        <Button
          variant="solid"
          onPress={() => formModals.setTaxFormPdfExportModal({ type: 'success' })}
        >
          Tax form PDF export - success state
        </Button>
        <TaxFormPdfExportModal
          state={formModals.taxFormPdfExportModal}
          isOpen={formModals.taxFormPdfExportModal != null}
          onOpenChange={(value) => {
            if (!value) {
              formModals.setTaxFormPdfExportModal(null)
            }
          }}
        />
      </Stack>
    </Wrapper>
  )
}

export default TaxFormPdfExportShowcase

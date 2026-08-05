import { Button, ButtonButtonProps } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'

import { useFormContext } from '@/src/components/forms/useFormContext'
import { useFormSend } from '@/src/components/forms/useFormSend'
import { useFormState } from '@/src/components/forms/useFormState'
import Icon from '@/src/components/icon-components/Icon'
import { useFormExportImport } from '@/src/frontend/hooks/useFormExportImport'

const SummaryFormControls = () => {
  const { t } = useTranslation('account')

  const {
    isTaxForm,
    isReadonly,
    isTemporarilyDisabled,
    evaluatedSendPolicy: { sendPossible, eidSendPossible },
  } = useFormContext()
  const { goToPreviousStep } = useFormState()
  const { exportPdf, saveConcept } = useFormExportImport()
  const { submitDisabled, handleSendButtonPress, handleSendEidButtonPress } = useFormSend()

  if (isReadonly) {
    return null
  }

  // While temporarily disabled, sending is not possible - the send buttons are replaced by "save as draft".
  const buttons: ((ButtonButtonProps & { 'data-cy'?: string }) | null)[] = isTemporarilyDisabled
    ? [
        {
          variant: 'solid',
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onPress: () => saveConcept(),
          children: t('useFormMenuItems.saveConcept'),
          'data-cy': 'save-concept-summary',
        },
      ]
    : [
        isTaxForm
          ? {
              variant: 'outline',
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onPress: () => exportPdf(),
              children: t('SummaryFormControls.exportPdf'),
              'data-cy': 'download-pdf-button',
            }
          : null,
        eidSendPossible
          ? {
              isDisabled: submitDisabled(),
              variant: sendPossible ? 'outline' : 'solid',
              onPress: () => handleSendEidButtonPress(),
              type: 'submit',
              children: t('SummaryFormControls.sendEid'),
            }
          : null,
        sendPossible
          ? {
              isDisabled: submitDisabled(),
              variant: 'solid',
              onPress: () => handleSendButtonPress(),
              type: 'submit',
              children: t('SummaryFormControls.send'),
            }
          : null,
      ]

  return (
    <div className="mt-4 flex flex-col gap-2 lg:mt-10 lg:flex-row lg:flex-wrap lg:gap-5">
      <div className="hidden grow items-center lg:flex">
        <Button
          className="hidden lg:inline-flex"
          variant="plain"
          onPress={goToPreviousStep}
          startIcon={<Icon name="chevron-left" className="size-6" />}
        >
          {t('FormControls.back')}
        </Button>
      </div>
      <div className="flex flex-col gap-2 lg:flex-row lg:gap-5">
        {buttons.map((button, index) => {
          if (!button) {
            return null
          }

          return <Button key={index} {...button} fullWidthMobile />
        })}

        <Button className="lg:hidden" variant="outline" onPress={goToPreviousStep} fullWidthMobile>
          {t('FormControls.back')}
        </Button>
      </div>
    </div>
  )
}

export default SummaryFormControls

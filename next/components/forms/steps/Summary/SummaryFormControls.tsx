import { useTranslation } from 'next-i18next'
import React from 'react'

import { ChevronLeftIcon } from '@/assets/ui-icons'
import Button, { ButtonProps } from '@/components/forms/simple-components/Button'
import { useFormContext } from '@/components/forms/useFormContext'
import { useFormSend } from '@/components/forms/useFormSend'
import { useFormState } from '@/components/forms/useFormState'
import { useFormExportImport } from '@/frontend/hooks/useFormExportImport'

const SummaryFormControls = () => {
  const { t } = useTranslation('forms')

  const {
    isTaxForm,
    isReadonly,
    evaluatedSendPolicy: { sendPossible, eidSendPossible },
  } = useFormContext()
  const { goToPreviousStep } = useFormState()
  const { exportPdf } = useFormExportImport()
  const { submitDisabled, handleSendButtonPress, handleSendEidButtonPress } = useFormSend()

  if (isReadonly) {
    return null
  }

  const buttons: ((ButtonProps & { 'data-cy'?: string }) | null)[] = [
    isTaxForm
      ? {
          variant: 'outline',
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onPress: () => exportPdf(),
          children: t('summary.export_pdf'),
          'data-cy': 'download-pdf-button',
        }
      : null,
    eidSendPossible
      ? {
          isDisabled: submitDisabled(),
          variant: sendPossible ? 'outline' : 'solid',
          onPress: () => handleSendEidButtonPress(),
          type: 'submit',
          children: t('summary.button_send_eid'),
        }
      : null,
    sendPossible
      ? {
          isDisabled: submitDisabled(),
          variant: 'solid',
          onPress: () => handleSendButtonPress(),
          type: 'submit',
          children: t('summary.button_send'),
        }
      : null,
  ]

  return (
    <div className="mt-4 flex flex-col gap-2 md:mt-10 md:flex-row md:flex-wrap md:gap-5">
      <div className="hidden grow items-center md:flex">
        <Button
          className="hidden md:inline-flex"
          variant="plain"
          onPress={goToPreviousStep}
          startIcon={<ChevronLeftIcon className="size-6" />}
        >
          {t('form_controls.back')}
        </Button>
      </div>
      <div className="flex flex-col gap-2 md:flex-row md:gap-5">
        {buttons.map((button, index) => {
          if (!button) {
            return null
          }

          return <Button key={index} {...button} fullWidthMobile />
        })}

        <Button className="md:hidden" variant="outline" onPress={goToPreviousStep} fullWidthMobile>
          {t('form_controls.back')}
        </Button>
      </div>
    </div>
  )
}

export default SummaryFormControls

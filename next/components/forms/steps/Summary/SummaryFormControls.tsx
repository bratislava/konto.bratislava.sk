import { ChevronLeftIcon } from '@assets/ui-icons'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { useFormExportImport } from '../../../../frontend/hooks/useFormExportImport'
import ButtonNew, { ButtonProps } from '../../simple-components/ButtonNew'
import { useFormContext } from '../../useFormContext'
import { useFormSend } from '../../useFormSend'
import { useFormState } from '../../useFormState'

const SummaryFormControls = () => {
  const { t } = useTranslation('forms')

  const { isTaxForm, isReadonly, evaluatedSendPolicy } = useFormContext()
  const { goToPreviousStep } = useFormState()
  const { exportPdf } = useFormExportImport()
  const { submitDisabled, handleSendButtonPress, handleSendEidButtonPress } = useFormSend()

  if (isReadonly) {
    return null
  }

  const buttons: ((ButtonProps & { 'data-cy'?: string }) | null)[] = [
    isTaxForm
      ? {
          variant: 'black-outline',
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onPress: () => exportPdf(),
          children: t('summary.export_pdf'),
          'data-cy': 'download-pdf-button',
        }
      : null,
    evaluatedSendPolicy.eidSend.possible
      ? {
          isDisabled: submitDisabled(),
          variant: evaluatedSendPolicy.send.possible ? 'black-outline' : 'black-solid',
          onPress: () => handleSendEidButtonPress(),
          type: 'submit',
          children: t('summary.button_send_eid'),
        }
      : null,
    evaluatedSendPolicy.eidSend.possible
      ? {
          isDisabled: submitDisabled(),
          variant: 'black-solid',
          onPress: () => handleSendButtonPress(),
          type: 'submit',
          children: t('summary.button_send'),
        }
      : null,
  ]

  return (
    <div className="mt-4 flex flex-col gap-2 md:mt-10 md:flex-row md:flex-wrap md:gap-5">
      <div className="hidden grow items-center md:flex">
        <ButtonNew
          className="hidden md:inline-flex"
          variant="black-plain"
          onPress={goToPreviousStep}
          startIcon={<ChevronLeftIcon className="size-6" />}
        >
          {t('buttons.previous')}
        </ButtonNew>
      </div>
      <div className="flex flex-col gap-2 md:flex-row md:gap-5">
        {buttons.map((button, index) => {
          if (!button) {
            return null
          }

          return <ButtonNew key={index} {...button} fullWidthMobile />
        })}

        <ButtonNew className="md:hidden" variant="black-outline" onPress={goToPreviousStep}>
          {t('buttons.previous')}
        </ButtonNew>
      </div>
    </div>
  )
}

export default SummaryFormControls

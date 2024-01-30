import { ChevronLeftIcon } from '@assets/ui-icons'
import { useTranslation } from 'next-i18next'
import React, { useMemo } from 'react'

import { useFormExportImport } from '../../../../frontend/hooks/useFormExportImport'
import { isFormSubmitDisabled } from '../../../../frontend/utils/formSummary'
import { useFormSignature } from '../../signer/useFormSignature'
import ButtonNew from '../../simple-components/ButtonNew'
import { useFormSend } from '../../useFormSend'
import { useFormState } from '../../useFormState'
import { useFormSummary } from './useFormSummary'

const SummaryFormControls = () => {
  const { t } = useTranslation('forms')

  const { isReadonly, goToPreviousStep, isTaxForm, isSigned } = useFormState()
  const { exportPdf } = useFormExportImport()
  const { errorSchema, infectedFiles } = useFormSummary()
  const { isValidSignature } = useFormSignature()
  const submitDisabled = useMemo(
    () => isFormSubmitDisabled(errorSchema, infectedFiles, isValidSignature()),
    [errorSchema, infectedFiles, isValidSignature],
  )
  const { handleSendButtonPress, handleSendEidButtonPress } = useFormSend()

  if (isReadonly) {
    // Cannot be null as RJSF will display its own submit button.
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>
  }

  return (
    <>
      {/* Desktop */}
      <div className="mt-10 hidden flex-row flex-wrap gap-5 md:flex">
        <div className="grow">
          <ButtonNew
            variant="black-plain"
            onPress={goToPreviousStep}
            startIcon={<ChevronLeftIcon className="h-6 w-6" />}
          >
            {t('buttons.previous')}
          </ButtonNew>
        </div>

        <div className="flex flex-row flex-wrap gap-5">
          {/* Temporary logic for tax form, will be cleaned up. */}
          {isTaxForm ? (
            <>
              <ButtonNew variant={isSigned ? 'black-outline' : 'black-solid'} onPress={exportPdf} data-cy="download-pdf-button-desktop">
                {t('summary.export_pdf')}
              </ButtonNew>
              {isSigned && (
                <ButtonNew
                  isDisabled={submitDisabled}
                  type="submit"
                  variant="black-solid"
                  onPress={handleSendEidButtonPress}
                >
                  {t('summary.button_send_eid')}
                </ButtonNew>
              )}
            </>
          ) : (
            <>
              <ButtonNew
                isDisabled={submitDisabled}
                type="submit"
                variant="black-outline"
                onPress={handleSendEidButtonPress}
              >
                {t('summary.button_send_eid')}
              </ButtonNew>
              <ButtonNew
                isDisabled={submitDisabled}
                type="submit"
                variant="black-solid"
                onPress={handleSendButtonPress}
              >
                {t('summary.button_send')}
              </ButtonNew>
            </>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="mt-4 flex flex-col gap-2 md:hidden">
        {isTaxForm ? (
          <>
            <ButtonNew
              variant={isSigned ? 'black-outline' : 'black-solid'}
              onPress={exportPdf}
              fullWidth
              data-cy="download-pdf-button-mobile"
            >
              {t('summary.export_pdf')}
            </ButtonNew>
            {isSigned && (
              <ButtonNew
                isDisabled={submitDisabled}
                size="small"
                fullWidth
                type="submit"
                variant="black-solid"
                onPress={handleSendEidButtonPress}
              >
                {t('summary.button_send_eid')}
              </ButtonNew>
            )}
          </>
        ) : (
          <>
            <ButtonNew
              isDisabled={submitDisabled}
              size="small"
              fullWidth
              type="submit"
              variant="black-outline"
              onPress={handleSendEidButtonPress}
            >
              {t('summary.button_send_eid')}
            </ButtonNew>
            <ButtonNew
              isDisabled={submitDisabled}
              size="small"
              fullWidth
              type="submit"
              variant="black-solid"
              onPress={handleSendButtonPress}
            >
              {t('summary.button_send')}
            </ButtonNew>
          </>
        )}
        <ButtonNew size="small" fullWidth variant="black-outline" onPress={goToPreviousStep}>
          {t('buttons.previous')}
        </ButtonNew>
      </div>
    </>
  )
}

export default SummaryFormControls

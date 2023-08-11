import { ErrorIcon } from '@assets/ui-icons'
import Button from 'components/forms/simple-components/ButtonNew'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { useFormExportImport } from '../../../../frontend/hooks/useFormExportImport'
import ModalV2, { ModalV2Props } from '../../simple-components/ModalV2'

type ConceptSaveErrorModalProps = {
  onSkip?: () => void
} & ModalV2Props

const ConceptSaveErrorModal = ({ onSkip, ...rest }: ConceptSaveErrorModalProps) => {
  const { t } = useTranslation('forms')
  const { saveConcept, saveConceptIsLoading } = useFormExportImport()

  return (
    <ModalV2 {...rest}>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-5 md:gap-6">
          <div className="flex flex-col gap-5 md:gap-6">
            <div className="flex w-full justify-center">
              <span className="flex h-14 w-14 min-w-[56px] items-center justify-center rounded-full bg-negative-100">
                <ErrorIcon className="h-6 w-6 text-main-700" />
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-h3">{t('concept_save_error_modal.title')}</h3>
              <div className="flex flex-col gap-6 md:gap-4">
                {t('concept_save_error_modal.text')}
              </div>
            </div>
          </div>
          <div className="flex w-full flex-col items-center justify-end gap-4 md:gap-6">
            <Button variant="black-plain" fullWidth onPress={() => rest?.onOpenChange?.(false)}>
              {t('concept_save_error_modal.button_back_text')}
            </Button>
            <Button
              variant="category-solid"
              onPress={() => saveConcept(true)}
              isLoading={saveConceptIsLoading}
            >
              {t('concept_save_error_modal.button_repeat_text')}
            </Button>
          </div>
        </div>
      </div>
    </ModalV2>
  )
}

export default ConceptSaveErrorModal

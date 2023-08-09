import { ErrorIcon } from '@assets/ui-icons'
import Button from 'components/forms/simple-components/Button'
import { useTranslation } from 'next-i18next'
import React from 'react'

import ModalV2, { ModalV2Props } from '../../simple-components/ModalV2'

type SkipStepModalProps = {
  onSkip?: () => void
} & ModalV2Props

const SkipStepModal = ({ onSkip, ...rest }: SkipStepModalProps) => {
  const { t } = useTranslation('forms')

  return (
    <ModalV2 {...rest}>
      <div className="flex flex-col gap-6">
        <div className="flex gap-6">
          <span className="flex h-14 w-14 min-w-[56px] items-center justify-center rounded-full bg-negative-100 text-negative-700">
            <ErrorIcon />
          </span>
          <div>
            <h5 className="text-h5 flex h-14 items-center">{t('skip_step_modal.title')}</h5>
            <p className="text-p2">{t('skip_step_modal.text')}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-6">
          <Button
            text={t('skip_step_modal.button_skip_text')}
            variant="plain-black"
            onPress={onSkip}
          />
          <Button
            text={t('skip_step_modal.button_submit_text')}
            variant="negative"
            size="sm"
            onPress={() => rest?.onOpenChange?.(false)}
          />
        </div>
      </div>
    </ModalV2>
  )
}

export default SkipStepModal

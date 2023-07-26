import { CrossIcon, ErrorIcon } from '@assets/ui-icons'
import cx from 'classnames'
import Button from 'components/forms/simple-components/Button'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { handleOnKeyPress } from '../../../../frontend/utils/general'

type SkipStepModalBase = {
  show: boolean
  onClose: () => void
  onSkip?: () => void
  className?: string
}

const SkipStepModal = ({ show, onClose, onSkip, className }: SkipStepModalBase) => {
  const { t } = useTranslation('forms')

  if (!show) {
    return null
  }
  return (
    <div
      role="button"
      tabIndex={0}
      className="fixed inset-0 z-50 flex h-full w-full items-center justify-center"
      style={{ background: 'rgba(var(--color-gray-800), .4)', marginTop: '0' }}
      onClick={onClose}
      onKeyPress={(event: React.KeyboardEvent) => handleOnKeyPress(event, onClose)}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => e.stopPropagation()}
        onKeyPress={(event: React.KeyboardEvent) =>
          handleOnKeyPress(event, () => event.stopPropagation())
        }
        className={cx(
          'relative mx-0 h-full w-full max-w-none overflow-auto rounded-none bg-gray-0 px-4 pt-12 md:mx-4 md:h-min md:max-w-[592px] md:rounded-2xl md:px-6 md:py-6',
          className,
        )}
      >
        <div className="flex flex-col gap-2">
          <CrossIcon
            onClick={() => onClose()}
            className="absolute right-3 top-3 h-6 w-6 cursor-pointer md:right-4 md:top-4"
          />
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
                onPress={onClose}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SkipStepModal

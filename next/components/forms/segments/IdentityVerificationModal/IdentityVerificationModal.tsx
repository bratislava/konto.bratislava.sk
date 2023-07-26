import { AlertIcon, ArrowRightIcon, CrossIcon } from '@assets/ui-icons'
import cx from 'classnames'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import Button from 'components/forms/simple-components/Button'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { handleOnKeyPress } from '../../../../frontend/utils/general'

type IdentityVerificationModalBase = {
  show: boolean
  onClose: () => void
  className?: string
  isLegalEntity?: boolean
}

const IdentityVerificationModal = ({
  show,
  onClose,
  className,
  isLegalEntity = false,
}: IdentityVerificationModalBase) => {
  const { t } = useTranslation('account')
  const router = useRouter()

  if (!show) {
    return null
  }
  return (
    <div
      role="button"
      tabIndex={0}
      className="fixed inset-0 z-50 flex h-full w-full items-start justify-center pt-2 md:items-center md:pt-0"
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
          'relative mx-4 w-full max-w-[592px] overflow-auto rounded-xl bg-gray-0 px-4 py-4 pt-6 md:rounded-2xl md:px-6 md:py-6',
          className,
        )}
      >
        <div className="flex flex-col gap-2">
          <CrossIcon
            onClick={() => onClose()}
            className="absolute right-4 top-3 h-6 w-6 cursor-pointer md:right-4 md:top-4"
          />
          <div className="flex flex-col gap-5 md:gap-6">
            <div className="flex flex-col gap-5 md:gap-6">
              <div className="flex w-full justify-center">
                <span className="flex h-14 w-14 min-w-[56px] items-center justify-center rounded-full bg-warning-100 md:h-18 md:w-18 md:min-w-[72px]">
                  <AlertIcon className="h-6 w-6 text-warning-700 md:h-8 md:w-8" />
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <h3 className="text-h3">{t('verification_modal.title')}</h3>
                <div className="flex flex-col gap-6 md:gap-4">
                  <AccountMarkdown
                    className="text-center"
                    variant="sm"
                    content={`<span className='text-p2'>${
                      isLegalEntity ? t('verification_modal.subtitle_individual_person') : ''
                    }${
                      isLegalEntity ? t('verification_modal.subtitle_juridical_person') : ''
                    }</span>`}
                  />
                  <p className="text-p3 text-center">{t('verification_modal.info')}</p>
                </div>
              </div>
            </div>
            <div className="flex w-full flex-col items-center justify-end gap-4 md:gap-6">
              <Button
                text={t('verification_url_text')}
                fullWidth
                onPress={() => router.push('/overenie-identity')}
              />
              <Button
                endIcon={<ArrowRightIcon className="h-6 w-6" />}
                text="Preskočiť"
                variant="plain-black"
                fullWidth
                onPress={onClose}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IdentityVerificationModal

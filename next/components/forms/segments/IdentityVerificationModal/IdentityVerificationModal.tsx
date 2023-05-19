import ArrowRightIcon from '@assets/images/new-icons/ui/arrow-right.svg'
import CloseIcon from '@assets/images/new-icons/ui/cross.svg'
import WarningIcon from '@assets/images/new-icons/ui/exclamation-mark-triangle.svg'
import cx from 'classnames'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import Button from 'components/forms/simple-components/Button'
import { AccountType } from 'frontend/hooks/useAccount'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { handleOnKeyPress } from '../../../../frontend/utils/general'

type IdentityVerificationModalBase = {
  show: boolean
  onClose: () => void
  className?: string
  userType?: AccountType
}

const IdentityVerificationModal = ({
  show,
  onClose,
  className,
  userType = 'fo',
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
      className="h-full fixed w-full z-50 inset-0 flex pt-2 md:pt-0 items-start md:items-center justify-center"
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
          'w-full max-w-[592px] rounded-xl md:rounded-2xl bg-gray-0 px-4 md:px-6 py-4 pt-6 md:py-6 relative mx-4 overflow-auto',
          className,
        )}
      >
        <div className="flex flex-col gap-2">
          <CloseIcon
            onClick={() => onClose()}
            className="cursor-pointer w-6 h-6 absolute top-3 right-4 md:top-4 md:right-4"
          />
          <div className="flex flex-col gap-5 md:gap-6">
            <div className="flex flex-col gap-5 md:gap-6">
              <div className="w-full flex justify-center">
                <span className="min-w-[56px] md:min-w-[72px] w-14 h-14 md:w-18 md:h-18 rounded-full bg-warning-100 flex items-center justify-center">
                  <WarningIcon className="w-6 h-6 md:w-8 md:h-8 text-warning-700" />
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <h3 className="text-h3">{t('verification_modal.title')}</h3>
                <div className="flex flex-col gap-6 md:gap-4">
                  <AccountMarkdown
                    className="text-center"
                    variant="sm"
                    content={`<span className='text-p2'>${
                      userType === 'fo' ? t('verification_modal.subtitle_individual_person') : ''
                    }${
                      userType === 'po' ? t('verification_modal.subtitle_juridical_person') : ''
                    }</span>`}
                  />
                  <p className="text-p3 text-center">{t('verification_modal.info')}</p>
                </div>
              </div>
            </div>
            <div className="w-full flex flex-col items-center justify-end gap-4 md:gap-6">
              <Button
                text={t('verification_url_text')}
                fullWidth
                onPress={() => router.push('/overenie-identity')}
              />
              <Button
                endIcon={<ArrowRightIcon className="w-6 h-6" />}
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

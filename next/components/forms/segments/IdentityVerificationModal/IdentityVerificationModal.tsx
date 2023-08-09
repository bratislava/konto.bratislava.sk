import { AlertIcon, ArrowRightIcon } from '@assets/ui-icons'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import Button from 'components/forms/simple-components/Button'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { AccountType } from '../../../../frontend/dtos/accountDto'
import ModalV2, { ModalV2Props } from '../../simple-components/ModalV2'

type IdentityVerificationModalProps = {
  accountType: AccountType | undefined
} & ModalV2Props

const IdentityVerificationModal = ({ accountType, ...rest }: IdentityVerificationModalProps) => {
  const { t } = useTranslation('account')
  const router = useRouter()

  return (
    <ModalV2 {...rest}>
      <div className="flex flex-col gap-2">
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
                    accountType === AccountType.PravnickaOsoba
                      ? t('verification_modal.subtitle_individual_person')
                      : ''
                  }${
                    accountType === AccountType.PravnickaOsoba
                      ? t('verification_modal.subtitle_juridical_person')
                      : ''
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
              onPress={() => rest?.onOpenChange?.(false)}
            />
          </div>
        </div>
      </div>
    </ModalV2>
  )
}

export default IdentityVerificationModal

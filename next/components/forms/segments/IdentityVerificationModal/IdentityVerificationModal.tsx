import { ArrowRightIcon } from '@assets/ui-icons'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { AccountType } from '../../../../frontend/dtos/accountDto'
import ButtonNew from '../../simple-components/ButtonNew'
import { ModalV2Props } from '../../simple-components/ModalV2'
import { useFormRedirects } from '../../useFormRedirects'
import MessageModal from '../../widget-components/Modals/MessageModal'

type IdentityVerificationModalProps = {
  accountType: AccountType | undefined
} & ModalV2Props

const IdentityVerificationModal = ({ accountType, ...rest }: IdentityVerificationModalProps) => {
  const { t } = useTranslation('account')
  const { verifyIdentity } = useFormRedirects()

  return (
    <MessageModal
      type="warning"
      title={t('verification_modal.title')}
      variant="vertical"
      buttonsAlign="center"
      buttons={[
        <ButtonNew className="grow" variant="black-solid" onPress={() => verifyIdentity()}>
          {t('verification_url_text')}
        </ButtonNew>,
        <ButtonNew
          className="grow"
          variant="black-outline"
          onPress={() => rest?.onOpenChange?.(false)}
        >
          {t('verification_modal.footer_desktop_eID_text')}
        </ButtonNew>,
      ]}
      titleClassName="text-h3"
      afterContent={
        <>
          <div className="mt-3 flex items-center md:mt-6">
            <span className="h-0.5 w-full bg-gray-200" />
            <span className="text-p1 px-6">{t('verification_modal.footer_choice')}</span>
            <span className="h-0.5 w-full bg-gray-200" />
          </div>
          <div className="mt-6 flex justify-center">
            <ButtonNew
              variant="black-plain"
              endIcon={<ArrowRightIcon className="h-6 w-6" />}
              onPress={() => rest?.onOpenChange?.(false)}
            >
              {t('verification_modal.footer_desktop_continue')}
            </ButtonNew>
          </div>
        </>
      }
      {...rest}
    >
      <div className="flex flex-col gap-6 md:gap-4">
        <AccountMarkdown className="text-center" content={t('verification_modal.subtitle')} />
        <AccountMarkdown
          className="text-p3 text-center"
          variant="sm"
          content={t('verification_modal.info')}
        />
      </div>
    </MessageModal>
  )
}

export default IdentityVerificationModal

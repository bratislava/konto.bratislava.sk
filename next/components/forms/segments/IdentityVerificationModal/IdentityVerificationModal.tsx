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

  // TODO translations
  return (
    <MessageModal
      type="warning"
      title={t('verification_modal.title')}
      buttons={[
        <ButtonNew variant="black-solid" onPress={() => verifyIdentity()}>
          {t('verification_url_text')}
        </ButtonNew>,
        <ButtonNew variant="black-outline" onPress={() => rest?.onOpenChange?.(false)}>
          Pokračovať s eID
        </ButtonNew>,
      ]}
      afterContent={
        <>
          <span>alebo</span>
          <ButtonNew
            variant="black-plain"
            endIcon={<ArrowRightIcon className="h-6 w-6" />}
            onPress={() => rest?.onOpenChange?.(false)}
          >
            Pokračovať na žiadosť
          </ButtonNew>
        </>
      }
      {...rest}
    >
      <div className="flex flex-col gap-6 md:gap-4">
        <AccountMarkdown
          className="text-center"
          variant="sm"
          content={`<span className='text-p2'>${
            accountType === AccountType.FyzickaOsoba
              ? t('verification_modal.subtitle_individual_person')
              : ''
          }${
            accountType === AccountType.PravnickaOsoba ||
            accountType === AccountType.FyzickaOsobaPodnikatel
              ? t('verification_modal.subtitle_juridical_person')
              : ''
          }</span>`}
        />
        <p className="text-p3 text-center">{t('verification_modal.info')}</p>
      </div>
    </MessageModal>
  )
}

export default IdentityVerificationModal

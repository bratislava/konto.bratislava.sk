import { useTranslation } from 'next-i18next'
import React from 'react'

import { ArrowRightIcon } from '@/src/assets/ui-icons'
import AccountMarkdown from '@/src/components/formatting/AccountMarkdown'
import { useFormRedirects } from '@/src/components/forms/useFormRedirects'
import Button from '@/src/components/simple-components/Button'
import HorizontalDivider from '@/src/components/simple-components/HorizontalDivider'
import { ModalProps } from '@/src/components/simple-components/Modal'
import MessageModal from '@/src/components/widget-components/Modals/MessageModal'
import { AccountType } from '@/src/frontend/dtos/accountDto'

type IdentityVerificationModalProps = {
  accountType: AccountType | undefined
} & ModalProps

/**
 * Figma: https://www.figma.com/design/0VrrvwWs7n3T8YFzoHe92X/BK--Dizajn--DEV-?node-id=13868-15366&t=nvTJpHb34NMAiOw5-4
 */

const IdentityVerificationModal = ({ accountType, ...rest }: IdentityVerificationModalProps) => {
  const { t } = useTranslation('account')
  const { verifyIdentity } = useFormRedirects()

  return (
    // We consciously do not use MessageModal props for buttons,
    // because this modal has custom layout with content under buttons
    <MessageModal type="warning" title={t('verification_modal.title')}>
      <div className="flex flex-col gap-6 lg:gap-4">
        <div className="flex flex-col gap-4">
          <AccountMarkdown className="text-center" content={t('verification_modal.subtitle')} />
          <AccountMarkdown
            className="text-center text-p3"
            variant="sm"
            content={t('verification_modal.info')}
          />
        </div>
        <div className="flex flex-col gap-3 *:w-full lg:flex-row">
          <Button className="grow" variant="solid" onPress={() => verifyIdentity()}>
            {t('auth.verification_url_text')}
          </Button>
          <Button className="grow" variant="outline" onPress={() => rest?.onOpenChange?.(false)}>
            {t('verification_modal.footer_desktop_eID_text')}
          </Button>
        </div>
        <div className="flex items-center">
          <HorizontalDivider className="w-full" />
          <span className="px-6 text-p1">{t('verification_modal.footer_choice')}</span>
          <HorizontalDivider className="w-full" />
        </div>
        <Button
          variant="plain"
          endIcon={<ArrowRightIcon className="size-6" />}
          onPress={() => rest?.onOpenChange?.(false)}
          fullWidth
        >
          {t('verification_modal.footer_desktop_continue')}
        </Button>
      </div>
    </MessageModal>
  )
}

export default IdentityVerificationModal

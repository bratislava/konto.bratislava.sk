import { ErrorIcon } from '@assets/ui-icons'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { useQueryParamRedirect } from '../../frontend/hooks/useQueryParamRedirect'
import AccountMarkdown from '../forms/segments/AccountMarkdown/AccountMarkdown'
import AccountVerificationPendingAlert from '../forms/segments/AccountVerificationPendingAlert/AccountVerificationPendingAlert'
import Button from '../forms/simple-components/ButtonNew'
import { useVerifyEid, VerificationStatus } from './useVerifyEid'

const LegalPersonVerificationPageContent = () => {
  const { t } = useTranslation('account')
  const { redirect } = useQueryParamRedirect()

  const { loginWithEid, verificationStatus } = useVerifyEid()

  return verificationStatus === VerificationStatus.VERIFYING ? (
    <AccountVerificationPendingAlert
      title={t('auth.identity_verification.fop_po_eid.pending.title')}
      description={t('auth.identity_verification.fop_po_eid.pending.content')}
    />
  ) : verificationStatus === VerificationStatus.ERROR ? (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="mx-auto size-14 rounded-full bg-negative-100 p-4">
        <div className="flex size-6 items-center justify-center">
          <ErrorIcon className="size-6 text-negative-700" />
        </div>
      </div>
      <h1 className="text-center text-h3">
        {t('auth.identity_verification.fop_po_eid.error.title')}
      </h1>
      <AccountMarkdown
        className="text-center"
        content={t('auth.identity_verification.fop_po_eid.error.content')}
        variant="sm"
      />

      <Button variant="black-solid" onPress={() => redirect()} fullWidth>
        {t('auth.identity_verification.fop_po_eid.error.button_text')}
      </Button>
    </div>
  ) : (
    <div className="flex flex-col gap-4 md:gap-6">
      <h1 className="text-h3">{t('auth.identity_verification.fop_po_eid.init.title')}</h1>
      <AccountMarkdown
        variant="sm"
        content={t('auth.identity_verification.fop_po_eid.init.content')}
      />
      <Button
        variant="black-solid"
        onPress={loginWithEid}
        fullWidth
        isLoading={verificationStatus === VerificationStatus.REDIRECTING}
        isLoadingText={t('auth.identity_verification.fop_po_eid.init.redirecting_button_text')}
      >
        {t('auth.identity_verification.fop_po_eid.init.verify_button_text')}
      </Button>
      <Button variant="black-plain" fullWidth onPress={() => redirect()}>
        {t('auth.identity_verification.common.skip_verification_button_text')}
      </Button>
    </div>
  )
}

export default LegalPersonVerificationPageContent

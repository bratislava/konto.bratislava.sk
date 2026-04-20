import { Button } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'

import { ErrorIcon } from '@/src/assets/ui-icons'
import { useVerifyEid, VerificationStatus } from '@/src/components/auth-forms/useVerifyEid'
import AccountMarkdown from '@/src/components/formatting/AccountMarkdown'
import AccountSuccessAlert from '@/src/components/segments/AccountSuccessAlert/AccountSuccessAlert'
import { useQueryParamRedirect } from '@/src/frontend/hooks/useQueryParamRedirect'

type Props = {
  showSkipButton?: boolean
}

const LegalPersonVerificationPageContent = ({ showSkipButton = true }: Props) => {
  const { t } = useTranslation('account')
  const { redirect } = useQueryParamRedirect()

  const { loginWithEid, verificationStatus } = useVerifyEid()

  return verificationStatus === VerificationStatus.VERIFYING ? (
    <AccountSuccessAlert
      variant="loading"
      title={t('auth.identity_verification.fop_po_eid.pending.title')}
      description={t('auth.identity_verification.fop_po_eid.pending.content')}
    />
  ) : verificationStatus === VerificationStatus.ERROR ? (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="bg-negative-100 mx-auto size-14 rounded-full p-4">
        <div className="flex size-6 items-center justify-center">
          <ErrorIcon className="text-negative-700 size-6" />
        </div>
      </div>
      <h1 className="text-h3 text-center">
        {t('auth.identity_verification.fop_po_eid.error.title')}
      </h1>
      <AccountMarkdown
        className="text-center"
        content={t('auth.identity_verification.fop_po_eid.error.content')}
        variant="sm"
      />

      <Button variant="solid" onPress={() => redirect()} fullWidth>
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
        variant="solid"
        onPress={loginWithEid}
        fullWidth
        isLoading={verificationStatus === VerificationStatus.REDIRECTING}
        loadingText={t('auth.identity_verification.fop_po_eid.init.redirecting_button_text')}
      >
        {t('auth.identity_verification.fop_po_eid.init.verify_button_text')}
      </Button>
      {showSkipButton ? (
        <Button variant="plain" fullWidth onPress={() => redirect()}>
          {t('auth.identity_verification.common.skip_verification_button_text')}
        </Button>
      ) : null}
    </div>
  )
}

export default LegalPersonVerificationPageContent

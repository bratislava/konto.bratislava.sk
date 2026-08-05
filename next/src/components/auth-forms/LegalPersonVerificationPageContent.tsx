import { Button, Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'

import { useVerifyEid, VerificationStatus } from '@/src/components/auth-forms/useVerifyEid'
import Markdown from '@/src/components/formatting/Markdown'
import Icon from '@/src/components/icon-components/Icon'
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
      title={t('LegalPersonVerificationPageContent.pending.title')}
      description={t('LegalPersonVerificationPageContent.pending.content')}
    />
  ) : verificationStatus === VerificationStatus.ERROR ? (
    <div className="flex flex-col gap-4 lg:gap-6">
      <div className="mx-auto size-14 rounded-full bg-negative-100 p-4">
        <div className="flex size-6 items-center justify-center">
          <Icon name="error" className="size-6 text-negative-700" />
        </div>
      </div>
      <Typography variant="h3" as="h1" className="text-center">
        {t('LegalPersonVerificationPageContent.error.title')}
      </Typography>
      <Markdown
        variant="small"
        content={t('LegalPersonVerificationPageContent.error.content')}
        className="text-center"
      />

      <Button variant="solid" onPress={() => redirect()} fullWidth>
        {t('LegalPersonVerificationPageContent.error.closeButton')}
      </Button>
    </div>
  ) : (
    <div className="flex flex-col gap-4 lg:gap-6">
      <Typography variant="h3" as="h1">
        {t('LegalPersonVerificationPageContent.init.title')}
      </Typography>
      <Markdown variant="small" content={t('LegalPersonVerificationPageContent.init.content')} />
      <Button
        variant="solid"
        onPress={loginWithEid}
        fullWidth
        isLoading={verificationStatus === VerificationStatus.REDIRECTING}
        loadingText={t('LegalPersonVerificationPageContent.init.redirectingButton')}
      >
        {t('LegalPersonVerificationPageContent.init.verifyButton')}
      </Button>
      {showSkipButton ? (
        <Button variant="plain" fullWidth onPress={() => redirect()}>
          {t('auth.skipVerificationButton')}
        </Button>
      ) : null}
    </div>
  )
}

export default LegalPersonVerificationPageContent

import Button from 'components/forms/simple-components/Button'
import { ROUTES } from 'frontend/api/constants'
import { useServerSideAuth } from 'frontend/hooks/useServerSideAuth'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { useConditionalFormRedirects } from '../useFormRedirects'

const IdentityVerificationStatus = () => {
  const { isAuthenticated, tierStatus } = useServerSideAuth()
  const { t } = useTranslation('account')
  const router = useRouter()

  // we need to save the WIP of the open form if navigating away form it
  const optionalFormRedirectsContext = useConditionalFormRedirects()

  if (!isAuthenticated) return null

  return tierStatus.isIdentityVerified ? (
    <div className="flex rounded bg-success-100 px-2 py-0 lg:px-3 lg:py-1.5">
      <span className="text-p3-medium text-success-700">{t('verification_status_success')}</span>
    </div>
  ) : tierStatus.isIdentityVerificationNotYetAttempted ? (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-2 rounded bg-warning-100 px-2 py-0 lg:px-3 lg:py-1.5">
        <span className="text-p3-medium text-warning-700">{t('verification_status_required')}</span>
      </div>
      <Button
        className="hidden lg:flex"
        size="sm"
        onPress={() =>
          optionalFormRedirectsContext
            ? optionalFormRedirectsContext.verifyIdentity
            : router.push(ROUTES.IDENTITY_VERIFICATION)
        }
        variant="plain-black"
        text={t('verification_url_text')}
      />
    </div>
  ) : null
}

export default IdentityVerificationStatus

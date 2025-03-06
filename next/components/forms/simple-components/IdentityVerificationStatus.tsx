import Button from 'components/forms/simple-components/Button'
import { ROUTES } from 'frontend/api/constants'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { useSsrAuth } from '../../../frontend/hooks/useSsrAuth'
import { useConditionalFormRedirects } from '../useFormRedirects'

const IdentityVerificationStatus = () => {
  const { isSignedIn, tierStatus } = useSsrAuth()
  const { t } = useTranslation('account')
  const router = useRouter()

  // we need to save the WIP of the open form if navigating away form it
  const optionalFormRedirectsContext = useConditionalFormRedirects()

  if (!isSignedIn) return null
  if (tierStatus.isIdentityVerified)
    return (
      <div className="flex rounded-sm bg-success-100 px-2 py-0 lg:px-3 lg:py-1.5">
        <span className="text-p3-medium text-success-700">{t('verification_status_success')}</span>
      </div>
    )

  if (tierStatus.isIdentityVerificationNotYetAttempted || !tierStatus.isInQueue)
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-2 rounded-sm bg-warning-100 px-2 py-0 lg:px-3 lg:py-1.5">
          <span className="text-p3-medium text-warning-700">
            {t('verification_status_required')}
          </span>
        </div>
        <Button
          className="hidden lg:flex"
          size="sm"
          onPress={() =>
            optionalFormRedirectsContext
              ? optionalFormRedirectsContext.verifyIdentity()
              : router.push(ROUTES.IDENTITY_VERIFICATION)
          }
          variant="plain-black"
          text={t('verification_url_text')}
        />
      </div>
    )

  return null
}

export default IdentityVerificationStatus

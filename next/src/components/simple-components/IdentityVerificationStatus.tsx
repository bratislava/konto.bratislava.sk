import { Button, Typography } from '@bratislava/component-library'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'

import { useConditionalFormRedirects } from '@/src/components/forms/useFormRedirects'
import { useSsrAuth } from '@/src/frontend/hooks/useSsrAuth'
import { ROUTES } from '@/src/utils/routes'

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19549-21360
 * TODO use Tag component, remove duplicate code
 */

const IdentityVerificationStatus = () => {
  const { isSignedIn, tierStatus } = useSsrAuth()
  const { t } = useTranslation('account')
  const router = useRouter()

  // we need to save the WIP of the open form if navigating away form it
  const optionalFormRedirectsContext = useConditionalFormRedirects()

  if (!isSignedIn) {
    return null
  }

  if (tierStatus.isIdentityVerified)
    return (
      <div className="flex rounded-sm bg-success-100 px-2 py-0 lg:px-3 lg:py-1.5">
        <Typography variant="p-small" className="text-content-success-default">
          {t('IdentityVerificationStatus.verification_status_success')}
        </Typography>
      </div>
    )

  if (tierStatus.isInQueue)
    return (
      <div className="flex rounded-sm bg-warning-100 px-2 py-0 lg:px-3 lg:py-1.5">
        <Typography variant="p-small" className="text-content-warning-default">
          {t('IdentityVerificationStatus.verification_status_in_queue')}
        </Typography>
      </div>
    )

  if (tierStatus.isIdentityVerificationNotYetAttempted || tierStatus.isNotVerifiedIdentityCard)
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-2 rounded-sm bg-background-passive-secondary px-2 py-0 lg:px-3 lg:py-1.5">
          <Typography variant="p-small" className="text-content-passive-secondary">
            {t('IdentityVerificationStatus.verification_status_required')}
          </Typography>
        </div>
        <Button
          variant="plain"
          className="max-lg:hidden"
          size="small"
          onPress={() =>
            optionalFormRedirectsContext
              ? optionalFormRedirectsContext.verifyIdentity()
              : router.push(ROUTES.IDENTITY_VERIFICATION)
          }
        >
          {t('auth.verification_url_text')}
        </Button>
      </div>
    )

  return null
}

export default IdentityVerificationStatus

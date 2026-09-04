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
  const { t } = useTranslation()
  const router = useRouter()

  const { isSignedIn, tierStatus } = useSsrAuth()

  // we need to save the WIP of the open form if navigating away form it
  const optionalFormRedirectsContext = useConditionalFormRedirects()

  if (!isSignedIn) {
    return null
  }

  if (tierStatus.isIdentityVerified) {
    return (
      <div className="flex items-center rounded-sm bg-success-100 px-2 py-0 lg:px-3 lg:py-1.5">
        <Typography variant="p-small" className="text-content-success-default">
          {t('IdentityVerificationStatus.status.success')}
        </Typography>
      </div>
    )
  }

  if (tierStatus.isInQueue) {
    return (
      <div className="flex items-center rounded-sm bg-warning-100 px-2 py-0 lg:px-3 lg:py-1.5">
        <Typography variant="p-small" className="text-content-warning-default">
          {t('IdentityVerificationStatus.status.inQueue')}
        </Typography>
      </div>
    )
  }

  if (tierStatus.isIdentityVerificationNotYetAttempted || tierStatus.isNotVerifiedIdentityCard) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-2 rounded-sm bg-background-passive-secondary px-2 py-0 lg:px-3 lg:py-1.5">
          <Typography variant="p-small" className="text-content-passive-secondary">
            {t('IdentityVerificationStatus.status.required')}
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
          {t('auth.verifyIdentity')}
        </Button>
      </div>
    )
  }

  return null
}

export default IdentityVerificationStatus

import { useTranslation } from 'next-i18next/pages'

import Alert from '@/src/components/simple-components/Alert'
import { ROUTES } from '@/src/utils/routes'

type Props = {
  variant: 'verification-needed' | 'verification-in-process'
}

/**
 * TODO we already have similar components - IdentityVerificationStatus, IdentityVerificationBanner
 * - Maybe some tighter coupling will be benefitial
 * - Maybe put them into showcase close to eachother
 */

const IdentityVerificationAlert = ({ variant }: Props) => {
  const { t } = useTranslation('account')

  if (variant === 'verification-needed') {
    return (
      <Alert
        title={t('IdentityVerificationAlert.verification_needed.title')}
        message={t('IdentityVerificationAlert.verification_needed.message')}
        type="warning"
        buttons={[
          {
            title: t('auth.verification_url_text'),
            link: ROUTES.IDENTITY_VERIFICATION,
          },
        ]}
        fullWidth
      />
    )
  }

  if (variant === 'verification-in-process') {
    return (
      <Alert
        title={t('IdentityVerificationAlert.verification_in_process.title')}
        message={t('IdentityVerificationAlert.verification_in_process.message')}
        type="warning"
        fullWidth
      />
    )
  }

  return null
}

export default IdentityVerificationAlert

import Button from 'components/forms/simple-components/Button'
import { useServerSideAuth } from 'frontend/hooks/useServerSideAuth'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

const IdentityVerificationStatus = () => {
  const { tierStatus } = useServerSideAuth()
  const { t } = useTranslation('account')
  const router = useRouter()

  return tierStatus.isIdentityVerified ? (
    <div className="flex px-2 lg:px-3 py-0 lg:py-1.5 bg-success-100 rounded">
      <span className="text-p3-medium text-success-700">{t('verification_status_success')}</span>
    </div>
  ) : tierStatus.isIdentityVerificationNotYetAttempted ? (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-2 items-center px-2 lg:px-3 py-0 lg:py-1.5 bg-warning-100 rounded">
        <span className="text-p3-medium text-warning-700">{t('verification_status_required')}</span>
      </div>
      <Button
        className="hidden lg:flex"
        size="sm"
        onPress={() => router.push('/overenie-identity')}
        variant="plain-black"
        text={t('verification_url_text')}
      />
    </div>
  ) : null
}

export default IdentityVerificationStatus

import useAccount, { AccountStatus } from '@utils/useAccount'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'

const IdentityVerificationStatus = () => {
  const { status } = useAccount()
  const { t } = useTranslation('account')
  return status === AccountStatus.IdentityVerificationSuccess ? (
    <div className="flex px-2 lg:px-3 py-0 lg:py-1.5 bg-success-100 rounded">
      <span className="text-p3-medium text-success-700">{t('verification_status_success')}</span>
    </div>
  ) : (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-2 items-center px-2 lg:px-3 py-0 lg:py-1.5 bg-warning-100 rounded">
        <span className="text-p3-medium text-warning-700">{t('verification_status_required')}</span>
      </div>
      <Link href="/overenie-identity" className="text-p2-semibold hidden lg:flex py-1 px-2">
        Overiť identitu
      </Link>
    </div>
  )
}

export default IdentityVerificationStatus

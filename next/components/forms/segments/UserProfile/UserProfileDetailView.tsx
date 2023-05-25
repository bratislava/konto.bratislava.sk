import { useTranslation } from 'next-i18next'

import { UserData } from '../../../../frontend/hooks/useAccount'
import UserProfileDetailViewRow from './UserProfileDetailViewRow'

interface UserProfileDetailViewProps {
  userData: UserData
}

const postalCodeFormat = (code?: string): string => code ? `${code?.slice(0, 3)} ${code?.slice(3)}` : ''

const UserProfileDetailView = ({ userData }: UserProfileDetailViewProps) => {
  const { t } = useTranslation('account')
  const { account_type, name, given_name, family_name, email, phone_number, address } = userData
  const fullName = account_type === 'po' && name
    ? name
    : `${given_name ?? ''}${given_name && family_name ? ' ' : ''}${family_name ?? ''}`
  const fullAddress = address
    ? `${address.street_address || ''}${address.street_address && (address.postal_code || address.locality) ? ', ' : ''}
        ${postalCodeFormat(address.postal_code)}${address.postal_code ? ' ' : ''}
        ${address.locality || ''}`
    : ''
  const nameLabel = account_type === 'po' ? t('profile_detail.business_name') : t('profile_detail.full_name')

  return (
    <div className="flex flex-col grow gap-6">
      {/* <UserProfileDetailViewRow label={t('profile_detail.titles_before_name')} /> */}
      <UserProfileDetailViewRow label={nameLabel} value={fullName} />
      {/* <UserProfileDetailViewRow label={t('profile_detail.titles_after_name')} /> */}
      <UserProfileDetailViewRow
        label={t('profile_detail.email')}
        value={email}
        tooltip={t('profile_detail.email_tooltip')}
      />
      <UserProfileDetailViewRow label={t('profile_detail.phone_number')} value={phone_number} />
      <UserProfileDetailViewRow label={t('profile_detail.address')} value={fullAddress} />
    </div>
  )
}

export default UserProfileDetailView

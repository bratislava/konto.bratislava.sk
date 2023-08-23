import { AccountType, Address, UserData } from 'frontend/dtos/accountDto'
import useJsonParseMemo from 'frontend/hooks/useJsonParseMemo'
import { useTranslation } from 'next-i18next'

import UserProfileDetailViewRow from './UserProfileDetailViewRow'

interface UserProfileDetailViewProps {
  userData: UserData
}

const postalCodeFormat = (code?: string): string =>
  code ? `${code?.slice(0, 3)} ${code?.slice(3)}` : ''

const UserProfileDetailView = ({ userData }: UserProfileDetailViewProps) => {
  const { t } = useTranslation('account')
  const { name, given_name, family_name, email, phone_number, address } = userData
  const account_type = userData['custom:account_type']
  const parsedAddress = useJsonParseMemo<Address>(address)
  const fullName =
    account_type === AccountType.FyzickaOsoba
      ? `${given_name ?? ''}${given_name && family_name ? ' ' : ''}${family_name ?? ''}`
      : name
  const fullAddress = parsedAddress
    ? `${parsedAddress?.street_address || ''}${
        parsedAddress?.street_address && (parsedAddress?.postal_code || parsedAddress?.locality)
          ? ', '
          : ''
      }
        ${postalCodeFormat(parsedAddress?.postal_code)}${parsedAddress?.postal_code ? ' ' : ''}
        ${parsedAddress?.locality || ''}`
    : ''
  const nameLabel =
    account_type === AccountType.FyzickaOsoba
      ? t('profile_detail.full_name')
      : t('profile_detail.business_name')

  return (
    <div className="flex grow flex-col gap-6">
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

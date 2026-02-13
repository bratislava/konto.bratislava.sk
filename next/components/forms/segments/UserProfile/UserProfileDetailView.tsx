import { useTranslation } from 'next-i18next'

import UserProfileDetailViewRow from '@/components/forms/segments/UserProfile/UserProfileDetailViewRow'
import { AccountType, UserAttributes } from '@/frontend/dtos/accountDto'

type UserProfileDetailViewProps = {
  userAttributes: UserAttributes
}

// TODO: The phone_number and address are temporarily hidden. Remove completely if not used long-term.
const UserProfileDetailView = ({ userAttributes }: UserProfileDetailViewProps) => {
  const { t } = useTranslation('account')

  const {
    name,
    given_name,
    family_name,
    email,
    // phone_number,
    // address,
    'custom:account_type': account_type,
  } = userAttributes

  const isLegalEntity = account_type !== AccountType.FyzickaOsoba

  const nameLabel = isLegalEntity
    ? t('my_profile.profile_detail.business_name')
    : t('my_profile.profile_detail.full_name')

  const fullName = isLegalEntity
    ? (name ?? '')
    : [given_name, family_name].filter(Boolean).join(' ')

  // const parsedAddress = useJsonParseMemo<Address>(address)
  // // Example: Magistratna 1, 811 11 Bratislava
  // const fullAddress = parsedAddress
  //   ? [
  //       parsedAddress.street_address,
  //       `${formatZip(parsedAddress.postal_code)} ${parsedAddress.locality}`.trim(),
  //     ]
  //       .filter(Boolean)
  //       .join(', ')
  //   : ''

  return (
    <div className="flex grow flex-col gap-6">
      <UserProfileDetailViewRow label={nameLabel} value={fullName} />
      <UserProfileDetailViewRow label={t('my_profile.profile_detail.email')} value={email} />
      {/* <UserProfileDetailViewRow */}
      {/*   label={t('my_profile.profile_detail.phone_number')} */}
      {/*   value={phone_number} */}
      {/* /> */}
      {/* <UserProfileDetailViewRow */}
      {/*   label={t('my_profile.profile_detail.address')} */}
      {/*   value={fullAddress} */}
      {/* /> */}
    </div>
  )
}

export default UserProfileDetailView

import { Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { Fragment } from 'react/jsx-runtime'

import HorizontalDivider from '@/src/components/simple-components/HorizontalDivider'
import { AccountType, UserAttributes } from '@/src/frontend/dtos/accountDto'

type RowProps = {
  label: string
  value?: string | null
}

const Row = ({ label, value }: RowProps) => {
  const slugifiedLabel = `${label.replaceAll(' ', '-').toLowerCase()}-profile-row`
  const displayedValue = value && value !== '' ? value : '-'

  return (
    <li
      data-cy={slugifiedLabel}
      className="flex w-full flex-col gap-1 not-first:pt-4 not-last:pb-4 lg:flex-row lg:gap-4 lg:py-4 lg:*:w-1/2"
    >
      <Typography variant="p-small" as="span" className="font-semibold">
        {label}
      </Typography>
      <Typography variant="p-small" as="span" className="lg:break-normal">
        {displayedValue}
      </Typography>
    </li>
  )
}

type Props = {
  userAttributes: UserAttributes
}

const UserProfileDetailsView = ({ userAttributes }: Props) => {
  const { t } = useTranslation('account')

  const {
    name,
    given_name,
    family_name,
    email,
    'custom:account_type': account_type,
  } = userAttributes

  const isLegalEntity = account_type !== AccountType.FyzickaOsoba

  const nameLabel = isLegalEntity
    ? t('my_profile.profile_detail.business_name')
    : t('my_profile.profile_detail.full_name')

  const fullName = isLegalEntity
    ? (name ?? '')
    : [given_name, family_name].filter(Boolean).join(' ')

  const rows: RowProps[] = [
    {
      label: nameLabel,
      value: fullName,
    },
    {
      label: t('my_profile.profile_detail.email'),
      value: email,
    },
  ]

  return (
    <ul className="flex grow flex-col">
      {rows.map((row, index) => (
        <Fragment key={index}>
          {index > 0 && <HorizontalDivider asListItem />}
          <Row label={row.label} value={row.value} />
        </Fragment>
      ))}
    </ul>
  )
}

export default UserProfileDetailsView

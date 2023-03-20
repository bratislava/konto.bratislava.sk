import cx from 'classnames'
import { useTranslation } from 'next-i18next'
import UserConsent from './UserConsent'
import UserProfileSection from './UserProfileSection'
import UserProfileSectionHeader from './UserProfileSectionHeader'

export interface Consent {
  id: string
  title: string
  text: string
  isDisabled: boolean
  isSelected: boolean
}

interface UserProfileConsentsProps {
  allConsents: Consent[]
  onChange: (newConsents: Consent[]) => void
}

const UserProfileConsents = ({ allConsents, onChange }: UserProfileConsentsProps) => {
  const { t } = useTranslation('account')

  const handleOnChangeConsent = (isSelected: boolean, key: number) => {
    const newConsents: Consent[] = [...allConsents]
    newConsents[key].isSelected = isSelected
    onChange(newConsents)
  }

  return (
    <UserProfileSection>
      <UserProfileSectionHeader
        title={t('consents.title')}
        text={t('consents.text')}
        underline
        isMobileColumn
      />
      <div className={cx('px-4', 'md:px-8')}>
        {allConsents.map((consent: Consent, key: number) => (
          <UserConsent
            key={key}
            consent={consent}
            isLast={key === allConsents.length - 1}
            onChange={(isSelected) => handleOnChangeConsent(isSelected, key)}
          />
        ))}
      </div>
    </UserProfileSection>
  )
}

export default UserProfileConsents

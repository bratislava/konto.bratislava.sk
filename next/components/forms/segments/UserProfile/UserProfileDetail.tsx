import cx from 'classnames'
import Alert from 'components/forms/info-components/Alert'
import { UserAttributes } from 'frontend/dtos/accountDto'
import { useTranslation } from 'next-i18next'
import { useId } from 'react'

import { useSsrAuth } from '../../../../frontend/hooks/useSsrAuth'
import UserProfileDetailEdit from './UserProfileDetailEdit'
import UserProfileDetailsButtons from './UserProfileDetailsButtons'
import UserProfileDetailView from './UserProfileDetailView'
import UserProfilePhoto from './UserProfilePhoto'
import UserProfileSection from './UserProfileSection'
import UserProfileSectionHeader from './UserProfileSectionHeader'

interface UserProfileDetailProps {
  userAttributes?: UserAttributes | null
  isEditing?: boolean
  alertType: 'success' | 'error'
  isAlertOpened: boolean
  onChangeIsEditing: (isEditing: boolean) => void
  onCancelEditing: () => void
  onSubmit: (newUseData: UserAttributes) => void
  onEmailChange: () => void
}

const UserProfileDetail = (props: UserProfileDetailProps) => {
  const {
    userAttributes,
    isEditing,
    isAlertOpened,
    alertType,
    onChangeIsEditing,
    onCancelEditing,
    onSubmit,
    onEmailChange,
  } = props
  const { t } = useTranslation('account')
  const formId = `form-${useId()}`
  const { tierStatus } = useSsrAuth()

  const handleOnSubmit = (newUserData: UserAttributes) => {
    onSubmit({
      ...newUserData,
      phone_number: newUserData.phone_number?.replace(' ', ''),
    })
  }

  return (
    <div
      className={cx('flex flex-col bg-white pt-3', 'md:static md:z-0', {
        'fixed inset-0 z-50': isEditing,
      })}
    >
      {!tierStatus.isIdentityVerified && (
        <div className="flex w-full items-center justify-center bg-white p-3 md:px-8 md:py-3">
          <div className="md:max-w-screen-lg">
            <Alert
              title={t('verification_status_required')}
              message={t('verification_status_required_alert')}
              type="warning"
              buttons={[
                {
                  title: t('verification_url_text'),
                  link: '/overenie-identity',
                },
              ]}
              fullWidth
            />
          </div>
        </div>
      )}
      <UserProfileSection>
        <UserProfileSectionHeader
          title={t('profile_detail.title')}
          text={t('profile_detail.text')}
          isEditing={isEditing}
          underline
          mainHeader
        >
          <UserProfileDetailsButtons
            formId={formId}
            isEditing={isEditing}
            onChangeIsEditing={onChangeIsEditing}
            onCancelEditing={onCancelEditing}
          />
        </UserProfileSectionHeader>
        <div className="flex flex-col">
          {/* Alert only for alertType === error */}
          {isAlertOpened && (
            <div className="p-2">
              <Alert
                fullWidth
                type={alertType}
                solid
                message={t(`profile_detail.${alertType}_alert`)}
              />
            </div>
          )}
          <div
            className={cx('flex flex-col gap-8 p-4', 'md:flex-row md:flex-wrap md:gap-16 md:p-8')}
          >
            <div className={cx({ 'hidden md:block': isEditing })}>
              <UserProfilePhoto userAttributes={userAttributes ?? {}} />
            </div>
            {isEditing ? (
              <UserProfileDetailEdit
                formId={formId}
                userAttributes={userAttributes ?? {}}
                onEmailChange={onEmailChange}
                onSubmit={handleOnSubmit}
              />
            ) : (
              <UserProfileDetailView userAttributes={userAttributes ?? {}} />
            )}
          </div>
        </div>
      </UserProfileSection>
    </div>
  )
}

export default UserProfileDetail

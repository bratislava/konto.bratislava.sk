import cx from 'classnames'
import Alert from 'components/forms/info-components/Alert'
import { UserData } from 'frontend/dtos/accountDto'
import { useTranslation } from 'next-i18next'
import { useId } from 'react'

import UserProfileDetailEdit from './UserProfileDetailEdit'
import UserProfileDetailsButtons from './UserProfileDetailsButtons'
import UserProfileDetailView from './UserProfileDetailView'
import UserProfilePhoto from './UserProfilePhoto'
import UserProfileSection from './UserProfileSection'
import UserProfileSectionHeader from './UserProfileSectionHeader'

interface UserProfileDetailProps {
  userData?: UserData | null
  isEditing?: boolean
  alertType: 'success' | 'error'
  isAlertOpened: boolean
  onChangeIsEditing: (isEditing: boolean) => void
  onCancelEditing: () => void
  onSubmit: (newUseData: UserData) => void
  onOpenEmailModal: () => void
}

const UserProfileDetail = (props: UserProfileDetailProps) => {
  const {
    userData,
    isEditing,
    isAlertOpened,
    alertType,
    onChangeIsEditing,
    onCancelEditing,
    onSubmit,
    onOpenEmailModal,
  } = props
  const { t } = useTranslation('account')
  const formId = `form-${useId()}`

  const handleOnSubmit = (newUserData: UserData) => {
    onSubmit({
      ...newUserData,
      phone_number: newUserData.phone_number?.replace(' ', ''),
    })
  }

  return (
    <div
      className={cx(' flex flex-col', 'md:static md:z-0', {
        'fixed inset-0 z-50': isEditing,
      })}
    >
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
              <UserProfilePhoto userData={userData ?? {}} />
            </div>
            {isEditing ? (
              <UserProfileDetailEdit
                formId={formId}
                userData={userData ?? {}}
                onOpenEmailModal={onOpenEmailModal}
                onSubmit={handleOnSubmit}
              />
            ) : (
              <UserProfileDetailView userData={userData ?? {}} />
            )}
          </div>
        </div>
      </UserProfileSection>
    </div>
  )
}

export default UserProfileDetail

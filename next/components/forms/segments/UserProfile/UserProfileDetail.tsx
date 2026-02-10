import { useTranslation } from 'next-i18next'
import { useId } from 'react'

import Alert from '@/components/forms/info-components/Alert'
import UserProfileDetailEdit from '@/components/forms/segments/UserProfile/UserProfileDetailEdit'
import UserProfileDetailsButtons from '@/components/forms/segments/UserProfile/UserProfileDetailsButtons'
import UserProfileDetailView from '@/components/forms/segments/UserProfile/UserProfileDetailView'
import UserProfilePhoto from '@/components/forms/segments/UserProfile/UserProfilePhoto'
import UserProfileSection from '@/components/forms/segments/UserProfile/UserProfileSection'
import UserProfileSectionHeader from '@/components/forms/segments/UserProfile/UserProfileSectionHeader'
import cn from '@/frontend/cn'
import { UserAttributes } from '@/frontend/dtos/accountDto'
import { useSsrAuth } from '@/frontend/hooks/useSsrAuth'

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

  const translationMap = {
    success: t('my_profile.profile_detail.success_snackbar_message'),
    error: t('my_profile.profile_detail.error_snackbar_message'),
  } satisfies Record<UserProfileDetailProps['alertType'], string>

  return (
    <div
      className={cn('flex flex-col bg-white pt-3 md:static md:z-0', {
        'fixed inset-0 top-(--main-scroll-top-margin) z-50': isEditing,
      })}
    >
      {!tierStatus.isIdentityVerified && (
        <div className="flex w-full items-center justify-center bg-white p-3 md:px-8 md:py-3">
          <div className="md:max-w-(--breakpoint-lg)">
            <Alert
              title={t('IdentityVerificationStatus.verification_status_required')}
              message={t('IdentityVerificationStatus.verification_status_required_alert')}
              type="warning"
              buttons={[
                {
                  title: t('auth.verification_url_text'),
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
          title={t('my_profile.profile_detail.title')}
          text={t('my_profile.profile_detail.text')}
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
              <Alert fullWidth type={alertType} solid message={translationMap[alertType]} />
            </div>
          )}
          <div
            className={cn('flex flex-col gap-8 p-4', 'md:flex-row md:flex-wrap md:gap-16 md:p-8')}
          >
            <div className={cn({ 'hidden md:block': isEditing })}>
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

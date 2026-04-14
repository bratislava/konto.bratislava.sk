import { useTranslation } from 'next-i18next/pages'
import { useId } from 'react'

import SectionContainer from '@/src/components/layouts/SectionContainer'
import BoxedSection from '@/src/components/page-contents/UserProfilePageContent/BoxedSection'
import BoxedSectionHeader from '@/src/components/page-contents/UserProfilePageContent/BoxedSectionHeader'
import UserProfileDetailEdit from '@/src/components/page-contents/UserProfilePageContent/UserProfileDetailEdit'
import UserProfileDetailsButtons from '@/src/components/page-contents/UserProfilePageContent/UserProfileDetailsButtons'
import UserProfileDetailView from '@/src/components/page-contents/UserProfilePageContent/UserProfileDetailView'
import UserProfilePhoto from '@/src/components/page-contents/UserProfilePageContent/UserProfilePhoto'
import Alert from '@/src/components/simple-components/Alert'
import { UserAttributes } from '@/src/frontend/dtos/accountDto'
import { useSsrAuth } from '@/src/frontend/hooks/useSsrAuth'
import cn from '@/src/utils/cn'

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
        'fixed inset-0 top-(--main-scroll-top-margin) z-50 overflow-y-auto': isEditing,
      })}
    >
      {/* TODO: Proper positioning of edit view. Now, alert is hidden to show edit view on top of the page, otherwise is was pushed down.  */}
      {!tierStatus.isIdentityVerified && !isEditing && (
        <SectionContainer className="py-3">
          <div className="flex items-center justify-center">
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
        </SectionContainer>
      )}
      <BoxedSection>
        <BoxedSectionHeader
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
        </BoxedSectionHeader>
        <div className="flex flex-col">
          {/* Alert only for alertType === error */}
          {isAlertOpened && (
            <div className="py-2">
              <Alert fullWidth type={alertType} solid message={translationMap[alertType]} />
            </div>
          )}
          <div className="flex flex-col gap-8 py-4 md:flex-row md:flex-wrap md:gap-16 md:p-8">
            <UserProfilePhoto userAttributes={userAttributes ?? {}} />
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
      </BoxedSection>
    </div>
  )
}

export default UserProfileDetail

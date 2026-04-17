import { Button } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'

import { EditIcon } from '@/src/assets/ui-icons'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import IdentityVerificationAlert from '@/src/components/page-contents/UserProfilePageContent/UserProfileDetails/IdentityVerificationAlert'
import UserProfileDetailsEdit from '@/src/components/page-contents/UserProfilePageContent/UserProfileDetails/UserProfileDetailsEdit'
import UserProfileDetailsPhoto from '@/src/components/page-contents/UserProfilePageContent/UserProfileDetails/UserProfileDetailsPhoto'
import UserProfileDetailsView from '@/src/components/page-contents/UserProfilePageContent/UserProfileDetails/UserProfileDetailsView'
import { useUserProfileDetails } from '@/src/components/page-contents/UserProfilePageContent/UserProfileDetails/useUserProfileDetails'
import HorizontalDivider from '@/src/components/simple-components/HorizontalDivider'
import IdentityVerificationStatus from '@/src/components/simple-components/IdentityVerificationStatus'

const UserProfileDetails = () => {
  const { t } = useTranslation('account')

  const { formId, isEditing, setIsEditing, userAttributes, tierStatus, handleSubmitEditing } =
    useUserProfileDetails()

  return (
    <SectionContainer>
      <div className="border-border-passive-primary w-full rounded-lg border">
        <div className="flex flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex flex-col gap-2">
              <div className="flex gap-3">
                <h2 className="text-h5">{t('my_profile.profile_detail.title')}</h2>
                {tierStatus.isIdentityVerified && <IdentityVerificationStatus />}
              </div>
              <p className="text-p2">{t('my_profile.profile_detail.text')}</p>
            </div>
            {isEditing ? (
              <div className="flex items-center gap-6 lg:flex-row-reverse">
                <Button
                  variant="solid"
                  type="submit"
                  form={formId}
                  data-cy="save-personal-information-button"
                >
                  {t('my_profile.profile_detail.save_changes_button')}
                </Button>
                <Button variant="plain" onPress={() => setIsEditing(false)}>
                  {t('my_profile.profile_detail.discard_changes_button')}
                </Button>
              </div>
            ) : (
              <Button
                variant="solid"
                startIcon={<EditIcon />}
                onPress={() => setIsEditing(true)}
                data-cy="edit-personal-information-button"
              >
                {t('my_profile.profile_detail.edit_button')}
              </Button>
            )}
          </div>
          {!tierStatus.isIdentityVerified ? (
            tierStatus.isInQueue ? (
              <IdentityVerificationAlert variant="verification-in-process" />
            ) : (
              <IdentityVerificationAlert variant="verification-needed" />
            )
          ) : null}
        </div>
        <HorizontalDivider />
        <div className="flex flex-col gap-8 px-4 py-6 lg:flex-row lg:gap-16 lg:px-6">
          <UserProfileDetailsPhoto userAttributes={userAttributes ?? {}} />
          {isEditing ? (
            <UserProfileDetailsEdit
              formId={formId}
              userAttributes={userAttributes ?? {}}
              onSubmit={handleSubmitEditing}
            />
          ) : (
            <UserProfileDetailsView userAttributes={userAttributes ?? {}} />
          )}
        </div>
      </div>
    </SectionContainer>
  )
}

export default UserProfileDetails

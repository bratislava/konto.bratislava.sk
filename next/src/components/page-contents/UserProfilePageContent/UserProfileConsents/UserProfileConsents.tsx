import { useTranslation } from 'next-i18next/pages'
import { ConsentEnum } from 'openapi-clients/city-account'

import SectionContainer from '@/src/components/layouts/SectionContainer'
import UserProfileConsentsItem from '@/src/components/page-contents/UserProfilePageContent/UserProfileConsents/UserProfileConsentsItem'
import useToast from '@/src/components/simple-components/Toast/useToast'
import { useGdprConsent } from '@/src/frontend/hooks/useUser'

const UserProfileConsents = () => {
  const { t } = useTranslation('account')
  const { showToast } = useToast()

  const { isGranted, changeConsent, consentChangePending } = useGdprConsent(ConsentEnum.Marketing)

  const handleOnChangeConsent = async (newValue: boolean) => {
    if (consentChangePending) {
      return
    }

    await changeConsent(newValue, {
      onSuccess: () => {
        showToast({
          message: newValue
            ? t('UserProfileConsents.successOnSnackbarMessage')
            : t('UserProfileConsents.successOffSnackbarMessage'),
          variant: 'success',
        })
      },
      onError: () => {
        showToast({ message: t('UserProfileConsents.errorSnackbarMessage'), variant: 'error' })
      },
    })
  }

  return (
    <SectionContainer>
      <div className="rounded-lg border border-border-passive-primary p-4 lg:p-6">
        <UserProfileConsentsItem
          consent={{
            id: 'receive_information',
            title: t('UserProfileConsents.receiveInformation.title'),
            text: t('UserProfileConsents.receiveInformation.text'),
            isDisabled: consentChangePending,
            isSelected: isGranted,
          }}
          onChange={handleOnChangeConsent}
        />
      </div>
    </SectionContainer>
  )
}

export default UserProfileConsents

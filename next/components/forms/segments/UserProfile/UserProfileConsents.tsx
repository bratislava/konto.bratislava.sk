import {
  GdprDataDtoCategoryEnum,
  GdprDataDtoTypeEnum,
  ResponseGdprUserDataDtoSubTypeEnum,
} from '@clients/openapi-city-account'
import cx from 'classnames'
import { useTranslation } from 'next-i18next'

import useSnackbar from '../../../../frontend/hooks/useSnackbar'
import { useUserV2 } from '../../../../frontend/hooks/useUserV2'
import UserConsent from './UserConsent'
import UserProfileSection from './UserProfileSection'
import UserProfileSectionHeader from './UserProfileSectionHeader'

const UserProfileConsents = () => {
  const { t } = useTranslation('account')
  const {
    userData,
    taxesMarketingSubscribe,
    taxesMarketingUnsubscribe,
    taxesMarketingUnsubscribeIsPending,
    taxesMarketingSubscribeIsPending,
  } = useUserV2()

  const [openSnackbarSuccess] = useSnackbar({ variant: 'success' })
  const [openSnackbarError] = useSnackbar({ variant: 'error' })

  const isSelected =
    userData?.gdprData.some(
      ({ category, type, subType }) =>
        category === GdprDataDtoCategoryEnum.Taxes &&
        type === GdprDataDtoTypeEnum.Marketing &&
        subType === ResponseGdprUserDataDtoSubTypeEnum.Subscribe,
    ) ?? false

  const isDisabled =
    !userData || taxesMarketingSubscribeIsPending || taxesMarketingUnsubscribeIsPending

  const handleOnChangeConsent = async (isSelected: boolean) => {
    if (isDisabled) {
      return
    }

    const mutation = isSelected ? taxesMarketingSubscribe : taxesMarketingUnsubscribe
    await mutation(undefined, {
      onSuccess: () => {
        openSnackbarSuccess(t('profile_detail.success_alert'), 3000)
      },
      onError: () => {
        openSnackbarError(t('profile_detail.error_alert'))
      },
    })
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
        <UserConsent
          consent={{
            id: 'receive_information',
            title: t('consents.receive_information.title'),
            text: t('consents.receive_information.text'),
            isDisabled,
            isSelected,
          }}
          isLast
          onChange={handleOnChangeConsent}
        />
      </div>
    </UserProfileSection>
  )
}

export default UserProfileConsents

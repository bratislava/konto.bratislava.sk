import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'next-i18next/pages'
import {
  SetDeliveryMethodPreferenceDtoDeliveryMethodEnum,
  UserOfficialCorrespondenceChannelEnum,
} from 'openapi-clients/city-account'

import { cityAccountClient } from '@/src/clients/city-account'
import { userQueryKey, useUser } from '@/src/frontend/hooks/useUser'

/**
 * In this hook we rename 'official correspondence channel' to 'delivery method'
 * to ensure more consistency in other components and with backends
 */
export const useGetDeliveryMethod = () => {
  const { t } = useTranslation('account')

  const { userData } = useUser()

  if (
    !('officialCorrespondenceChannel' in userData) ||
    !('showEmailCommunicationBanner' in userData) ||
    !('hasChangedDeliveryMethodAfterDeadline' in userData)
  ) {
    throw new Error('This hook must be only used when the user is a physical person.')
  }

  const {
    officialCorrespondenceChannel,
    showEmailCommunicationBanner,
    hasChangedDeliveryMethodAfterDeadline,
  } = userData

  const deliveryMethodEffectiveInCurrentYear = hasChangedDeliveryMethodAfterDeadline
    ? UserOfficialCorrespondenceChannelEnum.Postal
    : officialCorrespondenceChannel

  const canUserChangeDeliveryMethod =
    officialCorrespondenceChannel !== UserOfficialCorrespondenceChannelEnum.Edesk

  const deliveryMethodLabel = officialCorrespondenceChannel
    ? {
        [UserOfficialCorrespondenceChannelEnum.Email]: t('useGetDeliveryMethod.email'),
        [UserOfficialCorrespondenceChannelEnum.Postal]: t('useGetDeliveryMethod.postal'),
        [UserOfficialCorrespondenceChannelEnum.Edesk]: t('useGetDeliveryMethod.edesk'),
      }[officialCorrespondenceChannel]
    : null

  return {
    deliveryMethod: officialCorrespondenceChannel,
    deliveryMethodEffectiveInCurrentYear,
    deliveryMethodLabel,
    hasUserChangedDeliveryMethodAfterDeadline: hasChangedDeliveryMethodAfterDeadline,
    canUserChangeDeliveryMethod,
    showDeliveryMethodNeededBanner: showEmailCommunicationBanner,
  }
}

export const useChangeDeliveryMethod = () => {
  const queryClient = useQueryClient()

  const { mutateAsync: changeDeliveryMethod, isPending: deliveryMethodChangePending } = useMutation(
    {
      mutationFn: (deliveryMethod: SetDeliveryMethodPreferenceDtoDeliveryMethodEnum) =>
        cityAccountClient.userControllerSetDeliveryMethodPreference(
          { deliveryMethod },
          { authStrategy: 'authOnly' },
        ),
      onSuccess: () => queryClient.refetchQueries({ queryKey: userQueryKey }),
      networkMode: 'always',
    },
  )

  return {
    changeDeliveryMethod,
    deliveryMethodChangePending,
  }
}

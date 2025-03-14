import { UserOfficialCorrespondenceChannelEnum } from 'openapi-clients/city-account'

import { useUser } from '../../../../../frontend/hooks/useUser'

export const useTaxChannel = () => {
  const { userData } = useUser()

  if (
    !('officialCorrespondenceChannel' in userData) ||
    !('showEmailCommunicationBanner' in userData) ||
    !('wasVerifiedBeforeTaxDeadline' in userData)
  ) {
    throw new Error('This hook must be only used when the user is a physical person.')
  }

  const {
    officialCorrespondenceChannel,
    showEmailCommunicationBanner,
    wasVerifiedBeforeTaxDeadline,
  } = userData

  const channelChangeEffectiveNextYear =
    !wasVerifiedBeforeTaxDeadline &&
    officialCorrespondenceChannel === UserOfficialCorrespondenceChannelEnum.Email
  const channelCurrentYearEffective = channelChangeEffectiveNextYear
    ? UserOfficialCorrespondenceChannelEnum.Postal
    : officialCorrespondenceChannel
  const canChangeChannel =
    officialCorrespondenceChannel !== UserOfficialCorrespondenceChannelEnum.Edesk

  return {
    channel: officialCorrespondenceChannel,
    showEmailCommunicationBanner,
    canChangeChannel,
    channelChangeEffectiveNextYear,
    channelCurrentYearEffective,
  }
}

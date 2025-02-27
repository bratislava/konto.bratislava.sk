import { UserOfficialCorrespondenceChannelEnum } from 'openapi-clients/city-account'

import { useUser } from '../../../../../frontend/hooks/useUser'

export const useTaxChannel = () => {
  const {
    userData: {
      officialCorrespondenceChannel,
      showEmailCommunicationBanner,
      wasVerifiedBeforeTaxDeadline,
    },
  } = useUser()

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

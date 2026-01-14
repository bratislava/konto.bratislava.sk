import { useUser } from 'frontend/hooks/useUser'
import { UserOfficialCorrespondenceChannelEnum } from 'openapi-clients/city-account'

export const useOfficialCorrespondenceChannel = () => {
  const { userData } = useUser()

  if (
    !('officialCorrespondenceChannel' in userData) ||
    !('showEmailCommunicationBanner' in userData)
  ) {
    throw new Error('This hook must be only used when the user is a physical person.')
  }

  const {
    officialCorrespondenceChannel,
    showEmailCommunicationBanner,
  } = userData

  // TODO: this logic is only considering user that recently verified their birth number, but it should be considering user that was verified before
  // TODO: Move this logic to BE
  // https://github.com/bratislava/private-konto.bratislava.sk/issues/1029

  const isChannelChangeEffectiveNextYear = UserOfficialCorrespondenceChannelEnum.Email

  const channelEffectiveInCurrentYear = isChannelChangeEffectiveNextYear
    ? UserOfficialCorrespondenceChannelEnum.Postal
    : officialCorrespondenceChannel

  const canUserChangeChannel =
    officialCorrespondenceChannel !== UserOfficialCorrespondenceChannelEnum.Edesk

  return {
    channel: officialCorrespondenceChannel,
    channelEffectiveInCurrentYear,
    isChannelChangeEffectiveNextYear,
    canUserChangeChannel,
    showChannelNeededBanner: showEmailCommunicationBanner,
  }
}

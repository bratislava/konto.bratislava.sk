import { useUser } from 'frontend/hooks/useUser'
import { UserOfficialCorrespondenceChannelEnum } from 'openapi-clients/city-account'

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
    showEmailCommunicationBanner: showDeliveryMethodNotSetBanner,
    wasVerifiedBeforeTaxDeadline,
  } = userData

  // TODO: this logic is only considering user that recently verified their birth number, but it should be considering user that was verified before
  // TODO: Move this logic to BE
  // https://github.com/bratislava/private-konto.bratislava.sk/issues/1029
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
    showDeliveryMethodNotSetBanner,
    canChangeChannel,
    channelChangeEffectiveNextYear,
    channelCurrentYearEffective,
  }
}

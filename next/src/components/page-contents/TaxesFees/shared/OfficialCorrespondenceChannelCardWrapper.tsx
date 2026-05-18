import { Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { UserOfficialCorrespondenceChannelEnum } from 'openapi-clients/city-account'

import Markdown from '@/src/components/formatting/Markdown'
import Icon from '@/src/components/icon-components/Icon'
import { useOfficialCorrespondenceChannel } from '@/src/components/page-contents/TaxesFees/useOfficialCorrespondenceChannel'
import cn from '@/src/utils/cn'
import { ROUTES } from '@/src/utils/routes'

// TODO unify with TaxesFeesAdministratorCardWrapper

const OfficialCorrespondenceChannelCardWrapper = () => {
  const { t } = useTranslation('account')
  const { channel, canUserChangeChannel } = useOfficialCorrespondenceChannel()

  if (!channel) {
    return null
  }

  // TODO this is repeated 3 time in the codebase, we should move this logic to separate function
  const title = {
    [UserOfficialCorrespondenceChannelEnum.Email]: t('taxes.communication_channel.email'),
    [UserOfficialCorrespondenceChannelEnum.Postal]: t('taxes.communication_channel.postal'),
    [UserOfficialCorrespondenceChannelEnum.Edesk]: t('taxes.communication_channel.edesk'),
  }[channel]

  return (
    <div className="flex flex-col gap-4">
      <Typography variant="h5" as="h2">
        {/* TODO current behaviour is confusing, but it is requested by Zdenko,
            it is showing currently set delivery method, not the one for the year of this tax.
            IMHO if this is currently set delivery method, it should be shown in grey area
            or if it's for the year of this tax, it should be shown with same year as in title? */}
        {t('taxes.communication_channel.info_title', { year: new Date().getFullYear() })}
      </Typography>
      <div
        className={cn('flex w-full grow justify-between gap-4 rounded-lg border px-4 py-3 lg:p-5')}
      >
        <div className="flex w-full items-start justify-between gap-4">
          <div className="flex flex-col">
            <Typography variant="p-large">{title}</Typography>
            {canUserChangeChannel && (
              <div className="pt-3 pb-2 lg:px-0">
                <Markdown
                  variant="small"
                  content={`${t('taxes.communication_channel.info.youCanChangeChannelOnThisPage', {
                    url: ROUTES.TAXES_AND_FEES,
                  })} \n ${t('taxes.communication_channel.info.youCanPayOnThisPage')}`}
                />
              </div>
            )}
          </div>
          <div className="rounded-lg bg-gray-100 p-3 max-lg:hidden">
            <Icon name="mail" className="size-6" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default OfficialCorrespondenceChannelCardWrapper

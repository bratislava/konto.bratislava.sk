import { MailIcon } from '@assets/ui-icons'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import { useOfficialCorrespondenceChannel } from 'components/forms/segments/AccountSections/TaxesFees/useOfficialCorrespondenceChannel'
import { ROUTES } from 'frontend/api/constants'
import cn from 'frontend/cn'
import { useTranslation } from 'next-i18next'
import { UserOfficialCorrespondenceChannelEnum } from 'openapi-clients/city-account'
import React from 'react'

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
    <div className="flex flex-1 flex-col gap-4">
      <h2 className="text-h5-semibold">
        {/* TODO: current behaviour is confusing, but it is requested by Zdenko,
            it is showing currently set delivery method, not the one for the year of this tax.
            IMHO if this is currently set delivery method, it should be shown in grey area
            or if it's for the year of this tax, it should be shown with same year as in title? */}
        {t('taxes.communication_channel.info_title', { year: new Date().getFullYear() })}
      </h2>
      <div
        className={cn(
          'flex w-full items-center justify-between gap-4 rounded-lg border-2 border-gray-200 p-5 lg:p-5',
        )}
      >
        <div className="flex w-full items-start justify-between gap-4">
          <div className="flex flex-col">
            <span className="block text-p1-semibold">{title}</span>
            {canUserChangeChannel && (
              <div className="pt-3 pb-2 lg:px-0">
                <AccountMarkdown
                  content={`${t('taxes.communication_channel.info.youCanChangeChannelOnThisPage', {
                    url: ROUTES.TAXES_AND_FEES,
                  })} <br /> ${t('taxes.communication_channel.info.youCanPayOnThisPage')}`}
                  // variant added to change text size on mobile devices,
                  // not the best solution but this problem needs more complex solution across whole project
                  variant="statusBar"
                />
              </div>
            )}
          </div>
          <div className="rounded-lg bg-gray-100 p-3">
            <MailIcon className="size-6" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default OfficialCorrespondenceChannelCardWrapper

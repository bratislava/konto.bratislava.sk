import { MailIcon } from '@assets/ui-icons'
import { ROUTES } from 'frontend/api/constants'
import cn from 'frontend/cn'
import { useTranslation } from 'next-i18next'
import { UserOfficialCorrespondenceChannelEnum } from 'openapi-clients/city-account'
import React from 'react'

import AccountMarkdown from '../../AccountMarkdown/AccountMarkdown'
import { useTaxChannel } from './useTaxChannel'

const TaxesFeesDeliveryMethodInfoCard = () => {
  const { t } = useTranslation('account')
  const { channel, canChangeChannel } = useTaxChannel()

  if (!channel) {
    return null
  }

  // TODO this is repeated 3 time in the codebase, we should move this logic to separate function
  const type = {
    [UserOfficialCorrespondenceChannelEnum.Email]: t('communication_channel.email'),
    [UserOfficialCorrespondenceChannelEnum.Postal]: t('communication_channel.postal'),
    [UserOfficialCorrespondenceChannelEnum.Edesk]: t('communication_channel.edesk'),
  }[channel]

  return (
    <div
      className={cn(
        'flex w-full items-center justify-between gap-4 rounded-lg lg:border-2 lg:border-gray-200 lg:p-4 lg:p-5',
      )}
    >
      <div className="flex w-full items-start justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex flex-col gap-1">
            {/* TODO: check with Zdenko if this should show delivery method for year of this tax or currently set delivery method, 
            also this is confusing bit is showing currently set delivery method, not the one for the year of this tax and why does it even show this information,
            if this is currently set delivery method, it should be show in grey area or if it's for the year of this tax, it should be show with same year as in title in figma? */}
            {/* <span className="text-p2">
              {t('communication_channel_info_title', { year: taxData.year })}
            </span> */}
            <span className="hidden text-p1-semibold lg:block">{type}</span>
          </div>
          {canChangeChannel && (
            <div className="pt-3 pb-5 lg:px-0 lg:pb-2">
              <AccountMarkdown
                content={`${t('communication_channel_info_change_link_text', {
                  url: ROUTES.TAXES_AND_FEES,
                })}`}
                // variant added to change text size on mobile devices,
                // not the best solution but this problem needs more complex solution across whole project
                variant="statusBar"
              />
            </div>
          )}
        </div>
        <div className="hidden rounded-lg bg-gray-100 p-3 sm:block">
          <MailIcon className="size-6" />
        </div>
      </div>
    </div>
  )
}

export default TaxesFeesDeliveryMethodInfoCard

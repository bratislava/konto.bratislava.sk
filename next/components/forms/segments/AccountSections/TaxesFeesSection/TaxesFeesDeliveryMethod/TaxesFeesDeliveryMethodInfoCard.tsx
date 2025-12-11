import { MailIcon } from '@assets/ui-icons'
import { ROUTES } from 'frontend/api/constants'
import cn from 'frontend/cn'
import { useTranslation } from 'next-i18next'
import { UserOfficialCorrespondenceChannelEnum } from 'openapi-clients/city-account'
import React from 'react'

import AccountMarkdown from '../../../AccountMarkdown/AccountMarkdown'
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
        'flex w-full items-center justify-between gap-4 rounded-lg border-2 border-gray-200 p-5 lg:p-5',
      )}
    >
      <div className="flex w-full items-start justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex flex-col gap-1">
            <span className="block text-p1-semibold">{type}</span>
          </div>
          {canChangeChannel && (
            <div className="pt-3 pb-2 lg:px-0">
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
        <div className="block rounded-lg bg-gray-100 p-3">
          <MailIcon className="size-6" />
        </div>
      </div>
    </div>
  )
}

export default TaxesFeesDeliveryMethodInfoCard

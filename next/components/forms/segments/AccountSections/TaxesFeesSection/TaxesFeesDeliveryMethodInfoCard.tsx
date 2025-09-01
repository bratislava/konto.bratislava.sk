import { MailIcon } from '@assets/ui-icons'
import { ROUTES } from 'frontend/api/constants'
import { useTranslation } from 'next-i18next'
import { UserOfficialCorrespondenceChannelEnum } from 'openapi-clients/city-account'
import React from 'react'

import AccountMarkdown from '../../AccountMarkdown/AccountMarkdown'
import { useTaxChannel } from './useTaxChannel'
import { useTaxFeeSection } from './useTaxFeeSection'

const TaxesFeesDeliveryMethodInfoCard = () => {
  const { taxData } = useTaxFeeSection()
  const { t } = useTranslation('account')
  const { channel, canChangeChannel } = useTaxChannel()

  if (!channel) {
    return null
  }

  const type = {
    [UserOfficialCorrespondenceChannelEnum.Email]: t('communication_channel.email'),
    [UserOfficialCorrespondenceChannelEnum.Postal]: t('communication_channel.postal'),
    [UserOfficialCorrespondenceChannelEnum.Edesk]: t('communication_channel.edesk'),
  }[channel]

  return (
    <div className="flex w-full items-center justify-between gap-4 rounded-lg border-2 border-gray-200 p-4 lg:p-5">
      <div className="flex w-full items-start justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex flex-col gap-1">
            <span className="text-p2">
              {/* check with Zdenko if this should show delivery method for year of this tax or currently set delivery method */}
              {t('communication_channel_info_title', { year: taxData.year })}
            </span>
            <span className="text-p1-semibold">{type}</span>
          </div>
          {canChangeChannel && (
            <div>
              <AccountMarkdown
                content={`<div className='text-p2'>${t(
                  'communication_channel_info_change_link_text',
                  {
                    url: ROUTES.TAXES_AND_FEES,
                  },
                )}</div>`}
                variant="sm"
                className="mx-auto w-full max-w-(--breakpoint-lg) px-4 pt-3 pb-5 md:px-8 md:pt-4 md:pb-6 lg:px-0"
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

import { MailIcon } from '@assets/ui-icons'
import { ROUTES } from 'frontend/api/constants'
import cn from 'frontend/cn'
import { useTranslation } from 'next-i18next'
import { UserOfficialCorrespondenceChannelEnum } from 'openapi-clients/city-account'
import React from 'react'

import AccountMarkdown from '../../AccountMarkdown/AccountMarkdown'
import { useTaxChannel } from './useTaxChannel'
import { useTaxFeeSection } from './useTaxFeeSection'

type TaxesFeesDeliveryMethodInfoCardProps = {
  addBorder?: boolean
  withTitle?: boolean
}

const TaxesFeesDeliveryMethodInfoCard = ({
  addBorder = false,
  withTitle = true,
}: TaxesFeesDeliveryMethodInfoCardProps) => {
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
    <div
      className={cn('flex w-full items-center justify-between gap-4 rounded-lg lg:p-5', {
        'border-2 border-gray-200 p-4': addBorder,
        'border-none': !addBorder,
      })}
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
            {withTitle && <span className="text-p1-semibold">{type}</span>}
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
                className={cn('mx-auto w-full pt-3 pr-4 pb-5 lg:px-0 lg:py-2', {
                  'px-4': addBorder,
                })}
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

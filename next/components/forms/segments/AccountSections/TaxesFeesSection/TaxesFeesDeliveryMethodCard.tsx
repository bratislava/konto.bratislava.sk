import { Castle48PxIcon } from '@assets/ui-icons'
import { useTranslation } from 'next-i18next'
import { UserOfficialCorrespondenceChannelEnum } from 'openapi-clients/city-account'
import React from 'react'

import ButtonNew from '../../../simple-components/ButtonNew'
import { useTaxChannel } from './useTaxChannel'

type TaxesFeesDeliveryMethodCardProps = {
  onDeliveryMethodChange: () => void
}

const TaxesFeesDeliveryMethodCard = ({
  onDeliveryMethodChange,
}: TaxesFeesDeliveryMethodCardProps) => {
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
      <div className="flex items-center gap-4">
        <div className="hidden rounded-lg border-2 border-gray-200 p-3 sm:block">
          {/* TODO: Icon */}
          <Castle48PxIcon className="size-6 text-main-700" />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            {/* TODO: Translations */}
            <span className="text-p2">Spôsob doručovania daní a poplatkov</span>
            <span className="text-p1-semibold">{type}</span>
          </div>
        </div>
      </div>
      {canChangeChannel && (
        <div>
          <ButtonNew onPress={onDeliveryMethodChange} variant="black-link">
            {/* TODO: Translations */}
            Zmeniť
          </ButtonNew>
        </div>
      )}
    </div>
  )
}

export default TaxesFeesDeliveryMethodCard

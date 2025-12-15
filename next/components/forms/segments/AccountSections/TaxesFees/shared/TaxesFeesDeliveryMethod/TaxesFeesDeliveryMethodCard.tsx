import { MailIcon, SettingsIcon } from '@assets/ui-icons'
import { useTaxChannel } from 'components/forms/segments/AccountSections/TaxesFees/useTaxChannel'
import ButtonNew from 'components/forms/simple-components/ButtonNew'
import { useTranslation } from 'next-i18next'
import { UserOfficialCorrespondenceChannelEnum } from 'openapi-clients/city-account'
import React from 'react'

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

  // TODO this is repeated 3 time in the codebase, we should move this logic to separate function
  const type = {
    [UserOfficialCorrespondenceChannelEnum.Email]: t('taxes.communication_channel.email'),
    [UserOfficialCorrespondenceChannelEnum.Postal]: t('taxes.communication_channel.postal'),
    [UserOfficialCorrespondenceChannelEnum.Edesk]: t('taxes.communication_channel.edesk'),
  }[channel]

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="hidden rounded-lg bg-gray-100 p-3 sm:block">
          <MailIcon className="size-6 text-main-700" />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-p2">{t('taxes.communication_channel.title')}</span>
            <span className="text-p1-semibold">{type}</span>
          </div>
        </div>
      </div>
      {canChangeChannel && (
        <div>
          <ButtonNew
            onPress={onDeliveryMethodChange}
            variant="black-link"
            startIcon={<SettingsIcon />}
          >
            {t('taxes.communication_channel.change_button')}
          </ButtonNew>
        </div>
      )}
    </div>
  )
}

export default TaxesFeesDeliveryMethodCard

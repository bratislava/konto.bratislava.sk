import AccordionV2 from 'components/forms/simple-components/AccordionV2'
import { useTranslation } from 'next-i18next'
import { UserOfficialCorrespondenceChannelEnum } from 'openapi-clients/city-account'
import React from 'react'

import TaxesFeesDeliveryMethodInfoCard from './TaxesFeesDeliveryMethodInfoCard'
import { useTaxChannel } from './useTaxChannel'

const TaxesFeesDeliveryMethodInfoCardWrapper = () => {
  const { t } = useTranslation('account')
  const { channel } = useTaxChannel()

  if (!channel) {
    return null
  }

  const type = {
    [UserOfficialCorrespondenceChannelEnum.Email]: t('communication_channel.email'),
    [UserOfficialCorrespondenceChannelEnum.Postal]: t('communication_channel.postal'),
    [UserOfficialCorrespondenceChannelEnum.Edesk]: t('communication_channel.edesk'),
  }[channel]

  return (
    <div className="flex flex-1 flex-col gap-4">
      <h2 className="text-h5-semibold">{t('account_section_payment.delivery_method')}</h2>
      <div className="block lg:hidden">
        <AccordionV2 title={type}>
          <TaxesFeesDeliveryMethodInfoCard withTitle={false} />
        </AccordionV2>
      </div>
      <div className="hidden lg:block">
        <TaxesFeesDeliveryMethodInfoCard addBorder />
      </div>
    </div>
  )
}

export default TaxesFeesDeliveryMethodInfoCardWrapper

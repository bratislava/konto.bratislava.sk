import { useTranslation } from 'next-i18next'
import React from 'react'

import TaxesFeesDeliveryMethodInfoCard from './TaxesFeesDeliveryMethodInfoCard'
import { useTaxChannel } from './useTaxChannel'

const TaxesFeesDeliveryMethodInfoCardWrapper = () => {
  const { t } = useTranslation('account')
  const { channel } = useTaxChannel()

  if (!channel) {
    return null
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <h2 className="text-h5-semibold">
        {/* TODO: current behaviour is confusing, but it is requested by Zdenko,
            it is showing currently set delivery method, not the one for the year of this tax.
            IMHO if this is currently set delivery method, it should be shown in grey area
            or if it's for the year of this tax, it should be shown with same year as in title? */}
        {t('taxes.communication_channel.info_title', { year: new Date().getFullYear() })}
      </h2>
      <TaxesFeesDeliveryMethodInfoCard />
    </div>
  )
}

export default TaxesFeesDeliveryMethodInfoCardWrapper

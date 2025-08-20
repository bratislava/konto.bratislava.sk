import React from 'react'

import cn from '../../../../../frontend/cn'
import TaxesChannelChangeEffectiveNextYearAlert from './TaxesChannelChangeEffectiveNextYearAlert'
import TaxesFeesDeliveryMethodBanner from './TaxesFeesDeliveryMethodBanner'
import TaxesFeesDeliveryMethodCard from './TaxesFeesDeliveryMethodCard'
import TaxesFeesTaxAdministratorCard from './TaxesFeesTaxAdministratorCard'
import { useStrapiTax } from './useStrapiTax'
import { useTaxChannel } from './useTaxChannel'
import { useTaxFeesSection } from './useTaxFeesSection'

const TaxesFeesCards = () => {
  const { taxesData, strapiTaxAdministrator, setOfficialCorrespondenceChannelModalOpen } =
    useTaxFeesSection()
  const strapiTax = useStrapiTax()
  const { showEmailCommunicationBanner, channelChangeEffectiveNextYear } = useTaxChannel()

  const wrapperStyle = cn('flex flex-col gap-4', {
    'lg:flex-row': !showEmailCommunicationBanner,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className={wrapperStyle}>
        {showEmailCommunicationBanner && (
          <TaxesFeesDeliveryMethodBanner
            onDeliveryMethodChange={() => setOfficialCorrespondenceChannelModalOpen(true)}
          />
        )}
        {!showEmailCommunicationBanner && (
          <TaxesFeesDeliveryMethodCard
            onDeliveryMethodChange={() => setOfficialCorrespondenceChannelModalOpen(true)}
          />
        )}
        <TaxesFeesTaxAdministratorCard
          beTaxAdministrator={taxesData.taxAdministrator}
          strapiTaxAdministrator={strapiTaxAdministrator}
        />
      </div>
      {channelChangeEffectiveNextYear && (
        <TaxesChannelChangeEffectiveNextYearAlert strapiTax={strapiTax} />
      )}
    </div>
  )
}

export default TaxesFeesCards

import React from 'react'

import cn from '../../../../../frontend/cn'
import { AccountType } from '../../../../../frontend/dtos/accountDto'
import { useSsrAuth } from '../../../../../frontend/hooks/useSsrAuth'
import TaxesChannelChangeEffectiveNextYearAlert from './TaxesChannelChangeEffectiveNextYearAlert'
import TaxesFeesDeliveryMethodBanner from './TaxesFeesDeliveryMethodBanner'
import TaxesFeesDeliveryMethodCard from './TaxesFeesDeliveryMethodCard'
import TaxesFeesTaxAdministratorCard from './TaxesFeesTaxAdministratorCard'
import { useStrapiTax } from './useStrapiTax'
import { useTaxChannel } from './useTaxChannel'
import { useTaxFeesSection } from './useTaxFeesSection'

const TaxesFeesCards = () => {
  const { accountType } = useSsrAuth()
  const { taxAdministrator, setOfficialCorrespondenceChannelModalOpen } = useTaxFeesSection()
  const strapiTax = useStrapiTax()
  const displayTaxAdministratorCard =
    taxAdministrator !== null && accountType === AccountType.FyzickaOsoba
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
        {displayTaxAdministratorCard && (
          <TaxesFeesTaxAdministratorCard taxAdministrator={taxAdministrator} />
        )}
      </div>
      {channelChangeEffectiveNextYear && (
        <TaxesChannelChangeEffectiveNextYearAlert strapiTax={strapiTax} />
      )}
    </div>
  )
}

export default TaxesFeesCards

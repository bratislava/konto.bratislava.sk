import { UserOfficialCorrespondenceChannelEnum } from '@clients/openapi-city-account'
import cx from 'classnames'
import React from 'react'

import { environment } from '../../../../../environment'
import { AccountType } from '../../../../../frontend/dtos/accountDto'
import { useSsrAuth } from '../../../../../frontend/hooks/useSsrAuth'
import { useUser } from '../../../../../frontend/hooks/useUser'
import TaxesFeesDeliveryMethodBanner from './TaxesFeesDeliveryMethodBanner'
import TaxesFeesDeliveryMethodCard from './TaxesFeesDeliveryMethodCard'
import TaxesFeesDeliveryMethodDelayed from './TaxesFeesDeliveryMethodDelayed'
import TaxesFeesTaxAdministratorCard from './TaxesFeesTaxAdministratorCard'
import { useTaxFeesSection } from './useTaxFeesSection'

const TaxesFeesCards = () => {
  const { userData } = useUser()
  const { accountType } = useSsrAuth()
  const { taxAdministrator, setOfficialCorrespondenceChannelModalOpen } = useTaxFeesSection()
  const displayTaxAdministratorCard =
    taxAdministrator !== null && accountType === AccountType.FyzickaOsoba
  const displayDeliveryMethodBanner =
    environment.featureToggles.taxReportDeliveryMethod && userData.showEmailCommunicationBanner
  const displayDeliveryMethodCard =
    environment.featureToggles.taxReportDeliveryMethod && !displayDeliveryMethodBanner
  const displayDeliveryMethodDelayed =
    environment.featureToggles.taxReportDeliveryMethod &&
    !userData.wasVerifiedBeforeTaxDeadline &&
    userData.officialCorrespondenceChannel === UserOfficialCorrespondenceChannelEnum.Email

  if (!displayTaxAdministratorCard && !displayDeliveryMethodCard && !displayDeliveryMethodBanner) {
    return null
  }

  const wrapperStyle = cx('flex flex-col gap-4', {
    'lg:flex-row': !displayDeliveryMethodBanner,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className={wrapperStyle}>
        {displayDeliveryMethodBanner && (
          <TaxesFeesDeliveryMethodBanner
            onDeliveryMethodChange={() => setOfficialCorrespondenceChannelModalOpen(true)}
          />
        )}
        {displayDeliveryMethodCard && (
          <TaxesFeesDeliveryMethodCard
            onDeliveryMethodChange={() => setOfficialCorrespondenceChannelModalOpen(true)}
          />
        )}
        {displayTaxAdministratorCard && (
          <TaxesFeesTaxAdministratorCard taxAdministrator={taxAdministrator} />
        )}
      </div>
      {displayDeliveryMethodDelayed && <TaxesFeesDeliveryMethodDelayed />}
    </div>
  )
}

export default TaxesFeesCards

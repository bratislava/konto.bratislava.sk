import { StrapiTaxAdministrator } from '@backend/utils/tax-administrator'
import { ResponseGetTaxesDto } from '@clients/openapi-tax'
import cx from 'classnames'
import React from 'react'

import { environment } from '../../../../../environment'
import { AccountType } from '../../../../../frontend/dtos/accountDto'
import { useSsrAuth } from '../../../../../frontend/hooks/useSsrAuth'
import TaxesFeesDeliveryMethodBanner from './TaxesFeesDeliveryMethodBanner'
import TaxesFeesDeliveryMethodCard from './TaxesFeesDeliveryMethodCard'
import TaxesFeesTaxAdministratorCard from './TaxesFeesTaxAdministratorCard'

type TaxesFeesCardsProps = {
  taxesData: ResponseGetTaxesDto
  taxAdministrator: StrapiTaxAdministrator | null
}

const TaxesFeesCards = ({ taxAdministrator }: TaxesFeesCardsProps) => {
  const { accountType } = useSsrAuth()
  const displayTaxAdministratorCard =
    taxAdministrator !== null && accountType === AccountType.FyzickaOsoba
  const displayDeliveryMethodBanner = environment.featureToggles.taxReportDeliveryMethod // && TODO implement
  const displayDeliveryMethodCard =
    environment.featureToggles.taxReportDeliveryMethod && !displayDeliveryMethodBanner

  if (!displayTaxAdministratorCard && !displayDeliveryMethodCard && !displayDeliveryMethodBanner) {
    return null
  }

  const wrapperStyle = cx('flex flex-col gap-4', {
    'lg:flex-row': !displayDeliveryMethodBanner,
  })

  return (
    <div className={wrapperStyle}>
      {displayDeliveryMethodBanner && <TaxesFeesDeliveryMethodBanner />}
      {displayDeliveryMethodCard && <TaxesFeesDeliveryMethodCard />}
      {displayTaxAdministratorCard && (
        <TaxesFeesTaxAdministratorCard taxAdministrator={taxAdministrator} />
      )}
    </div>
  )
}

export default TaxesFeesCards

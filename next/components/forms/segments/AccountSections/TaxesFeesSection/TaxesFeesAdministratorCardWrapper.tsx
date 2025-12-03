import { StrapiTaxAdministrator } from '@backend/utils/strapi-tax-administrator'
import { useTranslation } from 'next-i18next'
import { ResponseTaxAdministratorDto } from 'openapi-clients/tax'
import React from 'react'

import TaxesFeesTaxAdministratorCard from './TaxesFeesTaxAdministratorCard'

type TaxesFeesTaxAdministratorCardWrapperProps = {
  beTaxAdministrator: ResponseTaxAdministratorDto | null
  strapiTaxAdministrator: StrapiTaxAdministrator | null
  withTitle?: boolean
  removeBorder?: boolean
}

const TaxesFeesAdministratorCardWrapper = ({
  beTaxAdministrator,
  strapiTaxAdministrator,
}: TaxesFeesTaxAdministratorCardWrapperProps) => {
  const { t } = useTranslation('account')

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-h5-semibold">{t('account_section_payment.your_tax_administrator')}</h2>
      <TaxesFeesTaxAdministratorCard
        beTaxAdministrator={beTaxAdministrator}
        strapiTaxAdministrator={strapiTaxAdministrator}
      />
    </div>
  )
}

export default TaxesFeesAdministratorCardWrapper

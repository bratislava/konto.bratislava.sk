import { useTranslation } from 'next-i18next'
import React from 'react'

import TaxesFeesTaxAdministratorCard from './TaxesFeesTaxAdministratorCard'
import { useTaxFeesSection } from './useTaxFeesSection'

const TaxesFeesAdministratorCardWrapper = () => {
  const { t } = useTranslation('account')
  const { taxesData, strapiTaxAdministrator } = useTaxFeesSection()

  if (!taxesData) {
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-h5-semibold">{t('account_section_payment.tax_administrator')}</h2>
      <TaxesFeesTaxAdministratorCard
        withTitle={false}
        beTaxAdministrator={taxesData.taxAdministrator}
        strapiTaxAdministrator={strapiTaxAdministrator}
      />
    </div>
  )
}

export default TaxesFeesAdministratorCardWrapper

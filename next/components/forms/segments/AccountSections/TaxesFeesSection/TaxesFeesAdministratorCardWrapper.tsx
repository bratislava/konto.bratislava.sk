import { StrapiTaxAdministrator } from '@backend/utils/strapi-tax-administrator'
import AccordionV2 from 'components/forms/simple-components/AccordionV2'
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
      <h2 className="text-h5-semibold">{t('account_section_payment.tax_administrator')}</h2>
      <div className="block lg:hidden">
        <AccordionV2 title={beTaxAdministrator?.name}>
          <TaxesFeesTaxAdministratorCard
            beTaxAdministrator={beTaxAdministrator}
            strapiTaxAdministrator={strapiTaxAdministrator}
            removeBorder
          />
        </AccordionV2>
      </div>
      <div className="hidden lg:block">
        <TaxesFeesTaxAdministratorCard
          beTaxAdministrator={beTaxAdministrator}
          strapiTaxAdministrator={strapiTaxAdministrator}
          withTitle={false}
        />
      </div>
    </div>
  )
}

export default TaxesFeesAdministratorCardWrapper

import { ResponseTaxAdministratorDto, TaxType } from 'openapi-clients/tax'

import { StrapiTaxAdministrator } from '@/src/backend/utils/strapi-tax-administrator'

export type TaxAdministrator = {
  name: string
  phone: string
  email: string
}

/**
 * Resolves tax administrator unifying both backend and Bratislava-Strapi shapes:
 * - backend administrator takes precedence
 * - bratislava-strapi administrator is only used as a fallback for property tax (DzN)
 * - TODO implement correct administrator for communal waste fee (KO)
 */
export const resolveTaxAdministrator = ({
  taxType,
  backendTaxAdministrator,
  strapiTaxAdministrator,
}: {
  taxType: TaxType
  backendTaxAdministrator: ResponseTaxAdministratorDto | null
  strapiTaxAdministrator: StrapiTaxAdministrator | null
}): TaxAdministrator | null => {
  if (backendTaxAdministrator) {
    return {
      name: backendTaxAdministrator.name,
      phone: backendTaxAdministrator.phoneNumber,
      email: backendTaxAdministrator.email,
    }
  }

  if (taxType === TaxType.Dzn && strapiTaxAdministrator) {
    return {
      name: strapiTaxAdministrator.name,
      phone: strapiTaxAdministrator.phone,
      email: strapiTaxAdministrator.email,
    }
  }

  return null
}

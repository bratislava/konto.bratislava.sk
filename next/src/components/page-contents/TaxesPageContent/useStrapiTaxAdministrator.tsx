import { createContext, PropsWithChildren, useContext } from 'react'

import { StrapiTaxAdministrator } from '@/src/backend/utils/strapi-tax-administrator'

type StrapiTaxAdministratorProviderProps = {
  strapiTaxAdministrator: StrapiTaxAdministrator | null
}

const StrapiTaxAdministratorContext = createContext<StrapiTaxAdministrator | null | undefined>(
  undefined,
)

export const StrapiTaxAdministratorProvider = ({
  strapiTaxAdministrator,
  children,
}: PropsWithChildren<StrapiTaxAdministratorProviderProps>) => (
  <StrapiTaxAdministratorContext.Provider value={strapiTaxAdministrator}>
    {children}
  </StrapiTaxAdministratorContext.Provider>
)

export const useStrapiTaxAdministrator = () => {
  const context = useContext(StrapiTaxAdministratorContext)
  if (context === undefined) {
    throw new Error(
      'useStrapiTaxAdministrator must be used within a StrapiTaxAdministratorProvider',
    )
  }

  return context
}

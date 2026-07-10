import React, { createContext, PropsWithChildren, useContext } from 'react'

import { MunicipalChargeConfigFragment } from '@/src/clients/graphql-strapi/api'

type StrapiTaxConfigProviderProps = {
  strapiTaxConfig: MunicipalChargeConfigFragment | null | undefined
}

const StrapiTaxConfigContext = createContext<MunicipalChargeConfigFragment | null | undefined>(
  undefined,
)

export const StrapiTaxConfigProvider = ({
  strapiTaxConfig,
  children,
}: PropsWithChildren<StrapiTaxConfigProviderProps>) => (
  <StrapiTaxConfigContext.Provider value={strapiTaxConfig}>
    {children}
  </StrapiTaxConfigContext.Provider>
)

export const useStrapiTaxConfig = () => {
  const context = useContext(StrapiTaxConfigContext)
  if (!context) {
    throw new Error('useStrapiTaxConfig must be used within a StrapiTaxConfigProvider')
  }

  return context
}

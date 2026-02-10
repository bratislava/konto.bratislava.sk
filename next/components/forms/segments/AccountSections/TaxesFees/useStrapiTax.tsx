import React, { createContext, PropsWithChildren, useContext } from 'react'

import { TaxFragment } from '@/clients/graphql-strapi/api'

type StrapiTaxProviderProps = {
  strapiTax: TaxFragment | null | undefined
}

const StrapiTaxContext = createContext<TaxFragment | null | undefined>(undefined)

export const StrapiTaxProvider = ({
  strapiTax,
  children,
}: PropsWithChildren<StrapiTaxProviderProps>) => (
  <StrapiTaxContext.Provider value={strapiTax}>{children}</StrapiTaxContext.Provider>
)

export const useStrapiTax = () => {
  const context = useContext(StrapiTaxContext)
  if (!context) {
    throw new Error('useStrapiTax must be used within a StrapiTaxProvider')
  }
  return context
}

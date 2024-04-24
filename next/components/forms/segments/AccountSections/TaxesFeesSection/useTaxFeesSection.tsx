import { StrapiTaxAdministrator } from '@backend/utils/tax-administrator'
import { ResponseGetTaxesDto } from '@clients/openapi-tax'
import React, { createContext, PropsWithChildren, useContext } from 'react'

type TaxFeesSectionProviderProps = {
  taxesData: ResponseGetTaxesDto
  taxAdministrator: StrapiTaxAdministrator | null
}

const useGetContext = ({ taxesData, taxAdministrator }: TaxFeesSectionProviderProps) => {
  return { taxesData, taxAdministrator }
}

const TaxFeesSectionContext = createContext<ReturnType<typeof useGetContext> | undefined>(undefined)

export const TaxFeesSectionProvider = ({
  children,
  ...rest
}: PropsWithChildren<TaxFeesSectionProviderProps>) => {
  const context = useGetContext(rest)

  return <TaxFeesSectionContext.Provider value={context}>{children}</TaxFeesSectionContext.Provider>
}

export const useTaxFeesSection = () => {
  const context = useContext(TaxFeesSectionContext)
  if (!context) {
    throw new Error('useTaxFeesSection must be used within a TaxFeesSectionProvider')
  }

  return context
}

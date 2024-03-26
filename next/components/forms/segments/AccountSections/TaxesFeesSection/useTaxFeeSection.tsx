import { ResponseTaxDto } from '@clients/openapi-tax'
import React, { createContext, PropsWithChildren, useContext } from 'react'

type TaxFeeSectionProviderProps = {
  taxData: ResponseTaxDto
}

const useGetContext = ({ taxData }: TaxFeeSectionProviderProps) => {
  return { taxData }
}

const TaxFeeSectionContext = createContext<ReturnType<typeof useGetContext> | undefined>(undefined)

export const TaxFeeSectionProvider = ({
  children,
  ...rest
}: PropsWithChildren<TaxFeeSectionProviderProps>) => {
  const context = useGetContext(rest)

  return <TaxFeeSectionContext.Provider value={context}>{children}</TaxFeeSectionContext.Provider>
}

export const useTaxFeeSection = () => {
  const context = useContext(TaxFeeSectionContext)
  if (!context) {
    throw new Error('useTaxFeeSection must be used within a TaxFeeSectionProvider')
  }

  return context
}

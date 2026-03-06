import React, { createContext, PropsWithChildren, useContext } from 'react'

import { AccountTaxesFeesPageProps } from '@/src/pages/dane-a-poplatky'

type TaxesFeesProviderProps = Pick<
  AccountTaxesFeesPageProps,
  'taxesData' | 'strapiTaxAdministrator'
>

const useGetContext = ({ taxesData, strapiTaxAdministrator }: TaxesFeesProviderProps) => {
  return {
    taxesData,
    strapiTaxAdministrator,
  }
}

const TaxesFeesContext = createContext<ReturnType<typeof useGetContext> | undefined>(undefined)

export const TaxesFeesProvider = ({
  children,
  ...rest
}: PropsWithChildren<TaxesFeesProviderProps>) => {
  const context = useGetContext(rest)

  return <TaxesFeesContext.Provider value={context}>{children}</TaxesFeesContext.Provider>
}

export const useTaxesFees = () => {
  const context = useContext(TaxesFeesContext)
  if (!context) {
    throw new Error('useTaxesFees must be used within a TaxesFeesProvider')
  }

  return context
}

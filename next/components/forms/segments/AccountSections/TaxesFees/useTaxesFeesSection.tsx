import { AccountTaxesFeesPageProps } from 'pages/dane-a-poplatky'
import React, { createContext, PropsWithChildren, useContext } from 'react'

type TaxesFeesSectionProviderProps = Pick<
  AccountTaxesFeesPageProps,
  'taxesData' | 'strapiTaxAdministrator'
>

const useGetContext = ({ taxesData, strapiTaxAdministrator }: TaxesFeesSectionProviderProps) => {
  return {
    taxesData,
    strapiTaxAdministrator,
  }
}

const TaxesFeesSectionContext = createContext<ReturnType<typeof useGetContext> | undefined>(
  undefined,
)

export const TaxesFeesSectionProvider = ({
  children,
  ...rest
}: PropsWithChildren<TaxesFeesSectionProviderProps>) => {
  const context = useGetContext(rest)

  return (
    <TaxesFeesSectionContext.Provider value={context}>{children}</TaxesFeesSectionContext.Provider>
  )
}

export const useTaxesFeesSection = () => {
  const context = useContext(TaxesFeesSectionContext)
  if (!context) {
    throw new Error('useTaxesFeesSection must be used within a TaxesFeesSectionProvider')
  }

  return context
}

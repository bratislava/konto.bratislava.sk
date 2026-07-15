import { createContext, PropsWithChildren, useContext } from 'react'

import { TaxesPageProps } from '@/src/pages/dane-a-poplatky'

type TaxesDataProviderProps = Pick<TaxesPageProps, 'taxesData'>

const TaxesDataContext = createContext<TaxesPageProps['taxesData'] | undefined>(undefined)

export const TaxesDataProvider = ({
  taxesData,
  children,
}: PropsWithChildren<TaxesDataProviderProps>) => (
  <TaxesDataContext.Provider value={taxesData}>{children}</TaxesDataContext.Provider>
)

export const useTaxesData = () => {
  const context = useContext(TaxesDataContext)
  if (!context) {
    throw new Error('useTaxesData must be used within a TaxesDataProvider')
  }

  return context
}

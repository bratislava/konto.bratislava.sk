import { StrapiTaxAdministrator } from '@backend/utils/strapi-tax-administrator'
import { ResponseGetTaxesDto } from 'openapi-clients/tax'
import React, { createContext, PropsWithChildren, useContext, useState } from 'react'

type TaxFeesSectionProviderProps = {
  taxesData: ResponseGetTaxesDto
  strapiTaxAdministrator: StrapiTaxAdministrator | null
}

const useGetContext = ({ taxesData, strapiTaxAdministrator }: TaxFeesSectionProviderProps) => {
  const [officialCorrespondenceChannelModalOpen, setOfficialCorrespondenceChannelModalOpen] =
    useState(false)

  return {
    taxesData,
    strapiTaxAdministrator,
    officialCorrespondenceChannelModalOpen,
    setOfficialCorrespondenceChannelModalOpen,
  }
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

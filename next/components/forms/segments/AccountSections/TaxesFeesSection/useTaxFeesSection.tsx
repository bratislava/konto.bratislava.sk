import { StrapiTaxAdministrator } from '@backend/utils/tax-administrator'
import { TaxFragment } from '@clients/graphql-strapi/api'
import { ResponseGetTaxesDto } from 'openapi-clients/tax'
import React, { createContext, PropsWithChildren, useContext, useState } from 'react'

type TaxFeesSectionProviderProps = {
  taxesData: ResponseGetTaxesDto
  taxAdministrator: StrapiTaxAdministrator | null
  strapiTax: TaxFragment
}

const useGetContext = ({ taxesData, taxAdministrator, strapiTax }: TaxFeesSectionProviderProps) => {
  const [officialCorrespondenceChannelModalOpen, setOfficialCorrespondenceChannelModalOpen] =
    useState(false)

  return {
    taxesData,
    taxAdministrator,
    strapiTax,
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

import { StrapiTaxAdministrator } from '@backend/utils/tax-administrator'
import { TaxFragment } from '@clients/graphql-strapi/api'
import { taxClient } from '@clients/tax'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { ResponseTaxDto } from 'openapi-clients/tax'
import React, { createContext, PropsWithChildren, useContext, useState } from 'react'

import useSnackbar from '../../../../../frontend/hooks/useSnackbar'
import { base64ToArrayBuffer, downloadBlob } from '../../../../../frontend/utils/general'
import logger from '../../../../../frontend/utils/logger'

type TaxFeeSectionProviderProps = {
  taxData: ResponseTaxDto
  taxAdministrator: StrapiTaxAdministrator | null
  strapiTax: TaxFragment
}

const useGetContext = ({ taxData, strapiTax, taxAdministrator }: TaxFeeSectionProviderProps) => {
  const [officialCorrespondenceChannelModalOpen, setOfficialCorrespondenceChannelModalOpen] =
    useState(false)

  const router = useRouter()
  const [openSnackbarError] = useSnackbar({ variant: 'error' })
  const [openSnackbarInfo, closeSnackbarInfo] = useSnackbar({ variant: 'info' })

  const { mutate: redirectToPayment, isPending: redirectToPaymentIsPending } = useMutation({
    mutationFn: () =>
      taxClient.paymentControllerPayment(String(taxData.year), {
        accessToken: 'always',
      }),
    networkMode: 'always',
    onSuccess: async (response) => {
      closeSnackbarInfo()
      await router.push(response.data.url)
    },
    onMutate: () => {
      // TODO: Translation
      openSnackbarInfo('Presmerovávam na platbu.')
    },
    onError: (error) => {
      // TODO: Translation
      openSnackbarError('Nepodarilo sa presmerovať na platbu.')
      logger.error(error)
    },
  })

  const downloadQrCode = async () => {
    if (!taxData.qrCodeWeb) return
    const arrayBuffer = base64ToArrayBuffer(taxData.qrCodeWeb)
    downloadBlob(new Blob([arrayBuffer], { type: 'image/png' }), 'QR-dan-z-nehnutelnosti.png')
  }

  const downloadPdf = async () => {
    const { data } = await taxClient.taxControllerGetTaxByYearPdf(taxData.year, {
      accessToken: 'always',
      responseType: 'blob',
    })
    // @ts-expect-error `taxControllerGetTaxByYearPdf` returns wrong type
    downloadBlob(data as Blob, `Dan-z-nehnutelnosti-${taxData.year}.pdf`)
  }

  return {
    taxData,
    strapiTax,
    redirectToPayment,
    redirectToPaymentIsPending,
    downloadQrCode,
    downloadPdf,
    officialCorrespondenceChannelModalOpen,
    setOfficialCorrespondenceChannelModalOpen,
    taxAdministrator,
  }
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

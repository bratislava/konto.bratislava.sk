import { ResponseTaxDto } from '@clients/openapi-tax'
import { taxApi } from '@clients/tax'
import { useRouter } from 'next/router'
import React, { createContext, PropsWithChildren, useContext } from 'react'

import useSnackbar from '../../../../../frontend/hooks/useSnackbar'
import { base64ToArrayBuffer, downloadBlob } from '../../../../../frontend/utils/general'
import logger from '../../../../../frontend/utils/logger'

type TaxFeeSectionProviderProps = {
  taxData: ResponseTaxDto
}

const useGetContext = ({ taxData }: TaxFeeSectionProviderProps) => {
  const router = useRouter()
  const [openSnackbarError] = useSnackbar({ variant: 'error' })

  const redirectToPayment = async () => {
    // TODO snackbar
    try {
      const { data } = await taxApi.paymentControllerPayment(String(taxData.year), {
        accessToken: 'always',
      })
      await router.push(data.url)
    } catch (error) {
      // TODO translation
      openSnackbarError('error.payment_redirect')
      logger.error(error)
    }
  }

  const downloadQrCode = async () => {
    const arrayBuffer = base64ToArrayBuffer(taxData.qrCodeWeb)
    downloadBlob(new Blob([arrayBuffer], { type: 'image/png' }), 'QR-dan-z-nehnutelnosti.png')
  }

  return { taxData, redirectToPayment, downloadQrCode }
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

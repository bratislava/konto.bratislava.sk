import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { TaxControllerV2GetTaxDetailByYearV2200Response } from 'openapi-clients/tax'
import { createContext, PropsWithChildren, useContext } from 'react'

import { taxClient } from '@/src/clients/tax'
import useToast from '@/src/components/simple-components/Toast/useToast'
import { base64ToArrayBuffer, downloadBlob } from '@/src/frontend/utils/general'
import logger from '@/src/frontend/utils/logger'

type TaxDataProviderProps = {
  taxData: TaxControllerV2GetTaxDetailByYearV2200Response
}

const useGetContext = ({ taxData }: TaxDataProviderProps) => {
  const { t } = useTranslation()
  const router = useRouter()

  const { showToast, closeToasts } = useToast()

  const { mutate: redirectToFullPaymentMutate, isPending: redirectToFullPaymentIsPending } =
    useMutation({
      mutationFn: () =>
        taxClient.paymentControllerGenerateFullPaymentLink(
          taxData.year,
          taxData.type,
          taxData.order,
          {
            authStrategy: 'authOnly',
          },
        ),
      networkMode: 'always',
      onSuccess: async (response) => {
        closeToasts()
        await router.push(response.data.url)
      },
      onMutate: () => {
        showToast({ message: t('useTaxData.redirectingToPayment'), variant: 'info' })
      },
      onError: (error) => {
        showToast({
          message: t('useTaxData.paymentRedirectError'),
          variant: 'error',
        })
        logger.error(error)
      },
    })

  const {
    mutate: redirectToInstallmentPaymentMutate,
    isPending: redirectToInstallmentPaymentIsPending,
  } = useMutation({
    mutationFn: () =>
      taxClient.paymentControllerGenerateInstallmentPaymentLink(
        taxData.year,
        taxData.type,
        taxData.order,
        {
          authStrategy: 'authOnly',
        },
      ),
    networkMode: 'always',
    onSuccess: async (response) => {
      closeToasts()
      await router.push(response.data.url)
    },
    onMutate: () => {
      showToast({ message: t('useTaxData.redirectingToPayment'), variant: 'info' })
    },
    onError: (error) => {
      showToast({ message: t('useTaxData.paymentRedirectError'), variant: 'error' })
      logger.error(error)
    },
  })

  const downloadQrCodeOneTimePayment = async () => {
    if (!taxData.oneTimePayment.qrCode) return
    const arrayBuffer = base64ToArrayBuffer(taxData.oneTimePayment.qrCode)
    downloadBlob(
      new Blob([arrayBuffer], { type: 'image/png' }),
      `QR-${taxData.type}-${taxData.year}-${taxData.order}-zvysna-suma.png`,
    )
  }
  const downloadQrCodeInstallmentPayment = async () => {
    if (!taxData.installmentPayment.activeInstallment?.qrCode) return
    const arrayBuffer = base64ToArrayBuffer(taxData.installmentPayment.activeInstallment.qrCode)
    downloadBlob(
      new Blob([arrayBuffer], { type: 'image/png' }),
      `QR-${taxData.type}-${taxData.year}-${taxData.order}-splatka.png`,
    )
  }

  return {
    taxData,
    redirectToFullPaymentMutate,
    redirectToFullPaymentIsPending,
    redirectToInstallmentPaymentMutate,
    redirectToInstallmentPaymentIsPending,
    downloadQrCodeOneTimePayment,
    downloadQrCodeInstallmentPayment,
  }
}

const TaxDataContext = createContext<ReturnType<typeof useGetContext> | undefined>(undefined)

export const TaxDataProvider = ({ children, ...rest }: PropsWithChildren<TaxDataProviderProps>) => {
  const context = useGetContext(rest)

  return <TaxDataContext.Provider value={context}>{children}</TaxDataContext.Provider>
}

export const useTaxData = () => {
  const context = useContext(TaxDataContext)
  if (!context) {
    throw new Error('useTaxData must be used within a TaxDataProvider')
  }

  return context
}

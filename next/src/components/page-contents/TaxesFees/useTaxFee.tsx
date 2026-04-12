import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { TaxControllerV2GetTaxDetailByYearV2200Response } from 'openapi-clients/tax'
import React, { createContext, PropsWithChildren, useContext } from 'react'

import { StrapiTaxAdministrator } from '@/src/backend/utils/strapi-tax-administrator'
import { taxClient } from '@/src/clients/tax'
import { base64ToArrayBuffer, downloadBlob } from '@/src/frontend/utils/general'
import logger from '@/src/frontend/utils/logger'

import useToast from '../../simple-components/Toast/useToast'

type TaxFeeProviderProps = {
  taxData: TaxControllerV2GetTaxDetailByYearV2200Response
  strapiTaxAdministrator: StrapiTaxAdministrator | null
}

const useGetContext = ({ taxData, strapiTaxAdministrator }: TaxFeeProviderProps) => {
  const { t } = useTranslation('account')
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
        showToast({ message: t('account_section_payment.redirecting_to_payment'), variant: 'info' })
      },
      onError: (error) => {
        showToast({
          message: t('account_section_payment.payment_redirect_error'),
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
      showToast({ message: t('account_section_payment.redirecting_to_payment'), variant: 'info' })
    },
    onError: (error) => {
      showToast({ message: t('account_section_payment.payment_redirect_error'), variant: 'error' })
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
    strapiTaxAdministrator,
  }
}

const TaxFeeContext = createContext<ReturnType<typeof useGetContext> | undefined>(undefined)

export const TaxFeeProvider = ({ children, ...rest }: PropsWithChildren<TaxFeeProviderProps>) => {
  const context = useGetContext(rest)

  return <TaxFeeContext.Provider value={context}>{children}</TaxFeeContext.Provider>
}

export const useTaxFee = () => {
  const context = useContext(TaxFeeContext)
  if (!context) {
    throw new Error('useTaxFee must be used within a TaxFeeProvider')
  }

  return context
}

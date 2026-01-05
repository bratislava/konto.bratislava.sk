import { StrapiTaxAdministrator } from '@backend/utils/strapi-tax-administrator'
import { taxClient } from '@clients/tax'
import { useMutation } from '@tanstack/react-query'
import useSnackbar from 'frontend/hooks/useSnackbar'
import { base64ToArrayBuffer, downloadBlob } from 'frontend/utils/general'
import logger from 'frontend/utils/logger'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { TaxControllerV2GetTaxDetailByYearV2200Response } from 'openapi-clients/tax'
import React, { createContext, PropsWithChildren, useContext, useState } from 'react'

type TaxFeeSectionProviderProps = {
  taxData: TaxControllerV2GetTaxDetailByYearV2200Response
  strapiTaxAdministrator: StrapiTaxAdministrator | null
}

const useGetContext = ({ taxData, strapiTaxAdministrator }: TaxFeeSectionProviderProps) => {
  const [officialCorrespondenceChannelModalOpen, setOfficialCorrespondenceChannelModalOpen] =
    useState(false)

  const router = useRouter()
  const [openSnackbarError] = useSnackbar({ variant: 'error' })
  const [openSnackbarInfo, closeSnackbarInfo] = useSnackbar({ variant: 'info' })
  const { t } = useTranslation('account')

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
        closeSnackbarInfo()
        await router.push(response.data.url)
      },
      onMutate: () => {
        openSnackbarInfo(t('account_section_payment.redirecting_to_payment'))
      },
      onError: (error) => {
        openSnackbarError(t('account_section_payment.payment_redirect_error'))
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
      closeSnackbarInfo()
      await router.push(response.data.url)
    },
    onMutate: () => {
      openSnackbarInfo(t('account_section_payment.redirecting_to_payment'))
    },
    onError: (error) => {
      openSnackbarError(t('account_section_payment.payment_redirect_error'))
      logger.error(error)
    },
  })

  const downloadQrCodeOneTimePayment = async () => {
    if (!taxData.oneTimePayment.qrCode) return
    const arrayBuffer = base64ToArrayBuffer(taxData.oneTimePayment.qrCode)
    downloadBlob(
      new Blob([arrayBuffer], { type: 'image/png' }),
      'QR-dan-z-nehnutelnosti-zvysna-suma.png',
    )
  }
  const downloadQrCodeInstallmentPayment = async () => {
    if (!taxData.installmentPayment.activeInstallment?.qrCode) return
    const arrayBuffer = base64ToArrayBuffer(taxData.installmentPayment.activeInstallment.qrCode)
    downloadBlob(
      new Blob([arrayBuffer], { type: 'image/png' }),
      'QR-dan-z-nehnutelnosti-splatka.png',
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
    officialCorrespondenceChannelModalOpen,
    setOfficialCorrespondenceChannelModalOpen,
    strapiTaxAdministrator,
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

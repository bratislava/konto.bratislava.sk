import { formsApi } from '@clients/forms'
import { GetFormResponseDto } from '@clients/openapi-forms'
import { useMutation } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import { useTranslation } from 'next-i18next'
import React, { createContext, PropsWithChildren, useContext, useRef } from 'react'

import { useFormState } from '../../components/forms/FormStateProvider'
import { RegistrationModalType } from '../../components/forms/segments/RegistrationModal/RegistrationModal'
import { useFormModals } from '../../components/forms/useFormModals'
import { readFileToString } from '../utils/file'
import { downloadBlob } from '../utils/general'
import { useServerSideAuth } from './useServerSideAuth'
import useSnackbar from './useSnackbar'

export const useGetContext = () => {
  const { isAuthenticated } = useServerSideAuth()
  const { formId, formData, formSlug, setImportedFormData } = useFormState()
  const { setRegistrationModal } = useFormModals()
  const { t } = useTranslation('forms')
  const { setConceptSaveErrorModal } = useFormModals()

  const [openSnackbarError] = useSnackbar({ variant: 'error' })
  const [openSnackbarSuccess] = useSnackbar({ variant: 'success' })
  const [openSnackbarInfo, closeSnackbarInfo] = useSnackbar({ variant: 'info' })

  const importXmlButtonRef = useRef<HTMLButtonElement>(null)

  const { mutate: saveConceptMutate, isLoading: saveConceptIsLoading } = useMutation<
    AxiosResponse<GetFormResponseDto>,
    unknown,
    { fromModal?: boolean }
  >(
    () =>
      formsApi.nasesControllerUpdateForm(
        formId,
        {
          formDataJson: formData,
        },
        { accessToken: 'onlyAuthenticated' },
      ),
    {
      networkMode: 'always',
      onMutate: ({ fromModal }) => {
        // The concept saved from modal has its own loading indicator.
        if (!fromModal) {
          openSnackbarInfo(t('info_messages.concept_save'))
        }
      },
      onSuccess: () => {
        openSnackbarSuccess(t('success_messages.concept_save'))
        setConceptSaveErrorModal(false)
      },
      onError: () => {
        closeSnackbarInfo()
        setConceptSaveErrorModal(true)
      },
    },
  )

  const exportXml = async () => {
    openSnackbarInfo(t('info_messages.xml_export'))
    try {
      const response = await formsApi.convertControllerConvertJsonToXml(
        formId,
        {
          jsonForm: formData,
        },
        { accessToken: 'onlyAuthenticated' },
      )
      const fileName = `${formSlug}_output.xml`
      downloadBlob(new Blob([response.data.xmlForm]), fileName)
      closeSnackbarInfo()
      openSnackbarSuccess(t('success_messages.xml_export'))
    } catch (error) {
      openSnackbarError(t('errors.xml_export'))
    }
  }

  const triggerImportXml = () => {
    importXmlButtonRef.current?.click()
  }

  const handleImportXml = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return
    }
    const file = files[0]

    try {
      const xmlData: string = await readFileToString(file)
      const response = await formsApi.convertControllerConvertXmlToJson(
        formId,
        {
          xmlForm: xmlData,
        },
        { accessToken: 'onlyAuthenticated' },
      )
      setImportedFormData(response.data.jsonForm)
      closeSnackbarInfo()
      openSnackbarSuccess(t('success_messages.xml_import'))
    } catch (error) {
      openSnackbarError(t('errors.xml_import'))
    }
  }

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const exportPdf = async () => {
    throw new Error('Not implemented')
    // openSnackbarInfo(t('info_messages.pdf_export'))
    // try {
    //   const xml: Blob = await formDataToXml(formSlug, formData)
    //   const xmlData: string = await blobToString(xml)
    //   const pdf = await xmlStringToPdf(formSlug, xmlData)
    //   const fileName = `${formSlug}_output.pdf`
    //   downloadBlob(pdf, fileName)
    //   closeSnackbarInfo()
    //   openSnackbarSuccess(t('success_messages.pdf_export'))
    // } catch (error) {
    //   openSnackbarError(t('errors.pdf_export'))
    // }
  }

  const saveConcept = async (fromModal?: boolean) => {
    if (!isAuthenticated) {
      setRegistrationModal(RegistrationModalType.NotAuthenticatedConceptSave)
      return
    }

    saveConceptMutate({ fromModal })
  }

  return {
    exportXml,
    importXml: triggerImportXml,
    exportPdf,
    saveConcept,
    saveConceptIsLoading,
    importXmlButtonRef,
    handleImportXml,
  }
}

const FormExportImportContext = createContext<ReturnType<typeof useGetContext> | undefined>(
  undefined,
)

export const FormExportImportProvider = ({ children }: PropsWithChildren) => {
  const context = useGetContext()

  return (
    <FormExportImportContext.Provider value={context}>{children}</FormExportImportContext.Provider>
  )
}

export const useFormExportImport = () => {
  const context = useContext(FormExportImportContext)
  if (!context) {
    throw new Error('useFormExportImport must be used within a FormExportImportProvider')
  }

  return context
}

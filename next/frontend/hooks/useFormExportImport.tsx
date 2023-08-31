import { formsApi } from '@clients/forms'
import { GetFormResponseDto } from '@clients/openapi-forms'
import { useMutation } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import React, { createContext, PropsWithChildren, useContext, useRef } from 'react'

import { RegistrationModalType } from '../../components/forms/segments/RegistrationModal/RegistrationModal'
import { useFormLeaveProtection } from '../../components/forms/useFormLeaveProtection'
import { useFormModals } from '../../components/forms/useFormModals'
import { useFormState } from '../../components/forms/useFormState'
import { InitialFormData } from '../types/initialFormData'
import { readFileToString } from '../utils/file'
import { downloadBlob } from '../utils/general'
import { useServerSideAuth } from './useServerSideAuth'
import useSnackbar from './useSnackbar'

type FormExportImportProviderProps = {
  initialFormData: InitialFormData
}

export const useGetContext = ({initialFormData}: FormExportImportProviderProps) => {
  const { isAuthenticated } = useServerSideAuth()
  const { formId, formData, formSlug, setImportedFormData } = useFormState()
  const { setRegistrationModal } = useFormModals()
  const { t } = useTranslation('forms')
  const { setConceptSaveErrorModal } = useFormModals()
  const { turnOffLeaveProtection } = useFormLeaveProtection()
  const router = useRouter()

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
        turnOffLeaveProtection()
      },
      onError: () => {
        closeSnackbarInfo()
        setConceptSaveErrorModal(true)
      },
    },
  )

  const { mutate: migrateFormMutate, isLoading: migrateFormIsLoading } = useMutation(
    () =>
      formsApi.nasesControllerMigrateForm(
        formId,
        { accessToken: 'onlyAuthenticated' },
      ),
    {
      networkMode: 'always',
      onSuccess: () => {
        turnOffLeaveProtection()
        router.reload()
      },
      onError: () => {
        openSnackbarError(t('errors.migration'))
      },
    },
  )

  const migrateForm = () => {
    if (migrateFormIsLoading) {
      return;
    }

    migrateFormMutate()
  }

  const exportXml = async () => {
    openSnackbarInfo(t('info_messages.xml_export'))
    try {
      const response = await formsApi.convertControllerConvertJsonToXml(
        initialFormData.schemaVersionId,
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
      openSnackbarInfo(t('info_messages.xml_import'))
      const xmlData: string = await readFileToString(file)
      const response = await formsApi.convertControllerConvertXmlToJson(
        initialFormData.schemaVersionId,
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

  const exportPdf = async () => {
    openSnackbarInfo(t('info_messages.pdf_export'))
    try {
      const response = await formsApi.convertControllerConvertToPdf(
        initialFormData.schemaVersionId,
        {
          jsonForm: formData,
        },
        { accessToken: 'onlyAuthenticated', responseType: 'arraybuffer' },
      )
      const fileName = `${formSlug}_output.pdf`
      // TODO: Revisit when BE is fixed
      downloadBlob(new Blob([response.data as BlobPart]), fileName)
      closeSnackbarInfo()
      openSnackbarSuccess(t('success_messages.pdf_export'))
    } catch (error) {
      openSnackbarError(t('errors.pdf_export'))
    }
  }

  const saveConcept = async (fromModal?: boolean) => {
    if (!isAuthenticated) {
      setRegistrationModal(RegistrationModalType.NotAuthenticatedConceptSave)
      return
    }

    if (saveConceptIsLoading) {
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
    migrateForm,
    migrateFormIsLoading,
    importXmlButtonRef,
    handleImportXml,
  }
}

const FormExportImportContext = createContext<ReturnType<typeof useGetContext> | undefined>(
  undefined,
)

export const FormExportImportProvider = ({ children, ...rest }: PropsWithChildren<FormExportImportProviderProps>) => {
  const context = useGetContext(rest)

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

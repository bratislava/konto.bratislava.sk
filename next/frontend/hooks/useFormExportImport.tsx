import { formsApi } from '@clients/forms'
import { GetFormResponseDto } from '@clients/openapi-forms'
import { useMutation } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import { ROUTES } from 'frontend/api/constants'
import logger from 'frontend/utils/logger'
import { dismissSnackbar, showSnackbar } from 'frontend/utils/notifications'
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

type FormExportImportProviderProps = {
  initialFormData: InitialFormData
}

export const useGetContext = ({ initialFormData }: FormExportImportProviderProps) => {
  const { isAuthenticated } = useServerSideAuth()
  const { formId, formData, formSlug, setImportedFormData } = useFormState()
  const { setRegistrationModal, setTaxFormPdfExportModal } = useFormModals()
  const { t } = useTranslation('forms')
  const { setConceptSaveErrorModal } = useFormModals()
  const { turnOffLeaveProtection } = useFormLeaveProtection()
  const router = useRouter()

  const importXmlButtonRef = useRef<HTMLButtonElement>(null)

  const { mutate: saveConceptMutate, isPending: saveConceptIsPending } = useMutation<
    AxiosResponse<GetFormResponseDto>,
    unknown,
    { fromModal?: boolean }
  >({
    mutationFn: () =>
      formsApi.nasesControllerUpdateForm(
        formId,
        {
          formDataJson: formData,
        },
        { accessToken: 'onlyAuthenticated' },
      ),
    networkMode: 'always',
    onMutate: ({ fromModal }) => {
      // The concept saved from modal has its own loading indicator.
      if (!fromModal) {
        showSnackbar(t('info_messages.concept_save'), 'info')
      }
    },
    onSuccess: () => {
      dismissSnackbar()
      showSnackbar(t('success_messages.concept_save'), 'success')

      setConceptSaveErrorModal(false)
      turnOffLeaveProtection()
    },
    onError: () => {
      dismissSnackbar()
      setConceptSaveErrorModal(true)
    },
  })

  const { mutate: migrateFormMutate, isPending: migrateFormIsPending } = useMutation({
    mutationFn: () =>
      formsApi.nasesControllerMigrateForm(formId, { accessToken: 'onlyAuthenticated' }),
    networkMode: 'always',
    onSuccess: () => {
      turnOffLeaveProtection()
      router.reload()
      // a promise returned is awaited before toggling the isLoading
      // we use this to prevent re-enabling the button - the promise never resolves, the state is cleared by the reload
      return new Promise(() => {})
    },
    onError: () => {
      showSnackbar(t('errors.migration'), 'error')
    },
  })

  const migrateForm = () => {
    if (migrateFormIsPending) {
      return
    }

    migrateFormMutate()
  }
  // TODO refactor, same as next/components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsCard.tsx
  const exportXml = async () => {
    showSnackbar(t('info_messages.xml_export'), 'info')
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
      dismissSnackbar()
      showSnackbar(t('success_messages.xml_export'), 'success')
    } catch (error) {
      showSnackbar(t('errors.xml_export'), 'error')
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
      showSnackbar(t('info_messages.xml_import'), 'info')
      const xmlData: string = await readFileToString(file)
      const response = await formsApi.convertControllerConvertXmlToJson(
        initialFormData.schemaVersionId,
        {
          xmlForm: xmlData,
        },
        { accessToken: 'onlyAuthenticated' },
      )
      setImportedFormData(response.data.jsonForm)
      dismissSnackbar()
      showSnackbar(t('success_messages.xml_import'), 'success')
    } catch (error) {
      showSnackbar(t('errors.xml_import'), 'error')
    }
  }

  const runPdfExport = async (abortController?: AbortController) => {
    const response = await formsApi.convertControllerConvertToPdf(
      initialFormData.schemaVersionId,
      {
        jsonForm: formData,
      },
      {
        accessToken: 'onlyAuthenticated',
        responseType: 'arraybuffer',
        signal: abortController?.signal,
      },
    )
    const fileName = `${formSlug}_output.pdf`
    downloadBlob(new Blob([response.data as BlobPart]), fileName)
  }

  const exportOrdinaryPdf = async () => {
    showSnackbar(t('info_messages.pdf_export'), 'info')
    try {
      await runPdfExport()
    } catch (error) {
      dismissSnackbar()
      showSnackbar(t('errors.pdf_export'), 'error')
      return
    }
    dismissSnackbar()
    showSnackbar(t('success_messages.pdf_export'), 'success')
  }

  const exportTaxPdf = async () => {
    const abortController = new AbortController()
    setTaxFormPdfExportModal({ type: 'loading', onClose: () => abortController.abort() })
    try {
      await runPdfExport(abortController)
    } catch (error) {
      setTaxFormPdfExportModal(null)
      if (!abortController.signal.aborted) {
        showSnackbar(t('errors.pdf_export'), 'error')
      }
      return
    }
    setTaxFormPdfExportModal({ type: 'success' })
  }

  const exportPdf = async () => {
    await (initialFormData.isTaxForm ? exportTaxPdf() : exportOrdinaryPdf())
  }

  const saveConcept = async (fromModal?: boolean) => {
    if (!isAuthenticated) {
      setRegistrationModal(RegistrationModalType.NotAuthenticatedConceptSave)
      return
    }

    if (saveConceptIsPending) {
      return
    }

    saveConceptMutate({ fromModal })
  }

  const deleteConcept = async () => {
    showSnackbar(t('info_messages.concept_delete'), 'info')
    try {
      if (!formId) throw new Error(`No formId provided on deleteConcept`)
      await formsApi.nasesControllerDeleteForm(formId, {
        accessToken: 'onlyAuthenticated',
      })
      dismissSnackbar()
      showSnackbar(t('success_messages.concept_delete'), 'success')
      await router.push(ROUTES.MY_APPLICATIONS)
    } catch (error) {
      logger.error(error)
      showSnackbar(t('errors.concept_delete'), 'error')
    }
  }

  return {
    exportXml,
    importXml: triggerImportXml,
    exportPdf,
    saveConcept,
    saveConceptIsPending,
    migrateForm,
    migrateFormIsPending,
    importXmlButtonRef,
    handleImportXml,
    deleteConcept,
  }
}

const FormExportImportContext = createContext<ReturnType<typeof useGetContext> | undefined>(
  undefined,
)

export const FormExportImportProvider = ({
  children,
  ...rest
}: PropsWithChildren<FormExportImportProviderProps>) => {
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

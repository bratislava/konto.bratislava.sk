import { formsApi } from '@clients/forms'
import { GetFormResponseDto } from '@clients/openapi-forms'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosResponse } from 'axios'
import { ROUTES } from 'frontend/api/constants'
import logger from 'frontend/utils/logger'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { usePlausible } from 'next-plausible'
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useIsClient } from 'usehooks-ts'

import { RegistrationModalType } from '../../components/forms/segments/RegistrationModal/RegistrationModal'
import { useFormContext } from '../../components/forms/useFormContext'
import { useFormFileUpload } from '../../components/forms/useFormFileUpload'
import { useFormLeaveProtection } from '../../components/forms/useFormLeaveProtection'
import { useFormModals } from '../../components/forms/useFormModals'
import { useFormState } from '../../components/forms/useFormState'
import { environment } from '../../environment'
import type { PdfPreviewPayload } from '../../pages/api/pdf-preview'
import { readFileToString } from '../utils/file'
import { downloadBlob } from '../utils/general'
import { useServerSideAuth } from './useServerSideAuth'
import useSnackbar from './useSnackbar'

declare global {
  interface Window {
    __DEV_SHOW_IMPORT_EXPORT_JSON?: () => void
  }
}

export const useGetContext = () => {
  const { isAuthenticated } = useServerSideAuth()
  const { schema, uiSchema, schemaVersionId, formId, slug, isTaxForm } = useFormContext()
  const { clientFiles, serverFiles } = useFormFileUpload()
  const { formData, setImportedFormData } = useFormState()
  const { setRegistrationModal, setTaxFormPdfExportModal } = useFormModals()
  const { t } = useTranslation('forms')
  const { setConceptSaveErrorModal } = useFormModals()
  const { turnOffLeaveProtection } = useFormLeaveProtection()
  const router = useRouter()
  // track each imported/exported xml/pdf in analytics - event format should match the one in FormPagesWrapper
  const plausible = usePlausible()

  const [openSnackbarError] = useSnackbar({ variant: 'error' })
  const [openSnackbarSuccess] = useSnackbar({ variant: 'success' })
  const [openSnackbarInfo, closeSnackbarInfo] = useSnackbar({ variant: 'info' })

  const importXmlButtonRef = useRef<HTMLButtonElement>(null)
  const importJsonButtonRef = useRef<HTMLButtonElement>(null)

  const [showImportExportJson, setShowImportExportJson] = useState(false)
  const isClient = useIsClient()

  useEffect(() => {
    // Dev only debugging feature
    if (isClient) {
      // eslint-disable-next-line no-underscore-dangle
      window.__DEV_SHOW_IMPORT_EXPORT_JSON = () => setShowImportExportJson(true)
    }
  }, [isClient, setShowImportExportJson])

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
      openSnackbarError(t('errors.migration'))
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
    openSnackbarInfo(t('info_messages.xml_export'))
    try {
      const response = await formsApi.convertControllerConvertJsonToXml(
        schemaVersionId,
        {
          jsonForm: formData,
        },
        { accessToken: 'onlyAuthenticated' },
      )
      const fileName = `${slug}_output.xml`
      downloadBlob(new Blob([response.data.xmlForm]), fileName)
      closeSnackbarInfo()
      openSnackbarSuccess(t('success_messages.xml_export'))
      plausible(`${slug}#export-xml`)
    } catch (error) {
      openSnackbarError(t('errors.xml_export'))
    }
  }

  const exportJson = async () => {
    const fileName = `${slug}_output.json`
    downloadBlob(new Blob([JSON.stringify(formData)]), fileName)
    openSnackbarSuccess(t('success_messages.json_export'))
  }

  const triggerImportXml = () => {
    importXmlButtonRef.current?.click()
  }

  const triggerImportJson = () => {
    importJsonButtonRef.current?.click()
  }

  const handleImportXml = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return
    }
    const file = files[0]

    try {
      openSnackbarInfo(t('info_messages.xml_import'))
      const xmlData = await readFileToString(file)
      const response = await formsApi.convertControllerConvertXmlToJson(
        schemaVersionId,
        {
          xmlForm: xmlData,
        },
        { accessToken: 'onlyAuthenticated' },
      )
      setImportedFormData(response.data.jsonForm)
      closeSnackbarInfo()
      openSnackbarSuccess(t('success_messages.xml_import'))
      plausible(`${slug}#import-xml`)
    } catch (error) {
      openSnackbarError(t('errors.xml_import'))
    }
  }

  const handleImportJson = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return
    }
    const file = files[0]
    const jsonForm = await readFileToString(file)
    openSnackbarInfo(t('info_messages.json_import'))
    try {
      const parsed = JSON.parse(jsonForm)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      setImportedFormData(parsed)
    } catch (error) {
      openSnackbarError(t('errors.json_import'))
    }
    openSnackbarSuccess(t('success_messages.json_import'))
  }

  const runPdfExport = async (abortController?: AbortController) => {
    // Set the endpoint URL for the POST request
    const response = await axios.post<BlobPart, AxiosResponse<BlobPart>, PdfPreviewPayload>(
      `${environment.selfUrl}/api/pdf-preview`,
      {
        schema,
        uiSchema,
        formDataJson: formData,
        initialServerFiles: serverFiles,
        initialClientFiles: clientFiles.map((fileInfo) => ({
          ...fileInfo,
          // File object is not serializable, so we only pass the name to display it properly in the PDF
          file: { name: fileInfo.file.name } as File,
        })),
      },
      { responseType: 'arraybuffer', signal: abortController?.signal },
    )

    // const response = await formsApi.convertControllerConvertToPdf(
    //   initialFormData.schemaVersionId,
    //   {
    //     jsonForm: formData,
    //   },
    //   {
    //     accessToken: 'onlyAuthenticated',
    //     responseType: 'arraybuffer',
    //     signal: abortController?.signal,
    //   },
    // )
    const fileName = `${slug}_output.pdf`
    downloadBlob(new Blob([response.data]), fileName)
  }

  const exportOrdinaryPdf = async () => {
    openSnackbarInfo(t('info_messages.pdf_export'))
    try {
      await runPdfExport()
    } catch (error) {
      closeSnackbarInfo()
      openSnackbarError(t('errors.pdf_export'))
      return
    }
    closeSnackbarInfo()
    openSnackbarSuccess(t('success_messages.pdf_export'))
  }

  const exportTaxPdf = async () => {
    const abortController = new AbortController()
    setTaxFormPdfExportModal({ type: 'loading', onClose: () => abortController.abort() })
    try {
      await runPdfExport(abortController)
    } catch (error) {
      setTaxFormPdfExportModal(null)
      if (!abortController.signal.aborted) {
        openSnackbarError(t('errors.pdf_export'))
      }
      return
    }
    setTaxFormPdfExportModal({ type: 'success' })
  }

  const exportPdf = async () => {
    await (isTaxForm ? exportTaxPdf() : exportOrdinaryPdf())
    plausible(`${slug}#export-pdf`)
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
    openSnackbarInfo(t('info_messages.concept_delete'))
    try {
      if (!formId) throw new Error(`No formId provided on deleteConcept`)
      await formsApi.nasesControllerDeleteForm(formId, {
        accessToken: 'onlyAuthenticated',
      })
      closeSnackbarInfo()
      openSnackbarSuccess(t('success_messages.concept_delete'))
      await router.push(ROUTES.MY_APPLICATIONS)
    } catch (error) {
      logger.error(error)
      openSnackbarError(t('errors.concept_delete'))
    }
  }

  return {
    exportXml,
    importXml: triggerImportXml,
    exportJson,
    importJson: triggerImportJson,
    exportPdf,
    saveConcept,
    saveConceptIsPending,
    migrateForm,
    migrateFormIsPending,
    importXmlButtonRef,
    importJsonButtonRef,
    handleImportXml,
    handleImportJson,
    deleteConcept,
    showImportExportJson,
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

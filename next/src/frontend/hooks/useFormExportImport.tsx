import { useMutation } from '@tanstack/react-query'
import { AxiosResponse, isAxiosError } from 'axios'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { usePlausible } from 'next-plausible'
import { GetFormResponseDto } from 'openapi-clients/forms'
import React, { createContext, PropsWithChildren, useContext, useRef } from 'react'

import { formsClient } from '@/src/clients/forms'
import { useFormSignature } from '@/src/components/forms/signer/useFormSignature'
import { useFormContext } from '@/src/components/forms/useFormContext'
import { useFormData } from '@/src/components/forms/useFormData'
import { useFormFileUpload } from '@/src/components/forms/useFormFileUpload'
import { useFormLeaveProtection } from '@/src/components/forms/useFormLeaveProtection'
import { useFormState } from '@/src/components/forms/useFormState'
import { useFormModals } from '@/src/components/modals/FormModals/useFormModals'
import { RegistrationModalType } from '@/src/components/modals/RegistrationModal'
import { environment } from '@/src/environment'
import useToast from '../../components/simple-components/Toast/useToast'
import { useSsrAuth } from '@/src/frontend/hooks/useSsrAuth'
import { createSerializableFile } from '@/src/frontend/utils/formExportImport'
import { downloadBlob } from '@/src/frontend/utils/general'
import logger from '@/src/frontend/utils/logger'
import { ROUTES } from '@/src/utils/routes'

export const useGetContext = () => {
  const { isSignedIn } = useSsrAuth()
  const {
    formDefinition: { slug },
    formId,
    isTaxForm,
  } = useFormContext()
  const { setImportedFormData } = useFormState()
  const { formData } = useFormData()
  const { setRegistrationModal, setTaxFormPdfExportModal, setXmlImportVersionConfirmationModal } =
    useFormModals()
  const { t } = useTranslation('forms')
  const { setConceptSaveErrorModal } = useFormModals()
  const { turnOffLeaveProtection } = useFormLeaveProtection()
  const { signature } = useFormSignature()
  const { clientFiles } = useFormFileUpload()

  const router = useRouter()
  // track each imported/exported xml/pdf in analytics - event format should match the one in FormPagesWrapper
  const plausible = usePlausible()

  const { showToast, closeToasts } = useToast()

  const importXmlButtonRef = useRef<HTMLButtonElement>(null)
  const importJsonButtonRef = useRef<HTMLButtonElement>(null)

  const { mutate: saveConceptMutate, isPending: saveConceptIsPending } = useMutation<
    AxiosResponse<GetFormResponseDto>,
    unknown,
    { fromModal?: boolean }
  >({
    mutationFn: () =>
      formsClient.nasesControllerUpdateForm(
        formId,
        {
          formDataJson: formData,
          // `null` must be set explicitly, otherwise the signature would not be removed if needed
          formSignature: signature ?? null,
        },
        { authStrategy: 'authOrGuestWithToken' },
      ),
    networkMode: 'always',
    onMutate: ({ fromModal }) => {
      // The concept saved from modal has its own loading indicator.
      if (!fromModal) {
        showToast({ message: t('info_messages.concept_save'), variant: 'info' })
      }
    },
    onSuccess: () => {
      showToast({ message: t('success_messages.concept_save'), variant: 'success' })
      setConceptSaveErrorModal(false)
      turnOffLeaveProtection()
    },
    onError: () => {
      closeToasts()
      setConceptSaveErrorModal(true)
    },
  })

  const { mutate: migrateFormMutate, isPending: migrateFormIsPending } = useMutation({
    mutationFn: () =>
      formsClient.formMigrationsControllerClaimMigration(formId, { authStrategy: 'authOnly' }),
    networkMode: 'always',
    onSuccess: () => {
      turnOffLeaveProtection()
      router.reload()
      // a promise returned is awaited before toggling the isLoading
      // we use this to prevent re-enabling the button - the promise never resolves, the state is cleared by the reload
      return new Promise(() => {})
    },
    onError: () => {
      showToast({ message: t('errors.migration'), variant: 'error' })
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
    showToast({ message: t('info_messages.xml_export'), variant: 'info' })
    try {
      const response = await formsClient.convertControllerConvertJsonToXmlV2(
        formId,
        {
          jsonData: formData,
        },
        { authStrategy: 'authOrGuestWithToken' },
      )
      const fileName = `${slug}_output.xml`
      downloadBlob(new Blob([response.data]), fileName)
      closeToasts()
      showToast({ message: t('success_messages.xml_export'), variant: 'success' })
      plausible(`${slug}#export-xml`)
    } catch (error) {
      showToast({ message: t('errors.xml_export'), variant: 'error' })
    }
  }

  const exportJson = async () => {
    const fileName = `${slug}_output.json`
    downloadBlob(new Blob([JSON.stringify(formData)]), fileName)
    showToast({ message: t('success_messages.json_export'), variant: 'success' })
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
      showToast({ message: t('info_messages.xml_import'), variant: 'info' })
      const xmlForm = await file.text()
      const { data } = await formsClient.convertControllerConvertXmlToJson(
        formId,
        {
          xmlForm,
        },
        { authStrategy: 'authOrGuestWithToken' },
      )
      closeToasts()

      const importData = () => {
        setImportedFormData(data.formDataJson)
        showToast({ message: t('success_messages.xml_import'), variant: 'success' })
      }

      if (environment.featureToggles.versioning && data.requiresVersionConfirmation) {
        setXmlImportVersionConfirmationModal({
          isOpen: true,
          confirmCallback: () => {
            importData()
            setXmlImportVersionConfirmationModal({ isOpen: false })
          },
        })
      } else {
        importData()
      }
      plausible(`${slug}#import-xml`)
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.errorName === 'INCOMPATIBLE_JSON_VERSION') {
        showToast({ message: t('errors.xml_import_incompatible_version'), variant: 'error' })
      } else {
        showToast({ message: t('errors.xml_import'), variant: 'error' })
      }
    }
  }

  const handleImportJson = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return
    }
    const file = files[0]
    const jsonForm = await file.text()
    showToast({ message: t('info_messages.json_import'), variant: 'info' })
    try {
      const parsed = JSON.parse(jsonForm)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      setImportedFormData(parsed)
    } catch (error) {
      showToast({ message: t('errors.json_import'), variant: 'error' })
    }
    showToast({ message: t('success_messages.json_import'), variant: 'success' })
  }

  const runPdfExport = async (abortController?: AbortController) => {
    const response = await formsClient.convertControllerConvertToPdf(
      formId,
      {
        jsonData: formData,
        clientFiles: clientFiles.map((fileInfo) => ({
          ...fileInfo,
          file: createSerializableFile(fileInfo.file),
        })),
      },
      {
        authStrategy: 'authOrGuestWithToken',
        responseType: 'arraybuffer',
        signal: abortController?.signal,
      },
    )
    const fileName = `${slug}_output.pdf`
    downloadBlob(new Blob([response.data as BlobPart]), fileName)
  }

  const exportOrdinaryPdf = async () => {
    showToast({ message: t('info_messages.pdf_export'), variant: 'info' })
    try {
      await runPdfExport()
    } catch (error) {
      closeToasts()
      showToast({ message: t('errors.pdf_export'), variant: 'error' })
      return
    }
    closeToasts()
    showToast({ message: t('success_messages.pdf_export'), variant: 'success' })
  }

  const exportTaxPdf = async () => {
    const abortController = new AbortController()
    setTaxFormPdfExportModal({ type: 'loading', onClose: () => abortController.abort() })
    try {
      await runPdfExport(abortController)
    } catch (error) {
      setTaxFormPdfExportModal(null)
      if (!abortController.signal.aborted) {
        showToast({ message: t('errors.pdf_export'), variant: 'error' })
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
    if (!isSignedIn) {
      setRegistrationModal(RegistrationModalType.NotAuthenticatedConceptSave)
      return
    }

    if (saveConceptIsPending) {
      return
    }

    saveConceptMutate({ fromModal })
  }

  const deleteConcept = async () => {
    showToast({ message: t('info_messages.concept_delete'), variant: 'info' })
    try {
      await formsClient.nasesControllerDeleteForm(formId, {
        authStrategy: 'authOrGuestWithToken',
      })
      closeToasts()
      showToast({ message: t('success_messages.concept_delete'), variant: 'success' })
      await router.push(ROUTES.MY_APPLICATIONS)
    } catch (error) {
      logger.error(error)
      showToast({ message: t('errors.concept_delete'), variant: 'error' })
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

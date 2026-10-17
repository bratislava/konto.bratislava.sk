import { GenericObjectType } from '@rjsf/utils'
import { ClientFileInfo } from 'forms-shared/form-files/fileStatus'
import { useTranslation } from 'next-i18next/pages'
import { usePlausible } from 'next-plausible'

import { formsClient } from '@/src/clients/forms'
import useToast from '@/src/components/simple-components/Toast/useToast'
import { createSerializableFile } from '@/src/frontend/utils/formExportImport'
import { downloadBlob } from '@/src/frontend/utils/general'
import logger from '@/src/frontend/utils/logger'

type Params = {
  formId: string
  formSlug: string
  /**
   * Form data to export. If omitted, the backend exports the form data stored in the database.
   */
  jsonData?: GenericObjectType
  /**
   * Files not yet uploaded to the server, so they can be listed in the pdf.
   */
  clientFiles?: ClientFileInfo[]
  signal?: AbortSignal
}

export const useExportFormToPdf = () => {
  const { t } = useTranslation()
  const { showToast, closeToasts } = useToast()

  // event format should match the one in FormPagesWrapper
  const plausible = usePlausible()

  /**
   * Downloads the pdf without any UI feedback, throws on error.
   */
  const downloadFormPdf = async ({ formId, formSlug, jsonData, clientFiles, signal }: Params) => {
    const response = await formsClient.convertControllerConvertToPdf(
      formId,
      {
        jsonData,
        clientFiles: clientFiles?.map((fileInfo) => ({
          ...fileInfo,
          file: createSerializableFile(fileInfo.file),
        })),
      },
      { authStrategy: 'authOrGuestWithToken', responseType: 'arraybuffer', signal },
    )
    const fileName = `${formSlug}_output.pdf`
    downloadBlob(new Blob([response.data as BlobPart]), fileName)
    plausible(`${formSlug}#export-pdf`)
  }

  const exportFormToPdf = async (params: Params) => {
    showToast({ message: t('useFormExportImport.info.pdfExport'), variant: 'info' })
    try {
      await downloadFormPdf(params)
      closeToasts()
      showToast({ message: t('useFormExportImport.success.pdfExport'), variant: 'success' })
    } catch (error) {
      logger.error(error)
      closeToasts()
      showToast({ message: t('useFormExportImport.errors.pdfExport'), variant: 'error' })
    }
  }

  return { exportFormToPdf, downloadFormPdf }
}

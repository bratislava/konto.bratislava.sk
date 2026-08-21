import { useTranslation } from 'next-i18next/pages'
import { GetFormResponseDto } from 'openapi-clients/forms'

import { formsClient } from '@/src/clients/forms'
import useToast from '@/src/components/simple-components/Toast/useToast'
import { downloadBlob } from '@/src/frontend/utils/general'
import logger from '@/src/frontend/utils/logger'

type Props = {
  myApplicationData?: GetFormResponseDto
}

const useExportFormPdf = ({ myApplicationData }: Props) => {
  const { t } = useTranslation()
  const { showToast, closeToasts } = useToast()

  if (!myApplicationData) {
    return null
  }

  const formSlug = myApplicationData?.formDefinitionSlug
  const formId = myApplicationData?.id

  return async () => {
    showToast({ message: t('useFormExportImport.info.pdfExport'), variant: 'info' })

    try {
      if (!formId) {
        throw new Error(`No form id.`)
      }

      const response = await formsClient.convertControllerConvertToPdf(
        formId,
        {},
        { authStrategy: 'authOrGuestWithToken', responseType: 'arraybuffer' },
      )
      const fileName = `${formSlug}_output.pdf`

      downloadBlob(new Blob([response.data as BlobPart]), fileName)
      closeToasts()
      showToast({ message: t('useFormExportImport.success.pdfExport'), variant: 'success' })
    } catch (error) {
      logger.error(error)
      showToast({ message: t('useFormExportImport.errors.pdfExport'), variant: 'error' })
    }
  }
}

export default useExportFormPdf

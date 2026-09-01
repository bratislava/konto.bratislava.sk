import { useTranslation } from 'next-i18next/pages'
import { GetFormResponseSimpleDto } from 'openapi-clients/forms'

import { formsClient } from '@/src/clients/forms'
import useToast from '@/src/components/simple-components/Toast/useToast'
import { downloadBlob } from '@/src/frontend/utils/general'
import logger from '@/src/frontend/utils/logger'

type Props = {
  form?: GetFormResponseSimpleDto | null
}

export const useExportFormToPdf = ({ form }: Props) => {
  // TODO Translations
  const { t } = useTranslation()

  const { showToast, closeToasts } = useToast()

  const formSlug = form?.formDefinitionSlug
  // TODO replace - this won't be valid for forms processed on the GINIS side
  const formId = form?.id

  const exportFormToPdf = async () => {
    showToast({ message: t('useFormExportImport.info.pdfExport'), variant: 'info' })
    try {
      if (!formSlug || !formId) {
        throw new Error(
          // eslint-disable-next-line sonarjs/no-nested-template-literals
          `No formSlug or form id ${formId && `for form id: ${formId}`}`,
        )
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

  return { exportFormToPdf }
}

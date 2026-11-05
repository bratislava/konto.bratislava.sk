import { GenericObjectType } from '@rjsf/utils'
import { useTranslation } from 'next-i18next/pages'
import { usePlausible } from 'next-plausible'

import { formsClient } from '@/src/clients/forms'
import useToast from '@/src/components/simple-components/Toast/useToast'
import { downloadBlob } from '@/src/frontend/utils/general'
import logger from '@/src/frontend/utils/logger'

type Params = {
  formId: string
  formSlug: string
  /**
   * Form data to export. If omitted, the backend exports the form data stored in the database.
   */
  jsonData?: GenericObjectType
}

export const useExportFormToXml = () => {
  const { t } = useTranslation()
  const { showToast, closeToasts } = useToast()

  // event format should match the one in FormPagesWrapper
  const plausible = usePlausible()

  const exportFormToXml = async ({ formId, formSlug, jsonData }: Params) => {
    showToast({ message: t('useFormExportImport.info.xmlExport'), variant: 'info' })
    try {
      const response = await formsClient.convertControllerConvertJsonToXmlV2(
        formId,
        { jsonData },
        { authStrategy: 'authOrGuestWithToken' },
      )
      const fileName = `${formSlug}_output.xml`
      downloadBlob(new Blob([response.data]), fileName)
      closeToasts()
      showToast({ message: t('useFormExportImport.success.xmlExport'), variant: 'success' })
      plausible(`${formSlug}#export-xml`)
    } catch (error) {
      logger.error(error)
      closeToasts()
      showToast({ message: t('useFormExportImport.errors.xmlExport'), variant: 'error' })
    }
  }

  return { exportFormToXml }
}

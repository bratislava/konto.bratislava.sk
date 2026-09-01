import { useTranslation } from 'next-i18next/pages'
import { GetFormResponseSimpleDto } from 'openapi-clients/forms'

import { formsClient } from '@/src/clients/forms'
import useToast from '@/src/components/simple-components/Toast/useToast'
import { downloadBlob } from '@/src/frontend/utils/general'
import logger from '@/src/frontend/utils/logger'

type Props = {
  form?: GetFormResponseSimpleDto | null
}

export const useExportFormToXml = ({ form }: Props) => {
  const { t } = useTranslation()
  const { showToast, closeToasts } = useToast()

  const formSlug = form?.formDefinitionSlug
  // TODO replace - this won't be valid for forms processed on the GINIS side
  const formId = form?.id

  // xml and pdf exports copied from useFormExportImport
  // TODO refactor, same as next/frontend/hooks/useFormExportImport.tsx
  const exportFormToXml = async () => {
    showToast({ message: t('useFormExportImport.info.xmlExport'), variant: 'info' })
    try {
      if (!formId) {
        throw new Error('No form id provided for exportXml')
      }

      const response = await formsClient.convertControllerConvertJsonToXmlV2(
        formId,
        {},
        { authStrategy: 'authOrGuestWithToken' },
      )
      const fileName = `${formSlug}_output.xml`
      downloadBlob(new Blob([response.data]), fileName)
      closeToasts()
      showToast({ message: t('useFormExportImport.success.xmlExport'), variant: 'success' })
    } catch (error) {
      showToast({ message: t('useFormExportImport.errors.xmlExport'), variant: 'error' })
      logger.error(JSON.stringify(error))
    }
  }

  return { exportFormToXml }
}

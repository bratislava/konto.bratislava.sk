import { useTranslation } from 'next-i18next/pages'
import { GetFormResponseSimpleDto } from 'openapi-clients/forms'

import { formsClient } from '@/src/clients/forms'
import useToast from '@/src/components/simple-components/Toast/useToast'
import logger from '@/src/frontend/utils/logger'

type Props = {
  form?: GetFormResponseSimpleDto | null
  refreshListData: () => Promise<void>
}

export const useDeleteFormConcept = ({ form, refreshListData }: Props) => {
  // TODO Translations
  const { t } = useTranslation()

  const { showToast, closeToasts } = useToast()

  // TODO replace - this won't be valid for forms processed on the GINIS side
  const formId = form?.id

  const deleteFormConcept = async () => {
    showToast({ message: t('useFormExportImport.info.conceptDelete'), variant: 'info' })
    try {
      if (!formId) {
        throw new Error(`No formId provided on deleteConcept`)
      }
      await formsClient.formsControllerDeleteForm(formId, {
        authStrategy: 'authOrGuestWithToken',
      })
      closeToasts()
      showToast({ message: t('useFormExportImport.success.conceptDelete'), variant: 'success' })
      await refreshListData()
    } catch (error) {
      logger.error(error)
      showToast({ message: t('useFormExportImport.errors.conceptDelete'), variant: 'error' })
    }
  }

  return { deleteFormConcept }
}

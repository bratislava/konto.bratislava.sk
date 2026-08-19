import { Button, Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { GetFormResponseDto, GinisDocumentDetailResponseDto } from 'openapi-clients/forms'

import { formsClient } from '@/src/clients/forms'
import FormatDate from '@/src/components/formatting/FormatDate'
import Icon from '@/src/components/icon-components/Icon'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import Breadcrumbs from '@/src/components/segments/Breadcrumbs/Breadcrumbs'
import useToast from '@/src/components/simple-components/Toast/useToast'
import useFormStateComponents from '@/src/frontend/hooks/useFormStateComponents'
import { downloadBlob } from '@/src/frontend/utils/general'
import logger from '@/src/frontend/utils/logger'
import { ROUTES } from '@/src/utils/routes'

type Props = {
  formDefinitionTitle: string
  myApplicationDetailsData?: GetFormResponseDto
  ginisData?: GinisDocumentDetailResponseDto | null
}

/**
 * Figma: https://www.figma.com/design/0VrrvwWs7n3T8YFzoHe92X/BK--Dizajn--DEV-?node-id=10974-95085
 */

const MyApplicationDetailsHeader = ({
  formDefinitionTitle,
  myApplicationDetailsData,
  ginisData,
}: Props) => {
  const { t } = useTranslation()

  const { showToast, closeToasts } = useToast()

  const latestGinisChangeDate = ginisData?.documentHistory?.[0]?.['Datum-zmeny']
  const firstGinisChangeDate =
    ginisData?.documentHistory?.[(ginisData?.documentHistory?.length || 0) - 1]?.['Datum-zmeny']

  const subject = myApplicationDetailsData?.formSubject
  const formSlug = myApplicationDetailsData?.formDefinitionSlug
  const formId = myApplicationDetailsData?.id
  const createdAt = firstGinisChangeDate || myApplicationDetailsData?.createdAt
  const updatedAt = latestGinisChangeDate || myApplicationDetailsData?.updatedAt
  const state = myApplicationDetailsData?.state
  const error = myApplicationDetailsData?.error

  const { icon: iconComponent, text: textComponent } = useFormStateComponents({ error, state })

  const breadcrumbs = [
    { title: t('MyApplicationDetailsHeader.backToList'), path: ROUTES.MY_APPLICATIONS },
    { title: subject ?? formDefinitionTitle, path: null },
  ]

  const exportPdf = async () => {
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

  return (
    <SectionContainer className="bg-gray-50">
      <div className="flex size-full flex-col justify-end gap-4 py-4 lg:gap-6 lg:py-8">
        <div className="flex flex-col gap-4 px-4 lg:gap-6 lg:px-0">
          <Breadcrumbs breadcrumbs={breadcrumbs} />
          <div className="flex flex-col gap-4 lg:gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex w-full items-center justify-between">
                <Typography variant="h1">{subject}</Typography>
                <Button
                  variant="solid"
                  className="max-lg:hidden"
                  startIcon={<Icon name="download" />}
                  onPress={exportPdf}
                >
                  {t('MyApplicationDetailsHeader.downloadPdf')}
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-4">
              <div className="flex items-center gap-3">
                <Typography variant="p-small" className="font-semibold">
                  {t('MyApplicationDetailsHeader.sent')}
                </Typography>
                <Typography variant="p-small">
                  <FormatDate>{createdAt || ''}</FormatDate>
                </Typography>
              </div>
              <div aria-hidden className="size-1.5 rounded-full bg-gray-700 max-lg:hidden" />
              <div className="flex items-center gap-1">
                {iconComponent}
                {textComponent}
              </div>
              <div aria-hidden className="size-1.5 rounded-full bg-gray-700 max-lg:hidden" />
              <div className="flex items-center gap-1">
                <Typography variant="p-small">
                  {t('MyApplicationDetailsHeader.lastChange')}
                </Typography>
                <Typography variant="p-small">
                  <FormatDate>{updatedAt || ''}</FormatDate>
                </Typography>
              </div>
            </div>
            <Button
              variant="solid"
              fullWidth
              className="lg:hidden"
              startIcon={<Icon name="download" />}
              onPress={exportPdf}
            >
              {t('MyApplicationDetailsHeader.downloadPdf')}
            </Button>
          </div>
        </div>
      </div>
    </SectionContainer>
  )
}

export default MyApplicationDetailsHeader

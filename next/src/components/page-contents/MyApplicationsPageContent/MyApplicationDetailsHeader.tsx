import { Button, Typography } from '@bratislava/component-library'
import Link from 'next/link'
import { useTranslation } from 'next-i18next/pages'
import { GetFormResponseDto, GinisDocumentDetailResponseDto } from 'openapi-clients/forms'

import { ChevronLeftIcon, DownloadIcon } from '@/src/assets/ui-icons'
import { formsClient } from '@/src/clients/forms'
import FormatDate from '@/src/components/formatting/FormatDate'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import useToast from '@/src/components/simple-components/Toast/useToast'
import useFormStateComponents from '@/src/frontend/hooks/useFormStateComponents'
import { downloadBlob } from '@/src/frontend/utils/general'
import logger from '@/src/frontend/utils/logger'

type MyApplicationDetailsHeaderBase = {
  formDefinitionTitle: string
  data?: GetFormResponseDto
  ginisData?: GinisDocumentDetailResponseDto | null
}

const MyApplicationDetailsHeader = ({
  formDefinitionTitle,
  data,
  ginisData,
}: MyApplicationDetailsHeaderBase) => {
  // TODO Translations
  const { t } = useTranslation(['account', 'forms'])

  const { showToast, closeToasts } = useToast()

  const latestGinisChangeDate = ginisData?.documentHistory?.[0]?.['Datum-zmeny']
  const firstGinisChangeDate =
    ginisData?.documentHistory?.[(ginisData?.documentHistory?.length || 0) - 1]?.['Datum-zmeny']

  const subject = data?.formSubject
  const formSlug = data?.formDefinitionSlug
  const formId = data?.id
  const createdAt = firstGinisChangeDate || data?.createdAt
  const updatedAt = latestGinisChangeDate || data?.updatedAt
  const state = data?.state
  const error = data?.error

  const { icon, text } = useFormStateComponents({ error, state })

  const exportPdf = async () => {
    showToast({ message: t('forms:info_messages.pdf_export'), variant: 'info' })
    try {
      if (!formId) throw new Error(`No form id.`)
      const response = await formsClient.convertControllerConvertToPdf(
        formId,
        {},
        { authStrategy: 'authOrGuestWithToken', responseType: 'arraybuffer' },
      )
      const fileName = `${formSlug}_output.pdf`
      downloadBlob(new Blob([response.data as BlobPart]), fileName)
      closeToasts()
      showToast({ message: t('forms:success_messages.pdf_export'), variant: 'success' })
    } catch (error) {
      logger.error(error)
      showToast({ message: t('forms:errors.pdf_export'), variant: 'error' })
    }
  }

  return (
    <SectionContainer className="bg-gray-50">
      <div className="flex size-full flex-col justify-end gap-4 py-4 lg:gap-6 lg:py-8">
        <div className="flex flex-col gap-4 px-4 lg:gap-6 lg:px-0">
          <Link href="/moje-ziadosti" className="flex w-max items-center gap-1">
            <ChevronLeftIcon className="size-5" />
            <Typography variant="p-tiny" className="font-medium underline underline-offset-2">
              {t('back_to_list')}
            </Typography>
          </Link>
          <div className="flex flex-col gap-4 lg:gap-6">
            <div className="flex flex-col gap-2">
              <Typography variant="p-small" className="font-semibold text-main-700">
                {formDefinitionTitle}
              </Typography>
              <div className="flex w-full items-center justify-between">
                <Typography variant="h1">{subject}</Typography>
                <Button
                  variant="solid"
                  className="max-md:hidden"
                  startIcon={<DownloadIcon />}
                  onPress={exportPdf}
                >
                  {t('my_application.details.download_pdf')}
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-4">
              <div className="flex items-center gap-3">
                <Typography variant="p-small" className="font-semibold">
                  {t('account_section_applications.details.application_details.sent')}
                </Typography>
                <Typography variant="p-small">
                  <FormatDate>{createdAt || ''}</FormatDate>
                </Typography>
              </div>
              <span className="hidden size-1.5 rounded-full bg-gray-700 lg:block" />
              <div className="flex items-center gap-1">
                {icon}
                {text}
              </div>
              <span className="hidden size-1.5 rounded-full bg-gray-700 lg:block" />
              <div className="flex items-center gap-1">
                <Typography variant="p-small">
                  {t('account_section_applications.last_change')}
                </Typography>
                <Typography variant="p-small">
                  <FormatDate>{updatedAt || ''}</FormatDate>
                </Typography>
              </div>
            </div>
            <Button
              variant="solid"
              fullWidth
              className="md:hidden"
              startIcon={<DownloadIcon />}
              onPress={exportPdf}
            >
              {t('my_application.details.download_pdf')}
            </Button>
          </div>
        </div>
      </div>
    </SectionContainer>
  )
}

export default MyApplicationDetailsHeader

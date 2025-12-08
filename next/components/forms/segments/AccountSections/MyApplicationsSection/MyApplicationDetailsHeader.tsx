import { ChevronLeftIcon, DownloadIcon } from '@assets/ui-icons'
import { formsClient } from '@clients/forms'
import Button from 'components/forms/simple-components/Button'
import FormatDate from 'components/forms/simple-components/FormatDate'
import useFormStateComponents from 'frontend/hooks/useFormStateComponents'
import useSnackbar from 'frontend/hooks/useSnackbar'
import { downloadBlob } from 'frontend/utils/general'
import logger from 'frontend/utils/logger'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { GetFormResponseDto, GinisDocumentDetailResponseDto } from 'openapi-clients/forms'

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
  const { t } = useTranslation('account')
  const { t: ft } = useTranslation('forms')

  const [openSnackbarError] = useSnackbar({ variant: 'error' })
  const [openSnackbarSuccess] = useSnackbar({ variant: 'success' })
  const [openSnackbarInfo, closeSnackbarInfo] = useSnackbar({ variant: 'info' })

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
    openSnackbarInfo(ft('info_messages.pdf_export'))
    try {
      if (!formId)
        throw new Error(
          // eslint-disable-next-line sonarjs/no-nested-template-literals
          `No form id.`,
        )
      const response = await formsClient.convertControllerConvertToPdf(
        formId,
        {},
        { authStrategy: 'authOrGuestWithToken', responseType: 'arraybuffer' },
      )
      const fileName = `${formSlug}_output.pdf`
      downloadBlob(new Blob([response.data as BlobPart]), fileName)
      closeSnackbarInfo()
      openSnackbarSuccess(ft('success_messages.pdf_export'))
    } catch (error) {
      logger.error(error)
      openSnackbarError(ft('errors.pdf_export'))
    }
  }

  return (
    <div className="bg-gray-50">
      <div className="m-auto flex size-full max-w-(--breakpoint-lg) flex-col justify-end gap-4 py-4 lg:gap-6 lg:px-0 lg:py-8">
        <div className="flex flex-col gap-4 px-4 lg:gap-6 lg:px-0">
          <Link href="/moje-ziadosti" className="flex w-max items-center gap-1">
            <ChevronLeftIcon className="size-5" />
            <span className="text-p3-medium underline underline-offset-2">{t('back_to_list')}</span>
          </Link>
          <div className="flex flex-col gap-4 lg:gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-p2-semibold text-main-700">{formDefinitionTitle}</p>
              <div className="flex w-full items-center justify-between">
                <h1 className="text-h1">{subject}</h1>
                <Button
                  className="hidden md:flex"
                  startIcon={<DownloadIcon className="size-6" />}
                  text={t('may_application.details.download_pdf')}
                  onPress={exportPdf}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-4">
              <div className="flex items-center gap-3">
                <p className="text-p3-semibold lg:text-p2-semibold">
                  {t('account_section_applications.details.application_details.sent')}
                </p>
                <p className="text-p3 lg:text-p2">
                  <FormatDate>{createdAt || ''}</FormatDate>
                </p>
              </div>
              <span className="hidden size-1.5 rounded-full bg-gray-700 lg:block" />
              <div className="flex items-center gap-1">
                {icon}
                {text}
              </div>
              <span className="hidden size-1.5 rounded-full bg-gray-700 lg:block" />
              <div className="flex items-center gap-1">
                <p className="text-p3 lg:text-p2">
                  {t('account_section_applications.last_change')}
                </p>
                <p className="text-p3 lg:text-p2">
                  <FormatDate>{updatedAt || ''}</FormatDate>
                </p>
              </div>
            </div>
            <Button
              fullWidth
              className="flex md:hidden"
              startIcon={<DownloadIcon className="size-6" />}
              text={t('may_application.details.download_pdf')}
              onPress={exportPdf}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyApplicationDetailsHeader

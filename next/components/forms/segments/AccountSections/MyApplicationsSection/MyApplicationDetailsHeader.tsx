import { ChevronLeftIcon, DownloadIcon } from '@assets/ui-icons'
import { formsApi } from '@clients/forms'
import { GetFormResponseDto } from '@clients/openapi-forms'
import Button from 'components/forms/simple-components/Button'
import FormatDate from 'components/forms/simple-components/FormatDate'
import useFormStateComponents from 'frontend/hooks/useFormStateComponents'
import useSnackbar from 'frontend/hooks/useSnackbar'
import { downloadBlob } from 'frontend/utils/general'
import logger from 'frontend/utils/logger'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'

type MyApplicationDetailsHeaderBase = {
  data?: GetFormResponseDto
}

const MyApplicationDetailsHeader = (props: MyApplicationDetailsHeaderBase) => {
  const { data } = props
  const { t } = useTranslation('account')
  const { t: ft } = useTranslation('forms')

  const [openSnackbarError] = useSnackbar({ variant: 'error' })
  const [openSnackbarSuccess] = useSnackbar({ variant: 'success' })
  const [openSnackbarInfo, closeSnackbarInfo] = useSnackbar({ variant: 'info' })

  const formData = data?.formDataJson
  const formSlug = data?.schemaVersion.schema?.slug || ''
  const schemaVersionId = data?.schemaVersionId
  const formId = data?.id
  const category = data?.schemaVersion.schema?.formName
  const createdAt = data?.createdAt
  // TODO replace - this won't be valid for forms processed on the GINIS side
  const updatedAt = data?.updatedAt
  const state = data?.state
  const error = data?.error
  const isLatestSchemaVersionForSlug = data?.isLatestSchemaVersionForSlug

  const { icon, text } = useFormStateComponents({ error, isLatestSchemaVersionForSlug, state })

  const exportPdf = async () => {
    openSnackbarInfo(ft('info_messages.pdf_export'))
    try {
      if (!formData || !schemaVersionId)
        throw new Error(`No form data or schemaVersionId for form id: ${formId}`)
      const response = await formsApi.convertControllerConvertToPdf(
        schemaVersionId,
        {
          jsonForm: formData,
        },
        { accessToken: 'onlyAuthenticated', responseType: 'arraybuffer' },
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
      <div className="m-auto flex h-full w-full max-w-screen-lg flex-col justify-end gap-4 py-4 lg:gap-6 lg:px-0 lg:py-8">
        <div className="flex flex-col gap-4 px-4 lg:gap-6 lg:px-0">
          <Link href="/moje-ziadosti" className="flex w-max items-center gap-1">
            <ChevronLeftIcon className="h-5 w-5" />
            <span className="text-p3-medium underline underline-offset-2">{t('back_to_list')}</span>
          </Link>
          <div className="flex flex-col gap-4 lg:gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-p2-semibold text-main-700">{category}</p>
              <div className="flex w-full items-center justify-between">
                <h1 className="text-h1">TODO Podanie</h1>
                <Button
                  className="hidden md:flex"
                  startIcon={<DownloadIcon className="h-6 w-6" />}
                  text={t('download_pdf')}
                  onPress={exportPdf}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-4">
              <div className="flex items-center gap-3">
                <p className="text-p3-semibold lg:text-p2-semibold">
                  {t('account_section_applications.navigation_sent')}
                </p>
                <p className="text-p3 lg:text-p2">
                  <FormatDate>{createdAt || ''}</FormatDate>
                </p>
              </div>
              <span className="hidden h-1.5 w-1.5 rounded-full bg-gray-700 lg:block" />
              <div className="flex items-center gap-1">
                {icon}
                {text}
              </div>
              <span className="hidden h-1.5 w-1.5 rounded-full bg-gray-700 lg:block" />
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
              startIcon={<DownloadIcon className="h-6 w-6" />}
              text={t('download_pdf')}
              onPress={exportPdf}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyApplicationDetailsHeader

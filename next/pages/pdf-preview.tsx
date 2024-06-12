import { formsApi } from '@clients/forms'
import { ClientFileInfo } from '@forms-shared/form-files/fileStatus'
import { isAxiosError } from 'axios'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'

import PdfSummaryPage, { PdfSummaryPageProps } from '../components/forms/PdfSummaryPage'
import { isProductionDeployment } from '../frontend/utils/general'
import logger from '../frontend/utils/logger'
import { slovakServerSideTranslations } from '../frontend/utils/slovakServerSideTranslations'

export type PdfPreviewDataAdditionalMetadata = {
  clientFiles?: ClientFileInfo[]
}

export const getServerSideProps: GetServerSideProps<PdfSummaryPageProps> = async (
  ctx: GetServerSidePropsContext,
) => {
  if (!ctx.query.jwtToken) {
    return { notFound: true }
  }

  try {
    const { data: pdfPreviewData } = await formsApi.convertControllerGetPdfPreviewData({
      jwtToken: ctx.query.jwtToken as string,
    })
    // Debug purposes
    if (!isProductionDeployment()) {
      logger.info(`PDF preview JWT token: ${ctx.query.jwtToken as string}`)
    }

    return {
      props: {
        formContext: {
          // Not needed for PDF preview START
          slug: '',
          formId: '',
          schemaVersionId: '',
          oldSchemaVersion: false,
          formMigrationRequired: false,
          formSent: false,
          isSigned: false,
          isTaxForm: false,
          // END
          schema: pdfPreviewData.jsonSchema,
          uiSchema: pdfPreviewData.uiSchema,
          initialFormDataJson: pdfPreviewData.jsonForm,
          initialClientFiles: (
            pdfPreviewData.additionalMetadata as PdfPreviewDataAdditionalMetadata
          )?.clientFiles,
          initialServerFiles: pdfPreviewData.serverFiles,
          isPdf: true,
        },
        ...(await slovakServerSideTranslations()),
      } satisfies PdfSummaryPageProps,
    }
  } catch (error) {
    if (isAxiosError(error)) {
      const is404 = error.response?.status === 404
      if (is404) {
        return { notFound: true }
      }
    }

    throw error
  }
}

// eslint-disable-next-line unicorn/prefer-export-from
export default PdfSummaryPage

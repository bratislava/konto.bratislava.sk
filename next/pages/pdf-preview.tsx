import { formsApi } from '@clients/forms'
import { isAxiosError } from 'axios'
import { GetServerSidePropsContext } from 'next'

import PdfSummaryPage, { PdfSummaryPageProps } from '../components/forms/PdfSummaryPage'
import { FormFileUploadClientFileInfo } from '../frontend/types/formFileUploadTypes'

export type PdfPreviewDataAdditionalMetadata = {
  clientFiles?: FormFileUploadClientFileInfo[]
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  if (!ctx.query.jwtToken) {
    return { notFound: true }
  }

  try {
    const { data: pdfPreviewData } = await formsApi.convertControllerGetPdfPreviewData({
      jwtToken: ctx.query.jwtToken as string,
    })

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

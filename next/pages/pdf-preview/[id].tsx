import axios from 'axios'
import { GetServerSidePropsContext } from 'next'

import { PdfSummaryPageProps } from '../../components/forms/PdfSummaryPage'
import { environment } from '../../environment'
import type { PdfPreviewPayload } from '../api/pdf-preview'

/**
 * This route serves only for internal purposes, it is called by Puppeteer in `/api/pdf-preview.ts`.
 */
export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const dataResponse = await axios.get<PdfPreviewPayload>(
    `${environment.selfUrl}/api/pdf-preview-data-store`,
    {
      params: {
        uuid: ctx.query.id,
      },
    },
  )
  const { schema, uiSchema, formDataJson, initialClientFiles, initialServerFiles } =
    dataResponse.data

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
        schema,
        uiSchema,
        initialFormDataJson: formDataJson,
        initialClientFiles,
        initialServerFiles,
        isPdf: true,
      },
    } satisfies PdfSummaryPageProps,
  }
}

// eslint-disable-next-line no-restricted-exports
export { default } from '../../components/forms/PdfSummaryPage'

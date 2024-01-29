import axios from 'axios'
import { GetServerSidePropsContext } from 'next'

import { PdfSummaryPageProps } from '../../components/forms/PdfSummaryPage'
import { environment } from '../../environment'
import { PdfPreviewPayload } from '../api/pdf-preview'

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const isLocalRequest =
    ctx.req.socket.remoteAddress === '127.0.0.1' || ctx.req.socket.remoteAddress === '::1'

  if (!isLocalRequest) {
    throw new Error('Forbidden')
  }

  const dataResponse = await axios.get<PdfPreviewPayload>(
    `${environment.selfUrl}/api/pdf-preview-data-store`,
    {
      params: {
        uuid: ctx.query.id,
      },
    },
  )

  console.log('init', ctx.query.id)

  return {
    props: {
      // @ts-ignore
      formContext: {
        slug: '',
        formId: '',
        initialFormDataJson: dataResponse.data.formDataJson,
        ...dataResponse.data,
        oldSchemaVersion: false,
        formMigrationRequired: false,
        formSent: false,
        schemaVersionId: '',
        isSigned: false,
        isTaxForm: false,
        isPdf: true,
      },
    } satisfies PdfSummaryPageProps,
  }
}

export { default } from '../../components/forms/PdfSummaryPage'

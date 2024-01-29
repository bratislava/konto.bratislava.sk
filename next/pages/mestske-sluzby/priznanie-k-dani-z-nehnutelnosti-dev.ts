import { RJSFSchema, UiSchema } from '@rjsf/utils'
import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import priznanieKDaniZNehnutelnosti from 'schema-generator/definitions/priznanie-k-dani-z-nehnutelnosti'

import FormPageWrapper, { FormPageWrapperProps } from '../../components/forms/FormPageWrapper'
import {
  getSSRCurrentAuth,
  ServerSideAuthProviderHOC,
} from '../../components/logic/ServerSideAuthProvider'
import { environment } from '../../environment'

type Params = {
  slug: string
  id: string
}

/**
 * Temporary route for previewing the tax form.
 */
export const getServerSideProps: GetServerSideProps<FormPageWrapperProps, Params> = async (ctx) => {
  if (!environment.featureToggles.priznanieKDaniZNehnutelnostiPreview) return { notFound: true }

  const ssrCurrentAuthProps = await getSSRCurrentAuth(ctx.req)

  const locale = 'sk'
  // To remove undefined values from the schema as they are not allowed by Next.js
  const schema = JSON.parse(JSON.stringify(priznanieKDaniZNehnutelnosti)) as {
    schema: RJSFSchema
    uiSchema: UiSchema
  }

  return {
    props: {
      ssrCurrentAuthProps,
      formContext: {
        slug: 'priznanie-k-dani-z-nehnutelnosti',
        schema: schema.schema,
        uiSchema: schema.uiSchema,
        formId: '',
        initialFormDataJson: {},
        initialClientFiles: [],
        initialServerFiles: [],
        oldSchemaVersion: false,
        formSent: false,
        formMigrationRequired: false,
        schemaVersionId: '',
        isSigned: true,
        isTaxForm: true,
        isPdf: false,
      },
      ...(await serverSideTranslations(locale)),
    } satisfies FormPageWrapperProps,
  }
}

export default ServerSideAuthProviderHOC(FormPageWrapper)

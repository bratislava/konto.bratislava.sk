import { RJSFSchema, UiSchema } from '@rjsf/utils'
import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import priznanieKDaniZNehnutelnosti from 'schema-generator/definitions/priznanieKDaniZNehnutelnosti'

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
  if (
    !environment.featureToggles.forms ||
    !environment.featureToggles.priznanieKDaniZNehnutelnostiPreview
  )
    return { notFound: true }

  const ssrCurrentAuthProps = await getSSRCurrentAuth(ctx.req)

  const locale = 'sk'
  // To remove undefined values from the schema as they are not allowed by Next.js
  const schema = JSON.parse(JSON.stringify(priznanieKDaniZNehnutelnosti)) as {
    schema: RJSFSchema
    uiSchema: UiSchema
  }

  return {
    props: {
      schema: schema.schema,
      uiSchema: schema.uiSchema,
      ssrCurrentAuthProps,
      page: {
        locale,
      },
      initialFormData: {
        formId: '',
        formDataJson: {},
        files: [],
        oldSchemaVersion: false,
        formSent: false,
        formMigrationRequired: false,
        schemaVersionId: '',
      },
      ...(await serverSideTranslations(locale)),
    } satisfies FormPageWrapperProps,
  }
}

export default ServerSideAuthProviderHOC(FormPageWrapper)

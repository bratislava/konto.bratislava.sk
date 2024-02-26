import { RJSFSchema, UiSchema } from '@rjsf/utils'
import priznanieKDaniZNehnutelnosti from 'schema-generator/definitions/priznanie-k-dani-z-nehnutelnosti'

import FormPageWrapper, { FormPageWrapperProps } from '../../components/forms/FormPageWrapper'
import { SsrAuthProviderHOC } from '../../components/logic/SsrAuthContext'
import { environment } from '../../environment'
import { amplifyGetServerSideProps } from '../../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../../frontend/utils/slovakServerSideTranslations'

/**
 * Temporary route for previewing the tax form.
 */
export const getServerSideProps = amplifyGetServerSideProps<FormPageWrapperProps>(async () => {
  if (!environment.featureToggles.priznanieKDaniZNehnutelnostiPreview) return { notFound: true }

  // To remove undefined values from the schema as they are not allowed by Next.js
  const schema = JSON.parse(JSON.stringify(priznanieKDaniZNehnutelnosti)) as {
    schema: RJSFSchema
    uiSchema: UiSchema
  }

  return {
    props: {
      formContext: {
        slug: 'priznanie-k-dani-z-nehnutelnosti',
        schema: schema.schema,
        uiSchema: schema.uiSchema,
        formId: '',
        initialFormDataJson: {},
        initialServerFiles: [],
        oldSchemaVersion: false,
        formSent: false,
        formMigrationRequired: false,
        schemaVersionId: '',
        isSigned: true,
        isTaxForm: true,
      },
      ...(await slovakServerSideTranslations()),
    } satisfies FormPageWrapperProps,
  }
})

export default SsrAuthProviderHOC(FormPageWrapper)

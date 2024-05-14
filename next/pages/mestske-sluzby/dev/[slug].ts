import { RJSFSchema, UiSchema } from '@rjsf/utils'
import komunitneZahrady from '@shared/definitions/komunitne-zahrady'
import predzahradky from '@shared/definitions/predzahradky'
import priznanieKDaniZNehnutelnosti from '@shared/definitions/priznanie-k-dani-z-nehnutelnosti'
import stanoviskoKInvesticnemuZameru from '@shared/definitions/stanovisko-k-investicnemu-zameru'
import zavazneStanoviskoKInvesticnejCinnosti from '@shared/definitions/zavazne-stanovisko-k-investicnej-cinnosti'

import FormPageWrapper, { FormPageWrapperProps } from '../../../components/forms/FormPageWrapper'
import { SsrAuthProviderHOC } from '../../../components/logic/SsrAuthContext'
import { environment } from '../../../environment'
import { amplifyGetServerSideProps } from '../../../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../../../frontend/utils/slovakServerSideTranslations'

const slugSchemasMap = {
  'priznanie-k-dani-z-nehnutelnosti': priznanieKDaniZNehnutelnosti,
  'stanovisko-k-investicnemu-zameru': stanoviskoKInvesticnemuZameru,
  'zavazne-stanovisko-k-investicnej-cinnosti': zavazneStanoviskoKInvesticnejCinnosti,
  'komunitne-zahrady': komunitneZahrady,
  predzahradky,
}

/**
 * A route to preview forms in `shared` folder. Backend functionality doesn't work. Works only in development.
 */
export const getServerSideProps = amplifyGetServerSideProps<FormPageWrapperProps>(
  async ({ context }) => {
    if (!environment.featureToggles.developmentForms) {
      return { notFound: true }
    }

    const slug = context.params?.slug as string
    const schema = slugSchemasMap[slug]

    if (!schema) {
      return { notFound: true }
    }

    // To remove undefined values from the schema as they are not allowed by Next.js
    const parsedSchema = JSON.parse(JSON.stringify(schema)) as {
      schema: RJSFSchema
      uiSchema: UiSchema
    }

    const isTaxForm = slug === 'priznanie-k-dani-z-nehnutelnosti'

    return {
      props: {
        formContext: {
          slug,
          schema: parsedSchema.schema,
          uiSchema: parsedSchema.uiSchema,
          formId: '',
          initialFormDataJson: {},
          initialServerFiles: [],
          oldSchemaVersion: false,
          formSent: false,
          formMigrationRequired: false,
          schemaVersionId: '',
          isTaxForm,
          isSigned: isTaxForm,
        },
        ...(await slovakServerSideTranslations()),
      } satisfies FormPageWrapperProps,
    }
  },
)

export default SsrAuthProviderHOC(FormPageWrapper)

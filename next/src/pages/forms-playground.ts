import { devFormDefinitions } from 'forms-shared/definitions/devFormDefinitions'
import { formDefinitions } from 'forms-shared/definitions/formDefinitions'
import { exampleDevForms, exampleForms } from 'forms-shared/example-forms/exampleForms'

import { makeClientPlaygroundFormDefinitions } from '@/src/components/forms/clientFormDefinitions'
import FormsPlaygroundWrapped, {
  FormsPlaygroundProps,
} from '@/src/components/forms/FormsPlayground'
import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import { environment } from '@/src/environment'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'

export const getServerSideProps = amplifyGetServerSideProps<FormsPlaygroundProps>(async () => {
  if (!environment.featureToggles.developmentForms) {
    return { notFound: true }
  }

  return {
    props: {
      formDefinitions: makeClientPlaygroundFormDefinitions(formDefinitions),
      devFormDefinitions: makeClientPlaygroundFormDefinitions(devFormDefinitions),
      exampleForms,
      exampleDevForms,
      ...(await slovakServerSideTranslations()),
    },
  }
})

export default SsrAuthProviderHOC(FormsPlaygroundWrapped)

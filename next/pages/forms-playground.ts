import { devFormDefinitions } from 'forms-shared/definitions/devFormDefinitions'
import { formDefinitions } from 'forms-shared/definitions/formDefinitions'
import { exampleDevForms, exampleForms } from 'forms-shared/example-forms/exampleForms'

import { makeClientPlaygroundFormDefinitions } from '../components/forms/clientFormDefinitions'
import FormsPlaygroundWrapped, { FormsPlaygroundProps } from '../components/forms/FormsPlayground'
import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
import { environment } from '../environment'
import { amplifyGetServerSideProps } from '../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../frontend/utils/slovakServerSideTranslations'

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

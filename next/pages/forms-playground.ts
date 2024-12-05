import { devFormDefinitions } from 'forms-shared/definitions/devFormDefinitions'
import { formDefinitions } from 'forms-shared/definitions/formDefinitions'
import { exampleDevForms, exampleForms } from 'forms-shared/example-forms/exampleForms'

import FormsPlaygroundWrapped, { FormsPlaygroundProps } from '../components/forms/FormsPlayground'
import { makeSerializableFormDefinitionArray } from '../components/forms/serializableFormDefinition'
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
      formDefinitions: makeSerializableFormDefinitionArray(formDefinitions),
      devFormDefinitions: makeSerializableFormDefinitionArray(devFormDefinitions),
      exampleForms,
      exampleDevForms,
      ...(await slovakServerSideTranslations()),
    },
  }
})

export default SsrAuthProviderHOC(FormsPlaygroundWrapped)

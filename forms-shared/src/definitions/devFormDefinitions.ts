import { FormDefinition, FormDefinitionType } from './formDefinitionTypes'
import { generalTermsAndConditions } from './termsAndConditions'
import showcase from '../schemas/showcase'
import { FormSendPolicy } from '../send-policy/sendPolicy'

export const devFormDefinitions: FormDefinition[] = [
  {
    type: FormDefinitionType.SlovenskoSkGeneric,
    slug: 'showcase',
    title: 'Showcase',
    jsonVersion: '1.0.0',
    sendPolicy: FormSendPolicy.EidOrNotAuthenticated,
    schema: showcase,
    pospID: '',
    pospVersion: '',
    publisher: '',
    termsAndConditions: generalTermsAndConditions,
    ginisAssignment: {
      ginisOrganizationName: '',
      ginisPersonName: '',
    },
    isSigned: false,
  },
]

import { FormDefinition, FormDefinitionType } from './formDefinitionTypes'
import { generalTermsAndConditions } from './termsAndConditions'
import showcase from '../schemas/showcase'
import { FormSendPolicy } from '../send-policy/sendPolicy'
import ziadostOUzemnoplanovaciuInformaciu from '../schemas/ziadostOUzemnoplanovaciuInformaciu'

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
      ginisNodeId: '',
      ginisFunctionId: '',
    },
    isSigned: false,
  },
  {
    type: FormDefinitionType.SlovenskoSkGeneric,
    slug: 'ziadost-o-uzemnoplanovaciu-informaciu',
    title: 'Žiadosť o územnoplánovaciu informáciu',
    jsonVersion: '1.0.0',
    schema: ziadostOUzemnoplanovaciuInformaciu,
    sendPolicy: FormSendPolicy.EidOrAuthenticatedVerified,
    pospID: '00603481.ziadostOUzemnoplanovaciuInformaciu',
    pospVersion: '1.3',
    publisher: 'ico://sk/00603481',
    termsAndConditions: generalTermsAndConditions,
    ginisAssignment: {
      ginisNodeId: '',
      ginisFunctionId: '',
    },
    isSigned: false,
    feedbackLink: 'https://bravo.staffino.com/bratislava/id=WW1vhwT6',
  },
]

import { FormDefinition, FormDefinitionType } from './formDefinitionTypes'
import { generalTermsAndConditions } from './termsAndConditions'
import showcase from '../schemas/showcase'

export const devFormDefinitions: FormDefinition[] = [
  {
    type: FormDefinitionType.SlovenskoSkGeneric,
    slug: 'showcase',
    title: 'Showcase',
    schema: showcase,
    pospID: '',
    pospVersion: '',
    publisher: '',
    gestor: '',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: 'Showcase',
    ginisAssignment: {
      ginisOrganizationName: '',
      ginisPersonName: '',
    },
    isSigned: false,
  },
]

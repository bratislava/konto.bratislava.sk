import { FormDefinition, FormDefinitionType } from './formDefinitionTypes'
import { generalTermsAndConditions } from './termsAndConditions'
import mimoriadnyOdvozALikvidaciaOdpadu from '../schemas/olo/mimoriadnyOdvozALikvidaciaOdpadu'

export const devFormDefinitions: FormDefinition[] = [
  {
    type: FormDefinitionType.Email,
    slug: 'olo-mimoriadny-odvoz-a-likvidacia-odpadu',
    title: 'Mimoriadny odvoz a likvidácia odpadu',
    schemas: mimoriadnyOdvozALikvidaciaOdpadu,
    email: '',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    embedded: 'olo',
  },
]

import { FormDefinition, FormDefinitionType } from './formDefinitionTypes'
import { generalTermsAndConditions } from './termsAndConditions'
import ziadostOPridelenieNajomnehoBytu from '../schemas/ziadostOPridelenieNajomnehoBytu'
import mimoriadnyOdvozALikvidaciaOdpadu from '../schemas/olo/mimoriadnyOdvozALikvidaciaOdpadu'

export const devFormDefinitions: FormDefinition[] = [
  {
    type: FormDefinitionType.SlovenskoSkGeneric,
    slovenskoSkUrl: '',
    slug: 'ziadost-o-pridelenie-najomneho-bytu',
    title: 'Žiadosť o pridelenie nájomného bytu',
    schemas: ziadostOPridelenieNajomnehoBytu,
    pospID: '',
    pospVersion: '',
    gestor: 'Martin Pinter',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    messageSubjectFormat: '',
    ginisAssignment: {
      ginisOrganizationName: '',
      ginisPersonName: '',
    },
    isSigned: false,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-mimoriadny-odvoz-a-likvidacia-odpadu',
    title: 'Mimoriadny odvoz a likvidácia odpadu',
    schemas: mimoriadnyOdvozALikvidaciaOdpadu,
    email: '',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
  },
]

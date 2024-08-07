import { FormDefinition, FormDefinitionType } from './formDefinitionTypes'
import { generalTermsAndConditions } from './termsAndConditions'
import ziadostONajomnyByt from '../schemas/ziadostONajomnyByt'
import mimoriadnyOdvozALikvidaciaOdpadu from '../schemas/olo/mimoriadnyOdvozALikvidaciaOdpadu'

export const devFormDefinitions: FormDefinition[] = [
  {
    type: FormDefinitionType.SlovenskoSkGeneric,
    slovenskoSkUrl: '',
    slug: 'ziadost-o-najomny-byt',
    title: 'Žiadosť o nájomný byt',
    schemas: ziadostONajomnyByt,
    pospID: '00603481.ziadostONajomnyByt',
    pospVersion: '1.0',
    gestor: 'Pinter Martin',
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
    embedded: 'olo',
  },
]

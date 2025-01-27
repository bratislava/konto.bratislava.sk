import { FormDefinition, FormDefinitionType } from './formDefinitionTypes'
import { generalTermsAndConditions } from './termsAndConditions'
import showcase from '../schemas/showcase'
import oznamenieOPoplatkovejPovinnostiZaKomunalneOdpady from '../schemas/oznamenieOPoplatkovejPovinnostiZaKomunalneOdpady'

export const devFormDefinitions: FormDefinition[] = [
  {
    type: FormDefinitionType.SlovenskoSkGeneric,
    slug: 'showcase',
    title: 'Showcase',
    jsonVersion: '1.0',
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
  {
    type: FormDefinitionType.SlovenskoSkGeneric,
    slug: 'oznamenie-o-poplatkovej-povinnosti-za-komunalne-odpady',
    title: 'Oznámenie o poplatkovej povinnosti za komunálne odpady',
    jsonVersion: '1.0',
    schema: oznamenieOPoplatkovejPovinnostiZaKomunalneOdpady,
    pospID: '00603481.oznamenieOPoplatkovejPovinnostiZaKomunalneOdpady',
    pospVersion: '1.0',
    publisher: 'ico://sk/00603481',
    gestor: 'Pinter Martin',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: 'Oznámenie o poplatkovej povinnosti za komunálne odpady',
    ginisAssignment: {
      ginisOrganizationName: '',
      ginisPersonName: '',
    },
    isSigned: true,
  },
]

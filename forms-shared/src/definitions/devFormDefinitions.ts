import { FormDefinition, FormDefinitionType } from './formDefinitionTypes'
import { generalTermsAndConditions } from './termsAndConditions'
import showcase from '../schemas/showcase'
import oznamenieOVznikuZmeneAleboZanikuPoplatkovejPovinnosti from '../schemas/oznamenieOVznikuZmeneAleboZanikuPoplatkovejPovinnosti'

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
  {
    type: FormDefinitionType.SlovenskoSkGeneric,
    slug: 'oznamenie-o-vzniku-zmene-alebo-zaniku-poplatkovej-povinnosti',
    title: 'Oznámenie o vzniku, zmene alebo zániku poplatkovej povinnosti',
    schema: oznamenieOVznikuZmeneAleboZanikuPoplatkovejPovinnosti,
    pospID: '00603481.oznamenieOVznikuZmeneAleboZanikuPoplatkovejPovinnosti',
    pospVersion: '1.0',
    publisher: 'ico://sk/00603481',
    gestor: 'Pinter Martin',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: 'Oznámenie o vzniku, zmene alebo zániku poplatkovej povinnosti',
    ginisAssignment: {
      ginisOrganizationName: '',
      ginisPersonName: '',
    },
    isSigned: true,
  },
]

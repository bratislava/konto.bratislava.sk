import stanoviskoKInvesticnemuZameru from '../schemas/stanoviskoKInvesticnemuZameru'
import predzahradky from '../schemas/predzahradky'
import priznanieKDaniZNehnutelnosti from '../schemas/priznanieKDaniZNehnutelnosti'
import { generalTermsAndConditions, taxTermsAndConditions } from './termsAndConditions'
import zavazneStanoviskoKInvesticnejCinnosti from '../schemas/zavazneStanoviskoKInvesticnejCinnosti'
import komunitneZahrady from '../schemas/komunitneZahrady'
import { FormDefinition, FormDefinitionType } from './formDefinitionTypes'
import ziadostONajomnyByt, {
  ziadostONajomnyBytAdditionalInfoTemplate,
} from '../schemas/ziadostONajomnyByt'

export const formDefinitions: FormDefinition[] = [
  {
    type: FormDefinitionType.SlovenskoSkGeneric,
    slug: 'stanovisko-k-investicnemu-zameru',
    title: 'Žiadosť o stanovisko k investičnému zámeru',
    schemas: stanoviskoKInvesticnemuZameru,
    pospID: '00603481.stanoviskoKInvesticnemuZameru',
    pospVersion: '0.8',
    publisher: 'ico://sk/00603481',
    gestor: 'Pinter Martin',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: 'Podanie',
    messageSubjectFormat:
      'e-SIZ ž. {stavba.ulica} {stavba.nazov}, p.č. {stavba.parcelneCislo} kú {stavba.kataster}',
    ginisAssignment: {
      ginisOrganizationName: 'OUIC',
      ginisPersonName: 'Simeunovičová Ľudmila',
    },
    isSigned: false,
  },
  {
    type: FormDefinitionType.SlovenskoSkGeneric,
    slug: 'zavazne-stanovisko-k-investicnej-cinnosti',
    title: 'Žiadosť o záväzné stanovisko k investičnej činnosti',
    schemas: zavazneStanoviskoKInvesticnejCinnosti,
    pospID: '00603481.zavazneStanoviskoKInvesticnejCinnosti',

    pospVersion: '0.7',
    publisher: 'ico://sk/00603481',
    gestor: 'Pinter Martin',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: 'Podanie',
    messageSubjectFormat:
      'e-ZST ž. {stavba.ulica} {stavba.nazov}, p.č. {stavba.parcelneCislo} kú {stavba.kataster}',
    ginisAssignment: {
      ginisOrganizationName: 'OUIC',
      ginisPersonName: 'Simeunovičová Ľudmila',
    },
    isSigned: false,
  },
  {
    type: FormDefinitionType.SlovenskoSkGeneric,
    slug: 'predzahradky',
    title: 'Predzáhradky',
    schemas: predzahradky,
    pospID: '00603481.predzahradky',
    pospVersion: '1.0',
    publisher: 'ico://sk/00603481',
    gestor: 'Pinter Martin',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectFormat: 'Registrácia - {predzahradka.typRegistracie} predzáhradka',
    messageSubjectDefault: 'Registrácia predzáhradky',
    isSigned: false,
    ginisAssignment: {
      ginisOrganizationName: 'OUIC',
      ginisPersonName: 'Simeunovičová Ľudmila',
    },
  },
  {
    type: FormDefinitionType.SlovenskoSkGeneric,
    slug: 'komunitne-zahrady',
    title: 'Komunitné záhrady',
    schemas: komunitneZahrady,
    pospID: '00603481.komunitneZahrady',
    pospVersion: '1.0',
    publisher: 'ico://sk/00603481',
    gestor: 'Pinter Martin',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: 'Žiadosť o komunitnú záhradu',
    messageSubjectFormat: 'Žiadosť o komunitnú záhradu - {pozemok.typPozemku} mestský pozemok',
    isSigned: false,
    ginisAssignment: {
      ginisOrganizationName: 'OUIC',
      ginisPersonName: 'Simeunovičová Ľudmila',
    },
  },
  {
    type: FormDefinitionType.SlovenskoSkTax,
    title: 'Priznanie k dani z nehnuteľností',
    slug: 'priznanie-k-dani-z-nehnutelnosti',
    schemas: priznanieKDaniZNehnutelnosti,
    pospID: 'esmao.eforms.bratislava.obec_024',
    pospVersion: '201501.2',
    publisher: 'ico://sk/00603481',
    gestor: 'Cabrnoch Peter',
    termsAndConditions: taxTermsAndConditions,
    messageSubjectDefault: 'Priznanie k dani z nehnuteľností',
    isSigned: true,
  },
  {
    type: FormDefinitionType.SlovenskoSkGeneric,
    slug: 'ziadost-o-najomny-byt',
    title: 'Žiadosť o nájomný byt (TESTOVACIA VERZIA)',
    schemas: ziadostONajomnyByt,
    pospID: '00603481.ziadostONajomnyByt',
    pospVersion: '1.1',
    publisher: 'ico://sk/00603481',
    gestor: 'Pinter Martin',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: 'Žiadosť o nájomný byt (TESTOVACIA VERZIA)',
    // TODO
    ginisAssignment: {
      ginisOrganizationName: 'SX',
      ginisPersonName: 'Pinter Martin',
    },
    isSigned: false,
    newGovernmentXml: true,
    additionalInfoTemplate: ziadostONajomnyBytAdditionalInfoTemplate,
  },
]

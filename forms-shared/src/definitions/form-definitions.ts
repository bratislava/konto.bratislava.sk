import { Schemas } from '../generator/functions'
import stanoviskoKInvesticnemuZameru from './stanovisko-k-investicnemu-zameru'
import predzahradky from './predzahradky'
import priznanieKDaniZNehnutelnosti from './priznanie-k-dani-z-nehnutelnosti'
import { generalTermsAndConditions, taxTermsAndConditions } from './terms-and-conditions'
import zavazneStanoviskoKInvesticnejCinnosti from './zavazne-stanovisko-k-investicnej-cinnosti'
import komunitneZahrady from './komunitne-zahrady'

enum FormDefinitionType {
  SlovenskoSk = 'SlovenskoSk',
  Tax = 'Tax',
  Email = 'Email',
}

type GinisAssignment = {
  ginisOrganizationName: string
  ginisPersonName: string
}

type FormDefinitionBase = {
  slug: string
  title: string
  schemas: Schemas
  termsAndConditions: string
  messageSubjectFormat?: string
  messageSubjectDefault: string
  ginisAssignment?: GinisAssignment // TODO only in FormDefinitionSlovenskoSk
  pospID?: string // TODO only in FormDefinitionSlovenskoSk
}

type FormDefinitionSlovenskoSk = FormDefinitionBase & {
  type: FormDefinitionType.SlovenskoSk | FormDefinitionType.Tax
  pospVersion: string
}

type FormDefinitionEmail = FormDefinitionBase & {
  type: FormDefinitionType.Email
  email: string
}

export type FormDefinition = FormDefinitionSlovenskoSk | FormDefinitionEmail

export const formDefinitions: FormDefinition[] = [
  {
    type: FormDefinitionType.SlovenskoSk,
    slug: 'stanovisko-k-investicnemu-zameru',
    title: 'Žiadosť o stanovisko k investičnému zámeru',
    schemas: stanoviskoKInvesticnemuZameru,
    pospID: '00603481.zavazneStanoviskoKInvesticnejCinnosti',
    pospVersion: '0.7',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: 'Podanie',
    messageSubjectFormat: 'e-ZST ž. {stavba.ulica} {stavba.nazov}, p.č. {stavba.parcelneCislo} kú {stavba.kataster}',
    ginisAssignment: {
      ginisOrganizationName: 'OUIC',
      ginisPersonName: "Vícenová Marcela"
    }
  },
  {
    type: FormDefinitionType.SlovenskoSk,
    slug: 'zavazne-stanovisko-k-investicnej-cinnosti',
    title: 'Žiadosť o záväzné stanovisko k investičnej činnosti',
    schemas: zavazneStanoviskoKInvesticnejCinnosti,
    pospID: '00603481.stanoviskoKInvesticnemuZameru',
    pospVersion: '0.7',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: 'Podanie',
    messageSubjectFormat: 'e-SIZ ž. {stavba.ulica} {stavba.nazov}, p.č. {stavba.parcelneCislo} kú {stavba.kataster}',
    ginisAssignment: {
      ginisOrganizationName: 'OUIC',
      ginisPersonName: "Vícenová Marcela"
    }
  },
  {
    type: FormDefinitionType.SlovenskoSk,
    slug: 'predzahradky',
    title: 'Predzáhradky',
    schemas: predzahradky,
    pospID: '00603481.predzahradky',
    pospVersion: '1.0',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectFormat: 'Registrácia - {predzahradka.typRegistracie} predzáhradka',
    messageSubjectDefault: 'Registrácia predzáhradky'
  },
  {
    type: FormDefinitionType.SlovenskoSk,
    slug: 'komunitne-zahrady',
    title: 'Komunitné záhrady',
    schemas: komunitneZahrady,
    pospID: '00603481.komunitneZahrady',
    pospVersion: '1.0',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: 'Žiadosť o komunitnú záhradu',
    messageSubjectFormat: 'Žiadosť o komunitnú záhradu - {pozemok.typPozemku} mestský pozemok'
  },
  {
    type: FormDefinitionType.Tax,
    title: 'Priznanie k dani z nehnuteľností',
    slug: 'priznanie-k-dani-z-nehnutelnosti',
    schemas: priznanieKDaniZNehnutelnosti,
    pospID: 'esmao.eforms.bratislava.obec_024',
    pospVersion: '201501.2',
    termsAndConditions: taxTermsAndConditions,
    messageSubjectDefault: 'Priznanie k dani z nehnuteľností'
  },
]

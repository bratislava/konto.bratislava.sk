import stanoviskoKInvesticnemuZameru from '../schemas/stanoviskoKInvesticnemuZameru'
import predzahradky from '../schemas/predzahradky'
import priznanieKDaniZNehnutelnosti from '../schemas/priznanieKDaniZNehnutelnosti'
import { generalTermsAndConditions, taxTermsAndConditions } from './termsAndConditions'
import zavazneStanoviskoKInvesticnejCinnosti from '../schemas/zavazneStanoviskoKInvesticnejCinnosti'
import komunitneZahrady from '../schemas/komunitneZahrady'
import { FormDefinition, FormDefinitionType } from './formDefinitionTypes'
import { ziadostONajomBytuSharepointData } from '../sharepoint/mappings/ziadostONajomBytu'
import ziadostONajomBytu, {
  ziadostONajomBytuAdditionalInfoTemplate,
} from '../schemas/ziadostONajomBytu'
import mimoriadnyOdvozAZhodnotenieOdpadu from '../schemas/olo/mimoriadnyOdvozAZhodnotenieOdpadu'
import energetickeZhodnotenieOdpaduVZevo from '../schemas/olo/energetickeZhodnotenieOdpaduVZevo'
import uzatvorenieZmluvyONakladaniSOdpadom from '../schemas/olo/uzatvorenieZmluvyONakladaniSOdpadom'
import docisteniStanovistaZbernychNadob from '../schemas/olo/docisteniStanovistaZbernychNadob'
import odvozOdpaduVelkokapacitnymAleboLisovacimKontajnerom from '../schemas/olo/odvozOdpaduVelkokapacitnymAleboLisovacimKontajnerom'
import koloTaxi from '../schemas/olo/koloTaxi'
import oloTaxi from '../schemas/olo/oloTaxi'
import podnetyAPochvalyObcanov from '../schemas/olo/podnetyAPochvalyObcanov'
import odvozObjemnehoOdpaduValnikom from '../schemas/olo/odvozObjemnehoOdpaduValnikom'
import triedenyZberPapieraPlastovASklaPrePravnickeOsoby from '../schemas/olo/triedenyZberPapieraPlastovASklaPrePravnickeOsoby'
import triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnosti from '../schemas/olo/triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnosti'
import { mapGinisDataPriznanieKDaniZNehnutelnosti, mapGinisDataSur } from './mapGinisData'

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
    mapGinisData: mapGinisDataSur,
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
    mapGinisData: mapGinisDataSur,
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
    mapGinisData: mapGinisDataPriznanieKDaniZNehnutelnosti,
  },
  {
    type: FormDefinitionType.SlovenskoSkGeneric,
    slug: 'ziadost-o-najom-bytu',
    title: 'Žiadosť o nájom bytu',
    schemas: ziadostONajomBytu,
    // pospID contains different wording because the original form was created with a different name
    pospID: '00603481.ziadostONajomnyByt',
    pospVersion: '1.1',
    publisher: 'ico://sk/00603481',
    gestor: 'Pinter Martin',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: 'Žiadosť o nájom bytu',
    sharepointData: ziadostONajomBytuSharepointData,
    ginisAssignment: {
      ginisOrganizationName: 'SNB',
    },
    isSigned: false,
    newGovernmentXml: true,
    additionalInfoTemplate: ziadostONajomBytuAdditionalInfoTemplate,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-mimoriadny-odvoz-a-zhodnotenie-odpadu',
    title: 'TEST - Mimoriadny odvoz a zhodnotenie odpadu',
    schemas: mimoriadnyOdvozAZhodnotenieOdpadu,
    email: 'barbora.puchlova@bratislava.sk',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
    userEmailPath: '', // TODO,
    userNamePath: '', // TODO,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-energeticke-zhodnotenie-odpadu-v-zevo',
    title: 'TEST - Energetické zhodnotenie odpadu v ZEVO',
    schemas: energetickeZhodnotenieOdpaduVZevo,
    email: 'barbora.puchlova@bratislava.sk',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
    userEmailPath: '', // TODO,
    userNamePath: '', // TODO
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-uzatvorenie-zmluvy-o-nakladani-s-odpadom',
    title: 'TEST - Uzatvorenie zmluvy o nakladaní s odpadom',
    schemas: uzatvorenieZmluvyONakladaniSOdpadom,
    email: 'barbora.puchlova@bratislava.sk',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
    userEmailPath: '', // TODO,
    userNamePath: '', // TODO
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-docistenie-stanovista-zbernych-nadob',
    title: 'TEST - Dočistenie stanovišťa zberných nádob',
    schemas: docisteniStanovistaZbernychNadob,
    email: 'barbora.puchlova@bratislava.sk',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
    userEmailPath: '', // TODO,
    userNamePath: '', // TODO
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-odvoz-odpadu-velkokapacitnym-alebo-lisovacim-kontajnerom',
    title: 'TEST - Odvoz odpadu veľkokapacitným alebo lisovacím kontajnerom',
    schemas: odvozOdpaduVelkokapacitnymAleboLisovacimKontajnerom,
    email: 'barbora.puchlova@bratislava.sk',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
    userEmailPath: '', // TODO,
    userNamePath: '', // TODO
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-kolo-taxi',
    title: 'TEST - KOLO Taxi',
    schemas: koloTaxi,
    email: 'barbora.puchlova@bratislava.sk',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
    userEmailPath: '', // TODO,
    userNamePath: '', // TODO
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-olo-taxi',
    title: 'TEST - OLO Taxi',
    schemas: oloTaxi,
    email: 'barbora.puchlova@bratislava.sk',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
    userEmailPath: '', // TODO,
    userNamePath: '', // TODO
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-podnety-a-pochvaly-obcanov',
    title: 'TEST - Podnety a pochvaly občanov',
    schemas: podnetyAPochvalyObcanov,
    email: 'barbora.puchlova@bratislava.sk',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
    userEmailPath: '', // TODO,
    userNamePath: '', // TODO
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-odvoz-objemneho-odpadu-valnikom',
    title: 'TEST - Odvoz objemného odpadu valníkom',
    schemas: odvozObjemnehoOdpaduValnikom,
    email: 'barbora.puchlova@bratislava.sk',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
    userEmailPath: '', // TODO,
    userNamePath: '', // TODO
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-triedeny-zber-papiera-plastov-a-skla-pre-pravnicke-osoby',
    title: 'TEST - Triedený zber papiera, plastov a skla pre právnické osoby',
    schemas: triedenyZberPapieraPlastovASklaPrePravnickeOsoby,
    email: 'barbora.puchlova@bratislava.sk',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
    userEmailPath: '', // TODO,
    userNamePath: '', // TODO
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-triedeny-zber-papiera-plastov-a-skla-pre-spravcovske-spolocnosti',
    title: 'TEST - Triedený zber papiera, plastov a skla pre správcovské spoločnosti',
    schemas: triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnosti,
    email: 'barbora.puchlova@bratislava.sk',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
    userEmailPath: '', // TODO,
    userNamePath: '', // TODO
  },
]

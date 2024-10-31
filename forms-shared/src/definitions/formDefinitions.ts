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
import mimoriadnyOdvozAZhodnotenieOdpadu, {
  mimoriadnyOdvozAZhodnotenieOdpaduExtractEmail,
  mimoriadnyOdvozAZhodnotenieOdpaduExtractName,
} from '../schemas/olo/mimoriadnyOdvozAZhodnotenieOdpadu'
import energetickeZhodnotenieOdpaduVZevo from '../schemas/olo/energetickeZhodnotenieOdpaduVZevo'
import uzatvorenieZmluvyONakladaniSOdpadom from '../schemas/olo/uzatvorenieZmluvyONakladaniSOdpadom'
import docisteniStanovistaZbernychNadob, {
  docisteniStanovistaZbernychNadobExtractEmail,
  docisteniStanovistaZbernychNadobExtractName,
} from '../schemas/olo/docisteniStanovistaZbernychNadob'
import odvozOdpaduVelkokapacitnymAleboLisovacimKontajnerom, {
  odvozOdpaduVelkokapacitnymAleboLisovacimKontajneromExtractEmail,
  odvozOdpaduVelkokapacitnymAleboLisovacimKontajneromExtractName,
} from '../schemas/olo/odvozOdpaduVelkokapacitnymAleboLisovacimKontajnerom'
import koloTaxi, { koloTaxiExtractEmail, koloTaxiExtractName } from '../schemas/olo/koloTaxi'
import oloTaxi, { oloTaxiExtractEmail, oloTaxiExtractName } from '../schemas/olo/oloTaxi'
import podnetyAPochvalyObcanov, {
  podnetyAPochvalyObcanovExtractEmail,
  podnetyAPochvalyObcanovExtractName,
} from '../schemas/olo/podnetyAPochvalyObcanov'
import odvozObjemnehoOdpaduValnikom, {
  odvozObjemnehoOdpaduValnikomExtractEmail,
  odvozObjemnehoOdpaduValnikomExtractName,
} from '../schemas/olo/odvozObjemnehoOdpaduValnikom'
import triedenyZberPapieraPlastovASklaPrePravnickeOsoby, {
  triedenyZberPapieraPlastovASklaPrePravnickeOsobyExtractEmail,
  triedenyZberPapieraPlastovASklaPrePravnickeOsobyExtractName,
} from '../schemas/olo/triedenyZberPapieraPlastovASklaPrePravnickeOsoby'
import triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnosti, {
  triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnostiExtractEmail,
  triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnostiExtractName,
} from '../schemas/olo/triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnosti'
import { zevoExtractEmail, zevoExtractName } from '../schemas/olo/shared/zevoShared'
import objednavkaZakresuSieti from '../schemas/tsb/objednavkaZakresuSieti'
import objednavkaVytycenia from '../schemas/tsb/objednavkaVytycenie'
import umiestnenieZariadenia from '../schemas/tsb/umiestnenieZariadenia'
import ziadostOStanoviskoPD from '../schemas/tsb/ziadostOStanoviskoPD'

export const formDefinitions: FormDefinition[] = [
  {
    type: FormDefinitionType.SlovenskoSkGeneric,
    slug: 'stanovisko-k-investicnemu-zameru',
    title: 'Žiadosť o stanovisko k investičnému zámeru',
    schemas: stanoviskoKInvesticnemuZameru,
    pospID: '00603481.stanoviskoKInvesticnemuZameru',
    pospVersion: '0.9',
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
    newGovernmentXml: true,
  },
  {
    type: FormDefinitionType.SlovenskoSkGeneric,
    slug: 'zavazne-stanovisko-k-investicnej-cinnosti',
    title: 'Žiadosť o záväzné stanovisko k investičnej činnosti',
    schemas: zavazneStanoviskoKInvesticnejCinnosti,
    pospID: '00603481.zavazneStanoviskoKInvesticnejCinnosti',
    pospVersion: '0.8',
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
    newGovernmentXml: true,
  },
  {
    type: FormDefinitionType.SlovenskoSkGeneric,
    slug: 'predzahradky',
    title: 'Predzáhradky',
    schemas: predzahradky,
    pospID: '00603481.predzahradky',
    pospVersion: '1.1',
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
    newGovernmentXml: true,
  },
  {
    type: FormDefinitionType.SlovenskoSkGeneric,
    slug: 'komunitne-zahrady',
    title: 'Komunitné záhrady',
    schemas: komunitneZahrady,
    pospID: '00603481.komunitneZahrady',
    pospVersion: '1.1',
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
    newGovernmentXml: true,
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
    newGovernmentXml: true,
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
    email: 'zakazka@olo.sk,barbora.puchlova@bratislava.sk',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: 'TEST - Mimoriadny odvoz a zhodnotenie odpadu',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
    extractEmail: mimoriadnyOdvozAZhodnotenieOdpaduExtractEmail,
    extractName: mimoriadnyOdvozAZhodnotenieOdpaduExtractName,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-energeticke-zhodnotenie-odpadu-v-zevo',
    title: 'TEST - Energetické zhodnotenie odpadu v ZEVO',
    schemas: energetickeZhodnotenieOdpaduVZevo,
    email: 'zakazka@olo.sk,barbora.puchlova@bratislava.sk',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: 'TEST - Energetické zhodnotenie odpadu v ZEVO',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
    extractEmail: zevoExtractEmail,
    extractName: zevoExtractName,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-uzatvorenie-zmluvy-o-nakladani-s-odpadom',
    title: 'TEST - Uzatvorenie zmluvy o nakladaní s odpadom',
    schemas: uzatvorenieZmluvyONakladaniSOdpadom,
    email: 'zakazka@olo.sk,barbora.puchlova@bratislava.sk',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: 'TEST - Uzatvorenie zmluvy o nakladaní s odpadom',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
    extractEmail: zevoExtractEmail,
    extractName: zevoExtractName,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-docistenie-stanovista-zbernych-nadob',
    title: 'TEST - Dočistenie stanovišťa zberných nádob',
    schemas: docisteniStanovistaZbernychNadob,
    email: 'zakazka@olo.sk,barbora.puchlova@bratislava.sk',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: 'TEST - Dočistenie stanovišťa zberných nádob',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
    extractEmail: docisteniStanovistaZbernychNadobExtractEmail,
    extractName: docisteniStanovistaZbernychNadobExtractName,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-odvoz-odpadu-velkokapacitnym-alebo-lisovacim-kontajnerom',
    title: 'TEST - Odvoz odpadu veľkokapacitným alebo lisovacím kontajnerom',
    schemas: odvozOdpaduVelkokapacitnymAleboLisovacimKontajnerom,
    email: 'zakazka@olo.sk,barbora.puchlova@bratislava.sk',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: 'TEST - Odvoz odpadu veľkokapacitným alebo lisovacím kontajnerom',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
    extractEmail: odvozOdpaduVelkokapacitnymAleboLisovacimKontajneromExtractEmail,
    extractName: odvozOdpaduVelkokapacitnymAleboLisovacimKontajneromExtractName,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-kolo-taxi',
    title: 'TEST - KOLO Taxi',
    schemas: koloTaxi,
    email: 'zakazka@olo.sk,barbora.puchlova@bratislava.sk',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: 'TEST - KOLO Taxi',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
    extractEmail: koloTaxiExtractEmail,
    extractName: koloTaxiExtractName,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-olo-taxi',
    title: 'TEST - OLO Taxi',
    schemas: oloTaxi,
    email: 'zakazka@olo.sk,barbora.puchlova@bratislava.sk',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: 'TEST - OLO Taxi',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
    extractEmail: oloTaxiExtractEmail,
    extractName: oloTaxiExtractName,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-podnety-a-pochvaly-obcanov',
    title: 'TEST - Podnety a pochvaly občanov',
    schemas: podnetyAPochvalyObcanov,
    email: 'zakazka@olo.sk,barbora.puchlova@bratislava.sk',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: 'TEST - Podnety a pochvaly občanov',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
    extractEmail: podnetyAPochvalyObcanovExtractEmail,
    extractName: podnetyAPochvalyObcanovExtractName,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-odvoz-objemneho-odpadu-valnikom',
    title: 'TEST - Odvoz objemného odpadu valníkom',
    schemas: odvozObjemnehoOdpaduValnikom,
    email: 'zakazka@olo.sk,barbora.puchlova@bratislava.sk',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: 'TEST - Odvoz objemného odpadu valníkom',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
    extractEmail: odvozObjemnehoOdpaduValnikomExtractEmail,
    extractName: odvozObjemnehoOdpaduValnikomExtractName,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-triedeny-zber-papiera-plastov-a-skla-pre-pravnicke-osoby',
    title: 'TEST - Triedený zber papiera, plastov a skla pre právnické osoby',
    schemas: triedenyZberPapieraPlastovASklaPrePravnickeOsoby,
    email: 'zakazka@olo.sk,barbora.puchlova@bratislava.sk',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: 'TEST - Triedený zber papiera, plastov a skla pre právnické osoby',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
    extractEmail: triedenyZberPapieraPlastovASklaPrePravnickeOsobyExtractEmail,
    extractName: triedenyZberPapieraPlastovASklaPrePravnickeOsobyExtractName,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-triedeny-zber-papiera-plastov-a-skla-pre-spravcovske-spolocnosti',
    title: 'TEST - Triedený zber papiera, plastov a skla pre správcovské spoločnosti',
    schemas: triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnosti,
    email: 'zakazka@olo.sk,barbora.puchlova@bratislava.sk',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault:
      'TEST - Triedený zber papiera, plastov a skla pre správcovské spoločnosti',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
    extractEmail: triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnostiExtractEmail,
    extractName: triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnostiExtractName,
  },
  {
    type: FormDefinitionType.Webhook,
    slug: 'tsb-objednavka-zakresu-sieti',
    title: 'TEST - Objednávka zákresu sietí',
    schemas: objednavkaZakresuSieti,
    // temporary test webhook, that can be viewed on https://webhook.cool/share/alive-grandmother-18?id=05a4d568b50e9815
    webhookUrl: 'https://alive-grandmother-18.webhook.cool',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    allowSendingUnauthenticatedUsers: true,
  },
  {
    type: FormDefinitionType.Webhook,
    slug: 'tsb-objednavka-vytycenia',
    title: 'TEST - Objednávka vytýčenia',
    schemas: objednavkaVytycenia,
    // temporary test webhook, that can be viewed on https://webhook.cool/share/alive-grandmother-18?id=05a4d568b50e9815
    webhookUrl: 'https://alive-grandmother-18.webhook.cool',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    allowSendingUnauthenticatedUsers: true,
  },
  {
    type: FormDefinitionType.Webhook,
    slug: 'tsb-ziadost-o-stanovisko-pd',
    title: 'TEST - Žiadosť o stanovisko k projektovej dokumentácii',
    schemas: ziadostOStanoviskoPD,
    // temporary test webhook, that can be viewed on https://webhook.cool/share/alive-grandmother-18?id=05a4d568b50e9815
    webhookUrl: 'https://alive-grandmother-18.webhook.cool',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    allowSendingUnauthenticatedUsers: true,
  },
  {
    type: FormDefinitionType.Webhook,
    slug: 'tsb-umiestnenie-zariadenia',
    title: 'TEST - Umiestnenie zariadenia',
    schemas: umiestnenieZariadenia,
    // temporary test webhook, that can be viewed on https://webhook.cool/share/alive-grandmother-18?id=05a4d568b50e9815
    webhookUrl: 'https://alive-grandmother-18.webhook.cool',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    allowSendingUnauthenticatedUsers: true,
  },
]

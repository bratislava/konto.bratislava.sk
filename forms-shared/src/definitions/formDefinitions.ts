import stanoviskoKInvesticnemuZameru from '../schemas/stanoviskoKInvesticnemuZameru'
import predzahradky from '../schemas/predzahradky'
import priznanieKDaniZNehnutelnosti from '../schemas/priznanieKDaniZNehnutelnosti'
import {
  generalTermsAndConditions,
  oloKoloTaxiTermsAndConditions,
  oloTermsAndConditions,
  taxTermsAndConditions,
  ziadostONajomBytuTermsAndConditions,
} from './termsAndConditions'
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
    schema: stanoviskoKInvesticnemuZameru,
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
  },
  {
    type: FormDefinitionType.SlovenskoSkGeneric,
    slug: 'zavazne-stanovisko-k-investicnej-cinnosti',
    title: 'Žiadosť o záväzné stanovisko k investičnej činnosti',
    schema: zavazneStanoviskoKInvesticnejCinnosti,
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
  },
  {
    type: FormDefinitionType.SlovenskoSkGeneric,
    slug: 'predzahradky',
    title: 'Predzáhradky',
    schema: predzahradky,
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
  },
  {
    type: FormDefinitionType.SlovenskoSkGeneric,
    slug: 'komunitne-zahrady',
    title: 'Komunitné záhrady',
    schema: komunitneZahrady,
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
  },
  {
    type: FormDefinitionType.SlovenskoSkTax,
    title: 'Priznanie k dani z nehnuteľností',
    slug: 'priznanie-k-dani-z-nehnutelnosti',
    schema: priznanieKDaniZNehnutelnosti,
    pospID: 'esmao.eforms.bratislava.obec_024',
    pospVersion: '201501.2',
    publisher: 'ico://sk/00603481',
    gestor: 'Cabrnoch Peter',
    termsAndConditions: taxTermsAndConditions,
    messageSubjectDefault: 'Priznanie k dani z nehnuteľností',
    isSigned: true,
  },
  // testing integration of new posID against GINIS&NORIS, will be removed afterwards
  {
    type: FormDefinitionType.SlovenskoSkTax,
    title: 'Priznanie k dani z nehnuteľností',
    slug: 'priznanie-k-dani-z-nehnutelnosti-test',
    schema: priznanieKDaniZNehnutelnosti,
    pospID: 'hmba.eforms.bratislava.obec_024',
    pospVersion: '201501.3',
    publisher: 'ico://sk/00603481',
    gestor: 'ico://sk/00603481',
    termsAndConditions: taxTermsAndConditions,
    messageSubjectDefault: 'Priznanie k dani z nehnuteľností',
    isSigned: true,
  },
  {
    type: FormDefinitionType.SlovenskoSkGeneric,
    slug: 'ziadost-o-najom-bytu',
    title: 'Žiadosť o nájom bytu',
    schema: ziadostONajomBytu,
    // pospID contains different wording because the original form was created with a different name
    pospID: '00603481.ziadostONajomnyByt',
    pospVersion: '1.2',
    publisher: 'ico://sk/00603481',
    gestor: 'Pinter Martin',
    termsAndConditions: ziadostONajomBytuTermsAndConditions,
    messageSubjectDefault: 'Žiadosť o nájom bytu',
    sharepointData: ziadostONajomBytuSharepointData,
    ginisAssignment: {
      ginisOrganizationName: 'SNB',
    },
    isSigned: false,
    additionalInfoTemplate: ziadostONajomBytuAdditionalInfoTemplate,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-mimoriadny-odvoz-a-zhodnotenie-odpadu',
    title: 'Mimoriadny odvoz a zhodnotenie odpadu',
    schema: mimoriadnyOdvozAZhodnotenieOdpadu,
    email: 'zakazka@olo.sk',
    termsAndConditions: oloTermsAndConditions,
    messageSubjectDefault: 'Mimoriadny odvoz a zhodnotenie odpadu',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
    extractEmail: mimoriadnyOdvozAZhodnotenieOdpaduExtractEmail,
    extractName: mimoriadnyOdvozAZhodnotenieOdpaduExtractName,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-energeticke-zhodnotenie-odpadu-v-zevo',
    title: 'Energetické zhodnotenie odpadu v ZEVO',
    schema: energetickeZhodnotenieOdpaduVZevo,
    email: 'obchod@olo.sk',
    termsAndConditions: oloTermsAndConditions,
    messageSubjectDefault: 'Energetické zhodnotenie odpadu v ZEVO',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
    extractEmail: zevoExtractEmail,
    extractName: zevoExtractName,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-uzatvorenie-zmluvy-o-nakladani-s-odpadom',
    title: 'Uzatvorenie zmluvy o nakladaní s odpadom',
    schema: uzatvorenieZmluvyONakladaniSOdpadom,
    email: 'obchod@olo.sk',
    termsAndConditions: oloTermsAndConditions,
    messageSubjectDefault: 'Uzatvorenie zmluvy o nakladaní s odpadom',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
    extractEmail: zevoExtractEmail,
    extractName: zevoExtractName,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-docistenie-stanovista-zbernych-nadob',
    title: 'Dočistenie stanovišťa zberných nádob',
    schema: docisteniStanovistaZbernychNadob,
    email: 'zakazka@olo.sk',
    termsAndConditions: oloTermsAndConditions,
    messageSubjectDefault: 'Dočistenie stanovišťa zberných nádob',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
    extractEmail: docisteniStanovistaZbernychNadobExtractEmail,
    extractName: docisteniStanovistaZbernychNadobExtractName,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-odvoz-odpadu-velkokapacitnym-alebo-lisovacim-kontajnerom',
    title: 'Odvoz odpadu veľkokapacitným alebo lisovacím kontajnerom',
    schema: odvozOdpaduVelkokapacitnymAleboLisovacimKontajnerom,
    email: 'obchod@olo.sk',
    termsAndConditions: oloTermsAndConditions,
    messageSubjectDefault: 'Odvoz odpadu veľkokapacitným alebo lisovacím kontajnerom',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
    extractEmail: odvozOdpaduVelkokapacitnymAleboLisovacimKontajneromExtractEmail,
    extractName: odvozOdpaduVelkokapacitnymAleboLisovacimKontajneromExtractName,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-kolo-taxi',
    title: 'KOLO Taxi',
    schema: koloTaxi,
    email: 'kolo@olo.sk',
    termsAndConditions: oloKoloTaxiTermsAndConditions,
    messageSubjectDefault: 'KOLO Taxi',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
    extractEmail: koloTaxiExtractEmail,
    extractName: koloTaxiExtractName,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-olo-taxi',
    title: 'OLO Taxi',
    schema: oloTaxi,
    email: 'zakazka@olo.sk',
    termsAndConditions: oloTermsAndConditions,
    messageSubjectDefault: 'OLO Taxi',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
    extractEmail: oloTaxiExtractEmail,
    extractName: oloTaxiExtractName,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-podnety-a-pochvaly-obcanov',
    title: 'Podnety a pochvaly občanov',
    schema: podnetyAPochvalyObcanov,
    email: 'zakazka@olo.sk',
    termsAndConditions: oloTermsAndConditions,
    messageSubjectDefault: 'Podnety a pochvaly občanov',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
    extractEmail: podnetyAPochvalyObcanovExtractEmail,
    extractName: podnetyAPochvalyObcanovExtractName,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-odvoz-objemneho-odpadu-valnikom',
    title: 'Odvoz objemného odpadu valníkom',
    schema: odvozObjemnehoOdpaduValnikom,
    email: 'obchod@olo.sk',
    termsAndConditions: oloTermsAndConditions,
    messageSubjectDefault: 'Odvoz objemného odpadu valníkom',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
    extractEmail: odvozObjemnehoOdpaduValnikomExtractEmail,
    extractName: odvozObjemnehoOdpaduValnikomExtractName,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-triedeny-zber-papiera-plastov-a-skla-pre-pravnicke-osoby',
    title: 'Triedený zber papiera, plastov a skla pre právnické osoby',
    schema: triedenyZberPapieraPlastovASklaPrePravnickeOsoby,
    email: 'obchod@olo.sk',
    termsAndConditions: oloTermsAndConditions,
    messageSubjectDefault: 'Triedený zber papiera, plastov a skla pre právnické osoby',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
    extractEmail: triedenyZberPapieraPlastovASklaPrePravnickeOsobyExtractEmail,
    extractName: triedenyZberPapieraPlastovASklaPrePravnickeOsobyExtractName,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-triedeny-zber-papiera-plastov-a-skla-pre-spravcovske-spolocnosti',
    title: 'Triedený zber papiera, plastov a skla pre správcovské spoločnosti',
    schema: triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnosti,
    email: 'zakazka@olo.sk',
    termsAndConditions: oloTermsAndConditions,
    messageSubjectDefault: 'Triedený zber papiera, plastov a skla pre správcovské spoločnosti',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
    extractEmail: triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnostiExtractEmail,
    extractName: triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnostiExtractName,
  },
  {
    type: FormDefinitionType.Webhook,
    slug: 'tsb-objednavka-zakresu-sieti',
    title: 'TEST - Objednávka zákresu sietí',
    schema: objednavkaZakresuSieti,
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
    schema: objednavkaVytycenia,
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
    schema: ziadostOStanoviskoPD,
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
    schema: umiestnenieZariadenia,
    // temporary test webhook, that can be viewed on https://webhook.cool/share/alive-grandmother-18?id=05a4d568b50e9815
    webhookUrl: 'https://alive-grandmother-18.webhook.cool',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    allowSendingUnauthenticatedUsers: true,
  },
]

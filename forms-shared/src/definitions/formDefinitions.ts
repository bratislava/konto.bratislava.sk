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
import objednavkaInformativnehoZakresuSieti, {
  objednavkaInformativnehoZakresuSietiExtractEmail,
  objednavkaInformativnehoZakresuSietiExtractName,
} from '../schemas/tsb/objednavkaInformativnehoZakresuSieti'
import objednavkaVytyceniaPodzemnychVedeniVerejnehoOsvetlenia, {
  objednavkaVytyceniaPodzemnychVedeniVerejnehoOsvetleniaExtractEmail,
  objednavkaVytyceniaPodzemnychVedeniVerejnehoOsvetleniaExtractName,
} from '../schemas/tsb/objednavkaVytyceniaPodzemnychVedeniVerejnehoOsvetlenia'
import ziadostOUmiestnenieInehoZariadeniaNaStoziarVerejnehoOsvetlenia, {
  ziadostOUmiestnenieInehoZariadeniaNaStoziarVerejnehoOsvetleniaExtractEmail,
  ziadostOUmiestnenieInehoZariadeniaNaStoziarVerejnehoOsvetleniaExtractName,
} from '../schemas/tsb/ziadostOUmiestnenieInehoZariadeniaNaStoziarVerejnehoOsvetlenia'
import ziadostOStanoviskoKProjektovejDokumentacii, {
  ziadostOStanoviskoKProjektovejDokumentaciiExtractEmail,
  ziadostOStanoviskoKProjektovejDokumentaciiExtractName,
} from '../schemas/tsb/ziadostOStanoviskoKProjektovejDokumentacii'
import oznamenieOPoplatkovejPovinnostiZaKomunalneOdpady from '../schemas/oznamenieOPoplatkovejPovinnostiZaKomunalneOdpady'
import { MailgunTemplateEnum } from './emailFormTypes'

export const formDefinitions: FormDefinition[] = [
  {
    type: FormDefinitionType.SlovenskoSkGeneric,
    slug: 'stanovisko-k-investicnemu-zameru',
    title: 'Žiadosť o stanovisko k investičnému zámeru',
    jsonVersion: '1.0.0',
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
    feedbackLink: 'https://bravo.staffino.com/bratislava/id=WW1hkstR',
  },
  {
    type: FormDefinitionType.SlovenskoSkGeneric,
    slug: 'zavazne-stanovisko-k-investicnej-cinnosti',
    title: 'Žiadosť o záväzné stanovisko k investičnej činnosti',
    jsonVersion: '1.0.0',
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
    feedbackLink: 'https://bravo.staffino.com/bratislava/id=WW1vhwT6',
  },
  {
    type: FormDefinitionType.SlovenskoSkGeneric,
    slug: 'predzahradky',
    title: 'Predzáhradky',
    jsonVersion: '1.0.0',
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
    jsonVersion: '1.0.0',
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
    jsonVersion: '1.0.0',
    schema: priznanieKDaniZNehnutelnosti,
    pospID: 'esmao.eforms.bratislava.obec_024',
    pospVersion: '201501.2',
    publisher: 'ico://sk/00603481',
    gestor: 'Cabrnoch Peter',
    termsAndConditions: taxTermsAndConditions,
    messageSubjectDefault: 'Priznanie k dani z nehnuteľností',
    isSigned: true,
    feedbackLink: 'https://bravo.staffino.com/bratislava/id=WWFtP1By',
  },
  // testing integration of new posID against GINIS&NORIS, will be removed afterwards
  {
    type: FormDefinitionType.SlovenskoSkTax,
    title: 'Priznanie k dani z nehnuteľností',
    slug: 'priznanie-k-dani-z-nehnutelnosti-test',
    jsonVersion: '1.0.1',
    schema: priznanieKDaniZNehnutelnosti,
    pospID: 'hmba.eforms.bratislava.obec_024',
    pospVersion: '201501.3',
    publisher: 'ico://sk/00603481',
    gestor: 'ico://sk/00603481',
    termsAndConditions: taxTermsAndConditions,
    messageSubjectDefault: 'Priznanie k dani z nehnuteľností',
    isSigned: true,
    exampleFormNotRequired: true,
  },
  {
    type: FormDefinitionType.SlovenskoSkGeneric,
    slug: 'ziadost-o-najom-bytu',
    title: 'Žiadosť o nájom bytu',
    jsonVersion: '1.0.0',
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
    jsonVersion: '1.0.0',
    schema: mimoriadnyOdvozAZhodnotenieOdpadu,
    email: {
      address: { prod: 'zakazka@olo.sk', test: 'inovacie.bratislava@gmail.com' },
      fromAddress: { prod: 'zakazka@olo.sk', test: 'zakazka@olo.sk' },
      extractEmail: mimoriadnyOdvozAZhodnotenieOdpaduExtractEmail,
      extractName: mimoriadnyOdvozAZhodnotenieOdpaduExtractName,
      mailer: 'olo',
      userResponseTemplate: MailgunTemplateEnum.OLO_SENT_SUCCESS,
      newSubmissionTemplate: MailgunTemplateEnum.OLO_NEW_SUBMISSION,
    },
    termsAndConditions: oloTermsAndConditions,
    messageSubjectDefault: 'Mimoriadny odvoz a zhodnotenie odpadu',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-energeticke-zhodnotenie-odpadu-v-zevo',
    title: 'Energetické zhodnotenie odpadu v ZEVO',
    jsonVersion: '1.1.0',
    schema: energetickeZhodnotenieOdpaduVZevo,
    email: {
      address: { prod: 'obchod@olo.sk', test: 'inovacie.bratislava@gmail.com' },
      fromAddress: { prod: 'obchod@olo.sk', test: 'obchod@olo.sk' },
      extractEmail: zevoExtractEmail,
      extractName: zevoExtractName,
      mailer: 'olo',
      userResponseTemplate: MailgunTemplateEnum.OLO_SENT_SUCCESS,
      newSubmissionTemplate: MailgunTemplateEnum.OLO_NEW_SUBMISSION,
    },
    termsAndConditions: oloTermsAndConditions,
    messageSubjectDefault: 'Energetické zhodnotenie odpadu v ZEVO',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-uzatvorenie-zmluvy-o-nakladani-s-odpadom',
    title: 'Uzatvorenie zmluvy o nakladaní s odpadom',
    jsonVersion: '1.1.0',
    schema: uzatvorenieZmluvyONakladaniSOdpadom,
    email: {
      address: { prod: 'obchod@olo.sk', test: 'inovacie.bratislava@gmail.com' },
      fromAddress: { prod: 'obchod@olo.sk', test: 'obchod@olo.sk' },
      extractEmail: zevoExtractEmail,
      extractName: zevoExtractName,
      mailer: 'olo',
      userResponseTemplate: MailgunTemplateEnum.OLO_SENT_SUCCESS,
      newSubmissionTemplate: MailgunTemplateEnum.OLO_NEW_SUBMISSION,
    },
    termsAndConditions: oloTermsAndConditions,
    messageSubjectDefault: 'Uzatvorenie zmluvy o nakladaní s odpadom',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-docistenie-stanovista-zbernych-nadob',
    title: 'Dočistenie stanovišťa zberných nádob',
    jsonVersion: '1.0.0',
    schema: docisteniStanovistaZbernychNadob,
    email: {
      address: { prod: 'zakazka@olo.sk', test: 'inovacie.bratislava@gmail.com' },
      fromAddress: { prod: 'zakazka@olo.sk', test: 'zakazka@olo.sk' },
      extractEmail: docisteniStanovistaZbernychNadobExtractEmail,
      extractName: docisteniStanovistaZbernychNadobExtractName,
      mailer: 'olo',
      userResponseTemplate: MailgunTemplateEnum.OLO_SENT_SUCCESS,
      newSubmissionTemplate: MailgunTemplateEnum.OLO_NEW_SUBMISSION,
    },
    termsAndConditions: oloTermsAndConditions,
    messageSubjectDefault: 'Dočistenie stanovišťa zberných nádob',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-odvoz-odpadu-velkokapacitnym-alebo-lisovacim-kontajnerom',
    title: 'Odvoz odpadu veľkokapacitným alebo lisovacím kontajnerom',
    jsonVersion: '1.0.0',
    schema: odvozOdpaduVelkokapacitnymAleboLisovacimKontajnerom,
    email: {
      address: { prod: 'obchod@olo.sk', test: 'inovacie.bratislava@gmail.com' },
      fromAddress: { prod: 'obchod@olo.sk', test: 'obchod@olo.sk' },
      extractEmail: odvozOdpaduVelkokapacitnymAleboLisovacimKontajneromExtractEmail,
      extractName: odvozOdpaduVelkokapacitnymAleboLisovacimKontajneromExtractName,
      mailer: 'olo',
      userResponseTemplate: MailgunTemplateEnum.OLO_SENT_SUCCESS,
      newSubmissionTemplate: MailgunTemplateEnum.OLO_NEW_SUBMISSION,
    },
    termsAndConditions: oloTermsAndConditions,
    messageSubjectDefault: 'Odvoz odpadu veľkokapacitným alebo lisovacím kontajnerom',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-kolo-taxi',
    title: 'KOLO Taxi',
    jsonVersion: '1.0.0',
    schema: koloTaxi,
    email: {
      address: { prod: 'kolo@olo.sk', test: 'inovacie.bratislava@gmail.com' },
      fromAddress: { prod: 'kolo@olo.sk', test: 'kolo@olo.sk' },
      extractEmail: koloTaxiExtractEmail,
      extractName: koloTaxiExtractName,
      mailer: 'olo',
      userResponseTemplate: MailgunTemplateEnum.OLO_SENT_SUCCESS,
      newSubmissionTemplate: MailgunTemplateEnum.OLO_NEW_SUBMISSION,
    },
    termsAndConditions: oloKoloTaxiTermsAndConditions,
    messageSubjectDefault: 'KOLO Taxi',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-olo-taxi',
    title: 'OLO Taxi',
    jsonVersion: '1.0.0',
    schema: oloTaxi,
    email: {
      address: { prod: 'zakazka@olo.sk', test: 'inovacie.bratislava@gmail.com' },
      fromAddress: { prod: 'zakazka@olo.sk', test: 'zakazka@olo.sk' },
      extractEmail: oloTaxiExtractEmail,
      extractName: oloTaxiExtractName,
      mailer: 'olo',
      userResponseTemplate: MailgunTemplateEnum.OLO_SENT_SUCCESS,
      newSubmissionTemplate: MailgunTemplateEnum.OLO_NEW_SUBMISSION,
    },
    termsAndConditions: oloTermsAndConditions,
    messageSubjectDefault: 'OLO Taxi',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-podnety-a-pochvaly-obcanov',
    title: 'Podnety a pochvaly občanov',
    jsonVersion: '1.0.0',
    schema: podnetyAPochvalyObcanov,
    email: {
      address: { prod: 'zakazka@olo.sk', test: 'inovacie.bratislava@gmail.com' },
      fromAddress: { prod: 'zakazka@olo.sk', test: 'zakazka@olo.sk' },
      extractEmail: podnetyAPochvalyObcanovExtractEmail,
      extractName: podnetyAPochvalyObcanovExtractName,
      mailer: 'olo',
      userResponseTemplate: MailgunTemplateEnum.OLO_SENT_SUCCESS,
      newSubmissionTemplate: MailgunTemplateEnum.OLO_NEW_SUBMISSION,
    },
    termsAndConditions: oloTermsAndConditions,
    messageSubjectDefault: 'Podnety a pochvaly občanov',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-odvoz-objemneho-odpadu-valnikom',
    title: 'Odvoz objemného odpadu valníkom',
    jsonVersion: '1.0.0',
    schema: odvozObjemnehoOdpaduValnikom,
    email: {
      address: { prod: 'obchod@olo.sk', test: 'inovacie.bratislava@gmail.com' },
      fromAddress: { prod: 'obchod@olo.sk', test: 'obchod@olo.sk' },
      extractEmail: odvozObjemnehoOdpaduValnikomExtractEmail,
      extractName: odvozObjemnehoOdpaduValnikomExtractName,
      mailer: 'olo',
      userResponseTemplate: MailgunTemplateEnum.OLO_SENT_SUCCESS,
      newSubmissionTemplate: MailgunTemplateEnum.OLO_NEW_SUBMISSION,
    },
    termsAndConditions: oloTermsAndConditions,
    messageSubjectDefault: 'Odvoz objemného odpadu valníkom',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-triedeny-zber-papiera-plastov-a-skla-pre-pravnicke-osoby',
    title: 'Triedený zber papiera, plastov a skla pre právnické osoby',
    jsonVersion: '1.1.0',
    schema: triedenyZberPapieraPlastovASklaPrePravnickeOsoby,
    email: {
      address: { prod: 'obchod@olo.sk', test: 'inovacie.bratislava@gmail.com' },
      fromAddress: { prod: 'obchod@olo.sk', test: 'obchod@olo.sk' },
      extractEmail: triedenyZberPapieraPlastovASklaPrePravnickeOsobyExtractEmail,
      extractName: triedenyZberPapieraPlastovASklaPrePravnickeOsobyExtractName,
      mailer: 'olo',
      userResponseTemplate: MailgunTemplateEnum.OLO_SENT_SUCCESS,
      newSubmissionTemplate: MailgunTemplateEnum.OLO_NEW_SUBMISSION,
    },
    termsAndConditions: oloTermsAndConditions,
    messageSubjectDefault: 'Triedený zber papiera, plastov a skla pre právnické osoby',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-triedeny-zber-papiera-plastov-a-skla-pre-spravcovske-spolocnosti',
    title: 'Triedený zber papiera, plastov a skla pre správcovské spoločnosti',
    jsonVersion: '1.0.0',
    schema: triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnosti,
    email: {
      address: { prod: 'zakazka@olo.sk', test: 'inovacie.bratislava@gmail.com' },
      fromAddress: { prod: 'zakazka@olo.sk', test: 'zakazka@olo.sk' },
      extractEmail: triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnostiExtractEmail,
      extractName: triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnostiExtractName,
      mailer: 'olo',
      userResponseTemplate: MailgunTemplateEnum.OLO_SENT_SUCCESS,
      newSubmissionTemplate: MailgunTemplateEnum.OLO_NEW_SUBMISSION,
    },
    termsAndConditions: oloTermsAndConditions,
    messageSubjectDefault: 'Triedený zber papiera, plastov a skla pre správcovské spoločnosti',
    embedded: 'olo',
    allowSendingUnauthenticatedUsers: true,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'tsb-objednavka-informativneho-zakresu-sieti',
    title: 'Objednávka informatívneho zákresu sietí',
    jsonVersion: '1.0.0',
    schema: objednavkaInformativnehoZakresuSieti,
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: 'Objednávka informatívneho zákresu sietí',
    allowSendingUnauthenticatedUsers: true,
    exampleFormNotRequired: true,
    email: {
      address: { prod: 'wf-izs@tsb.sk', test: 'inovacie.bratislava@gmail.com' },
      fromAddress: { prod: 'konto@bratislava.sk', test: 'konto@bratislava.sk' },
      extractEmail: objednavkaInformativnehoZakresuSietiExtractEmail,
      extractName: objednavkaInformativnehoZakresuSietiExtractName,
      mailer: 'mailgun',
      userResponseTemplate: MailgunTemplateEnum.TSB_SENT_SUCCESS,
      newSubmissionTemplate: MailgunTemplateEnum.TSB_NEW_SUBMISSION,
      sendJsonDataAttachmentInTechnicalMail: true,
      technicalEmailSubject: 'tsb-objednavka-informativneho-zakresu-sieti',
    },
  },
  {
    type: FormDefinitionType.Email,
    slug: 'tsb-objednavka-vytycenia-podzemnych-vedeni-verejneho-osvetlenia',
    title: 'Objednávka vytýčenia podzemných vedení verejného osvetlenia',
    jsonVersion: '1.0.0',
    schema: objednavkaVytyceniaPodzemnychVedeniVerejnehoOsvetlenia,
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: 'Objednávka vytýčenia podzemných vedení verejného osvetlenia',
    allowSendingUnauthenticatedUsers: true,
    exampleFormNotRequired: true,
    email: {
      address: { prod: 'wf-vs@tsb.sk', test: 'inovacie.bratislava@gmail.com' },
      fromAddress: { prod: 'konto@bratislava.sk', test: 'konto@bratislava.sk' },
      extractEmail: objednavkaVytyceniaPodzemnychVedeniVerejnehoOsvetleniaExtractEmail,
      extractName: objednavkaVytyceniaPodzemnychVedeniVerejnehoOsvetleniaExtractName,
      mailer: 'mailgun',
      userResponseTemplate: MailgunTemplateEnum.TSB_SENT_SUCCESS,
      newSubmissionTemplate: MailgunTemplateEnum.TSB_NEW_SUBMISSION,
      sendJsonDataAttachmentInTechnicalMail: true,
      technicalEmailSubject: 'tsb-objednavka-vytycenia-podzemnych-vedeni-verejneho-osvetlenia',
    },
  },
  {
    type: FormDefinitionType.Email,
    slug: 'tsb-ziadost-o-stanovisko-k-projektovej-dokumentacii',
    title: 'Žiadosť o stanovisko k projektovej dokumentácii',
    jsonVersion: '1.0.0',
    schema: ziadostOStanoviskoKProjektovejDokumentacii,
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: 'Žiadosť o stanovisko k projektovej dokumentácii',
    allowSendingUnauthenticatedUsers: true,
    exampleFormNotRequired: true,
    email: {
      address: { prod: 'wf-oskpd@tsb.sk', test: 'inovacie.bratislava@gmail.com' },
      fromAddress: { prod: 'konto@bratislava.sk', test: 'konto@bratislava.sk' },
      extractEmail: ziadostOStanoviskoKProjektovejDokumentaciiExtractEmail,
      extractName: ziadostOStanoviskoKProjektovejDokumentaciiExtractName,
      mailer: 'mailgun',
      userResponseTemplate: MailgunTemplateEnum.TSB_SENT_SUCCESS,
      newSubmissionTemplate: MailgunTemplateEnum.TSB_NEW_SUBMISSION,
      sendJsonDataAttachmentInTechnicalMail: true,
      technicalEmailSubject: 'tsb-ziadost-o-stanovisko-k-projektovej-dokumentacii',
    },
  },
  {
    type: FormDefinitionType.Email,
    slug: 'tsb-ziadost-o-umiestnenie-ineho-zariadenia-na-stoziar-verejneho-osvetlenia',
    title: 'Žiadosť o umiestnenie iného zariadenia na stožiar verejného osvetlenia',
    jsonVersion: '1.0.0',
    schema: ziadostOUmiestnenieInehoZariadeniaNaStoziarVerejnehoOsvetlenia,
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: 'Žiadosť o umiestnenie iného zariadenia na stožiar verejného osvetlenia',
    allowSendingUnauthenticatedUsers: true,
    exampleFormNotRequired: true,
    email: {
      address: { prod: 'wf-ouz@bratislava.sk', test: 'inovacie.bratislava@gmail.com' },
      fromAddress: { prod: 'konto@bratislava.sk', test: 'konto@bratislava.sk' },
      extractEmail: ziadostOUmiestnenieInehoZariadeniaNaStoziarVerejnehoOsvetleniaExtractEmail,
      extractName: ziadostOUmiestnenieInehoZariadeniaNaStoziarVerejnehoOsvetleniaExtractName,
      mailer: 'mailgun',
      userResponseTemplate: MailgunTemplateEnum.TSB_SENT_SUCCESS,
      newSubmissionTemplate: MailgunTemplateEnum.TSB_NEW_SUBMISSION,
      sendJsonDataAttachmentInTechnicalMail: true,
      technicalEmailSubject:
        'tsb-ziadost-o-umiestnenie-ineho-zariadenia-na-stoziar-verejneho-osvetlenia',
    },
  },
  {
    type: FormDefinitionType.SlovenskoSkGeneric,
    slug: 'oznamenie-o-poplatkovej-povinnosti-za-komunalne-odpady',
    title: 'Oznámenie o poplatkovej povinnosti za komunálne odpady',
    jsonVersion: '1.0.0',
    schema: oznamenieOPoplatkovejPovinnostiZaKomunalneOdpady,
    pospID: '00603481.oznamenieOPoplatkovejPovinnostiZaKomunalneOdpady',
    pospVersion: '1.0',
    publisher: 'ico://sk/00603481',
    gestor: 'ico://sk/00603481',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: 'Oznámenie o poplatkovej povinnosti za komunálne odpady',
    ginisAssignment: {
      ginisOrganizationName: 'OMDP',
    },
    isSigned: true,
    feedbackLink: 'https://bravo.staffino.com/bratislava/id=WWFOtcNg',
  },
]

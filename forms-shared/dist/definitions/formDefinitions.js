"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formDefinitions = void 0;
const stanoviskoKInvesticnemuZameru_1 = __importDefault(require("../schemas/stanoviskoKInvesticnemuZameru"));
const predzahradky_1 = __importDefault(require("../schemas/predzahradky"));
const priznanieKDaniZNehnutelnosti_1 = __importDefault(require("../schemas/priznanieKDaniZNehnutelnosti"));
const termsAndConditions_1 = require("./termsAndConditions");
const zavazneStanoviskoKInvesticnejCinnosti_1 = __importDefault(require("../schemas/zavazneStanoviskoKInvesticnejCinnosti"));
const komunitneZahrady_1 = __importDefault(require("../schemas/komunitneZahrady"));
const formDefinitionTypes_1 = require("./formDefinitionTypes");
const ziadostONajomBytu_1 = require("../sharepoint/mappings/ziadostONajomBytu");
const ziadostONajomBytu_2 = __importStar(require("../schemas/ziadostONajomBytu"));
const mimoriadnyOdvozAZhodnotenieOdpadu_1 = __importStar(require("../schemas/olo/mimoriadnyOdvozAZhodnotenieOdpadu"));
const energetickeZhodnotenieOdpaduVZevo_1 = __importDefault(require("../schemas/olo/energetickeZhodnotenieOdpaduVZevo"));
const uzatvorenieZmluvyONakladaniSOdpadom_1 = __importDefault(require("../schemas/olo/uzatvorenieZmluvyONakladaniSOdpadom"));
const docisteniStanovistaZbernychNadob_1 = __importStar(require("../schemas/olo/docisteniStanovistaZbernychNadob"));
const odvozOdpaduVelkokapacitnymAleboLisovacimKontajnerom_1 = __importStar(require("../schemas/olo/odvozOdpaduVelkokapacitnymAleboLisovacimKontajnerom"));
const koloTaxi_1 = __importStar(require("../schemas/olo/koloTaxi"));
const oloTaxi_1 = __importStar(require("../schemas/olo/oloTaxi"));
const podnetyAPochvalyObcanov_1 = __importStar(require("../schemas/olo/podnetyAPochvalyObcanov"));
const odvozObjemnehoOdpaduValnikom_1 = __importStar(require("../schemas/olo/odvozObjemnehoOdpaduValnikom"));
const triedenyZberPapieraPlastovASklaPrePravnickeOsoby_1 = __importStar(require("../schemas/olo/triedenyZberPapieraPlastovASklaPrePravnickeOsoby"));
const triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnosti_1 = __importStar(require("../schemas/olo/triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnosti"));
const zevoShared_1 = require("../schemas/olo/shared/zevoShared");
const objednavkaZakresuSieti_1 = __importDefault(require("../schemas/tsb/objednavkaZakresuSieti"));
const objednavkaVytycenie_1 = __importDefault(require("../schemas/tsb/objednavkaVytycenie"));
const umiestnenieZariadenia_1 = __importDefault(require("../schemas/tsb/umiestnenieZariadenia"));
const ziadostOStanoviskoPD_1 = __importDefault(require("../schemas/tsb/ziadostOStanoviskoPD"));
exports.formDefinitions = [
    {
        type: formDefinitionTypes_1.FormDefinitionType.SlovenskoSkGeneric,
        slug: 'stanovisko-k-investicnemu-zameru',
        title: 'Žiadosť o stanovisko k investičnému zámeru',
        schemas: stanoviskoKInvesticnemuZameru_1.default,
        pospID: '00603481.stanoviskoKInvesticnemuZameru',
        pospVersion: '0.9',
        publisher: 'ico://sk/00603481',
        gestor: 'Pinter Martin',
        termsAndConditions: termsAndConditions_1.generalTermsAndConditions,
        messageSubjectDefault: 'Podanie',
        messageSubjectFormat: 'e-SIZ ž. {stavba.ulica} {stavba.nazov}, p.č. {stavba.parcelneCislo} kú {stavba.kataster}',
        ginisAssignment: {
            ginisOrganizationName: 'OUIC',
            ginisPersonName: 'Simeunovičová Ľudmila',
        },
        isSigned: false,
    },
    {
        type: formDefinitionTypes_1.FormDefinitionType.SlovenskoSkGeneric,
        slug: 'zavazne-stanovisko-k-investicnej-cinnosti',
        title: 'Žiadosť o záväzné stanovisko k investičnej činnosti',
        schemas: zavazneStanoviskoKInvesticnejCinnosti_1.default,
        pospID: '00603481.zavazneStanoviskoKInvesticnejCinnosti',
        pospVersion: '0.8',
        publisher: 'ico://sk/00603481',
        gestor: 'Pinter Martin',
        termsAndConditions: termsAndConditions_1.generalTermsAndConditions,
        messageSubjectDefault: 'Podanie',
        messageSubjectFormat: 'e-ZST ž. {stavba.ulica} {stavba.nazov}, p.č. {stavba.parcelneCislo} kú {stavba.kataster}',
        ginisAssignment: {
            ginisOrganizationName: 'OUIC',
            ginisPersonName: 'Simeunovičová Ľudmila',
        },
        isSigned: false,
    },
    {
        type: formDefinitionTypes_1.FormDefinitionType.SlovenskoSkGeneric,
        slug: 'predzahradky',
        title: 'Predzáhradky',
        schemas: predzahradky_1.default,
        pospID: '00603481.predzahradky',
        pospVersion: '1.1',
        publisher: 'ico://sk/00603481',
        gestor: 'Pinter Martin',
        termsAndConditions: termsAndConditions_1.generalTermsAndConditions,
        messageSubjectFormat: 'Registrácia - {predzahradka.typRegistracie} predzáhradka',
        messageSubjectDefault: 'Registrácia predzáhradky',
        isSigned: false,
        ginisAssignment: {
            ginisOrganizationName: 'OUIC',
            ginisPersonName: 'Simeunovičová Ľudmila',
        },
    },
    {
        type: formDefinitionTypes_1.FormDefinitionType.SlovenskoSkGeneric,
        slug: 'komunitne-zahrady',
        title: 'Komunitné záhrady',
        schemas: komunitneZahrady_1.default,
        pospID: '00603481.komunitneZahrady',
        pospVersion: '1.1',
        publisher: 'ico://sk/00603481',
        gestor: 'Pinter Martin',
        termsAndConditions: termsAndConditions_1.generalTermsAndConditions,
        messageSubjectDefault: 'Žiadosť o komunitnú záhradu',
        messageSubjectFormat: 'Žiadosť o komunitnú záhradu - {pozemok.typPozemku} mestský pozemok',
        isSigned: false,
        ginisAssignment: {
            ginisOrganizationName: 'OUIC',
            ginisPersonName: 'Simeunovičová Ľudmila',
        },
    },
    {
        type: formDefinitionTypes_1.FormDefinitionType.SlovenskoSkTax,
        title: 'Priznanie k dani z nehnuteľností',
        slug: 'priznanie-k-dani-z-nehnutelnosti',
        schemas: priznanieKDaniZNehnutelnosti_1.default,
        pospID: 'esmao.eforms.bratislava.obec_024',
        pospVersion: '201501.2',
        publisher: 'ico://sk/00603481',
        gestor: 'Cabrnoch Peter',
        termsAndConditions: termsAndConditions_1.taxTermsAndConditions,
        messageSubjectDefault: 'Priznanie k dani z nehnuteľností',
        isSigned: true,
    },
    // testing integration of new posID against GINIS&NORIS, will be removed afterwards
    {
        type: formDefinitionTypes_1.FormDefinitionType.SlovenskoSkTax,
        title: 'Priznanie k dani z nehnuteľností',
        slug: 'priznanie-k-dani-z-nehnutelnosti-test',
        schemas: priznanieKDaniZNehnutelnosti_1.default,
        pospID: 'hmba.eforms.bratislava.obec_024',
        pospVersion: '201501.3',
        publisher: 'ico://sk/00603481',
        gestor: 'ico://sk/00603481',
        termsAndConditions: termsAndConditions_1.taxTermsAndConditions,
        messageSubjectDefault: 'Priznanie k dani z nehnuteľností',
        isSigned: true,
    },
    {
        type: formDefinitionTypes_1.FormDefinitionType.SlovenskoSkGeneric,
        slug: 'ziadost-o-najom-bytu',
        title: 'Žiadosť o nájom bytu',
        schemas: ziadostONajomBytu_2.default,
        // pospID contains different wording because the original form was created with a different name
        pospID: '00603481.ziadostONajomnyByt',
        pospVersion: '1.2',
        publisher: 'ico://sk/00603481',
        gestor: 'Pinter Martin',
        termsAndConditions: termsAndConditions_1.generalTermsAndConditions,
        messageSubjectDefault: 'Žiadosť o nájom bytu',
        sharepointData: ziadostONajomBytu_1.ziadostONajomBytuSharepointData,
        ginisAssignment: {
            ginisOrganizationName: 'SNB',
        },
        isSigned: false,
        additionalInfoTemplate: ziadostONajomBytu_2.ziadostONajomBytuAdditionalInfoTemplate,
    },
    {
        type: formDefinitionTypes_1.FormDefinitionType.Email,
        slug: 'olo-mimoriadny-odvoz-a-zhodnotenie-odpadu',
        title: 'Mimoriadny odvoz a zhodnotenie odpadu',
        schemas: mimoriadnyOdvozAZhodnotenieOdpadu_1.default,
        email: 'zakazka@olo.sk',
        termsAndConditions: termsAndConditions_1.oloTermsAndConditions,
        messageSubjectDefault: 'Mimoriadny odvoz a zhodnotenie odpadu',
        embedded: 'olo',
        allowSendingUnauthenticatedUsers: true,
        extractEmail: mimoriadnyOdvozAZhodnotenieOdpadu_1.mimoriadnyOdvozAZhodnotenieOdpaduExtractEmail,
        extractName: mimoriadnyOdvozAZhodnotenieOdpadu_1.mimoriadnyOdvozAZhodnotenieOdpaduExtractName,
    },
    {
        type: formDefinitionTypes_1.FormDefinitionType.Email,
        slug: 'olo-energeticke-zhodnotenie-odpadu-v-zevo',
        title: 'Energetické zhodnotenie odpadu v ZEVO',
        schemas: energetickeZhodnotenieOdpaduVZevo_1.default,
        email: 'obchod@olo.sk',
        termsAndConditions: termsAndConditions_1.oloTermsAndConditions,
        messageSubjectDefault: 'Energetické zhodnotenie odpadu v ZEVO',
        embedded: 'olo',
        allowSendingUnauthenticatedUsers: true,
        extractEmail: zevoShared_1.zevoExtractEmail,
        extractName: zevoShared_1.zevoExtractName,
    },
    {
        type: formDefinitionTypes_1.FormDefinitionType.Email,
        slug: 'olo-uzatvorenie-zmluvy-o-nakladani-s-odpadom',
        title: 'Uzatvorenie zmluvy o nakladaní s odpadom',
        schemas: uzatvorenieZmluvyONakladaniSOdpadom_1.default,
        email: 'obchod@olo.sk',
        termsAndConditions: termsAndConditions_1.oloTermsAndConditions,
        messageSubjectDefault: 'Uzatvorenie zmluvy o nakladaní s odpadom',
        embedded: 'olo',
        allowSendingUnauthenticatedUsers: true,
        extractEmail: zevoShared_1.zevoExtractEmail,
        extractName: zevoShared_1.zevoExtractName,
    },
    {
        type: formDefinitionTypes_1.FormDefinitionType.Email,
        slug: 'olo-docistenie-stanovista-zbernych-nadob',
        title: 'Dočistenie stanovišťa zberných nádob',
        schemas: docisteniStanovistaZbernychNadob_1.default,
        email: 'zakazka@olo.sk',
        termsAndConditions: termsAndConditions_1.oloTermsAndConditions,
        messageSubjectDefault: 'Dočistenie stanovišťa zberných nádob',
        embedded: 'olo',
        allowSendingUnauthenticatedUsers: true,
        extractEmail: docisteniStanovistaZbernychNadob_1.docisteniStanovistaZbernychNadobExtractEmail,
        extractName: docisteniStanovistaZbernychNadob_1.docisteniStanovistaZbernychNadobExtractName,
    },
    {
        type: formDefinitionTypes_1.FormDefinitionType.Email,
        slug: 'olo-odvoz-odpadu-velkokapacitnym-alebo-lisovacim-kontajnerom',
        title: 'Odvoz odpadu veľkokapacitným alebo lisovacím kontajnerom',
        schemas: odvozOdpaduVelkokapacitnymAleboLisovacimKontajnerom_1.default,
        email: 'obchod@olo.sk',
        termsAndConditions: termsAndConditions_1.oloTermsAndConditions,
        messageSubjectDefault: 'Odvoz odpadu veľkokapacitným alebo lisovacím kontajnerom',
        embedded: 'olo',
        allowSendingUnauthenticatedUsers: true,
        extractEmail: odvozOdpaduVelkokapacitnymAleboLisovacimKontajnerom_1.odvozOdpaduVelkokapacitnymAleboLisovacimKontajneromExtractEmail,
        extractName: odvozOdpaduVelkokapacitnymAleboLisovacimKontajnerom_1.odvozOdpaduVelkokapacitnymAleboLisovacimKontajneromExtractName,
    },
    {
        type: formDefinitionTypes_1.FormDefinitionType.Email,
        slug: 'olo-kolo-taxi',
        title: 'KOLO Taxi',
        schemas: koloTaxi_1.default,
        email: 'kolo@olo.sk',
        termsAndConditions: termsAndConditions_1.oloTermsAndConditions,
        messageSubjectDefault: 'KOLO Taxi',
        embedded: 'olo',
        allowSendingUnauthenticatedUsers: true,
        extractEmail: koloTaxi_1.koloTaxiExtractEmail,
        extractName: koloTaxi_1.koloTaxiExtractName,
    },
    {
        type: formDefinitionTypes_1.FormDefinitionType.Email,
        slug: 'olo-olo-taxi',
        title: 'OLO Taxi',
        schemas: oloTaxi_1.default,
        email: 'zakazka@olo.sk',
        termsAndConditions: termsAndConditions_1.oloTermsAndConditions,
        messageSubjectDefault: 'OLO Taxi',
        embedded: 'olo',
        allowSendingUnauthenticatedUsers: true,
        extractEmail: oloTaxi_1.oloTaxiExtractEmail,
        extractName: oloTaxi_1.oloTaxiExtractName,
    },
    {
        type: formDefinitionTypes_1.FormDefinitionType.Email,
        slug: 'olo-podnety-a-pochvaly-obcanov',
        title: 'Podnety a pochvaly občanov',
        schemas: podnetyAPochvalyObcanov_1.default,
        email: 'zakazka@olo.sk',
        termsAndConditions: termsAndConditions_1.oloTermsAndConditions,
        messageSubjectDefault: 'Podnety a pochvaly občanov',
        embedded: 'olo',
        allowSendingUnauthenticatedUsers: true,
        extractEmail: podnetyAPochvalyObcanov_1.podnetyAPochvalyObcanovExtractEmail,
        extractName: podnetyAPochvalyObcanov_1.podnetyAPochvalyObcanovExtractName,
    },
    {
        type: formDefinitionTypes_1.FormDefinitionType.Email,
        slug: 'olo-odvoz-objemneho-odpadu-valnikom',
        title: 'Odvoz objemného odpadu valníkom',
        schemas: odvozObjemnehoOdpaduValnikom_1.default,
        email: 'obchod@olo.sk',
        termsAndConditions: termsAndConditions_1.oloTermsAndConditions,
        messageSubjectDefault: 'Odvoz objemného odpadu valníkom',
        embedded: 'olo',
        allowSendingUnauthenticatedUsers: true,
        extractEmail: odvozObjemnehoOdpaduValnikom_1.odvozObjemnehoOdpaduValnikomExtractEmail,
        extractName: odvozObjemnehoOdpaduValnikom_1.odvozObjemnehoOdpaduValnikomExtractName,
    },
    {
        type: formDefinitionTypes_1.FormDefinitionType.Email,
        slug: 'olo-triedeny-zber-papiera-plastov-a-skla-pre-pravnicke-osoby',
        title: 'Triedený zber papiera, plastov a skla pre právnické osoby',
        schemas: triedenyZberPapieraPlastovASklaPrePravnickeOsoby_1.default,
        email: 'obchod@olo.sk',
        termsAndConditions: termsAndConditions_1.oloTermsAndConditions,
        messageSubjectDefault: 'Triedený zber papiera, plastov a skla pre právnické osoby',
        embedded: 'olo',
        allowSendingUnauthenticatedUsers: true,
        extractEmail: triedenyZberPapieraPlastovASklaPrePravnickeOsoby_1.triedenyZberPapieraPlastovASklaPrePravnickeOsobyExtractEmail,
        extractName: triedenyZberPapieraPlastovASklaPrePravnickeOsoby_1.triedenyZberPapieraPlastovASklaPrePravnickeOsobyExtractName,
    },
    {
        type: formDefinitionTypes_1.FormDefinitionType.Email,
        slug: 'olo-triedeny-zber-papiera-plastov-a-skla-pre-spravcovske-spolocnosti',
        title: 'Triedený zber papiera, plastov a skla pre správcovské spoločnosti',
        schemas: triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnosti_1.default,
        email: 'zakazka@olo.sk',
        termsAndConditions: termsAndConditions_1.oloTermsAndConditions,
        messageSubjectDefault: 'Triedený zber papiera, plastov a skla pre správcovské spoločnosti',
        embedded: 'olo',
        allowSendingUnauthenticatedUsers: true,
        extractEmail: triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnosti_1.triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnostiExtractEmail,
        extractName: triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnosti_1.triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnostiExtractName,
    },
    {
        type: formDefinitionTypes_1.FormDefinitionType.Webhook,
        slug: 'tsb-objednavka-zakresu-sieti',
        title: 'TEST - Objednávka zákresu sietí',
        schemas: objednavkaZakresuSieti_1.default,
        // temporary test webhook, that can be viewed on https://webhook.cool/share/alive-grandmother-18?id=05a4d568b50e9815
        webhookUrl: 'https://alive-grandmother-18.webhook.cool',
        termsAndConditions: termsAndConditions_1.generalTermsAndConditions,
        messageSubjectDefault: '',
        allowSendingUnauthenticatedUsers: true,
    },
    {
        type: formDefinitionTypes_1.FormDefinitionType.Webhook,
        slug: 'tsb-objednavka-vytycenia',
        title: 'TEST - Objednávka vytýčenia',
        schemas: objednavkaVytycenie_1.default,
        // temporary test webhook, that can be viewed on https://webhook.cool/share/alive-grandmother-18?id=05a4d568b50e9815
        webhookUrl: 'https://alive-grandmother-18.webhook.cool',
        termsAndConditions: termsAndConditions_1.generalTermsAndConditions,
        messageSubjectDefault: '',
        allowSendingUnauthenticatedUsers: true,
    },
    {
        type: formDefinitionTypes_1.FormDefinitionType.Webhook,
        slug: 'tsb-ziadost-o-stanovisko-pd',
        title: 'TEST - Žiadosť o stanovisko k projektovej dokumentácii',
        schemas: ziadostOStanoviskoPD_1.default,
        // temporary test webhook, that can be viewed on https://webhook.cool/share/alive-grandmother-18?id=05a4d568b50e9815
        webhookUrl: 'https://alive-grandmother-18.webhook.cool',
        termsAndConditions: termsAndConditions_1.generalTermsAndConditions,
        messageSubjectDefault: '',
        allowSendingUnauthenticatedUsers: true,
    },
    {
        type: formDefinitionTypes_1.FormDefinitionType.Webhook,
        slug: 'tsb-umiestnenie-zariadenia',
        title: 'TEST - Umiestnenie zariadenia',
        schemas: umiestnenieZariadenia_1.default,
        // temporary test webhook, that can be viewed on https://webhook.cool/share/alive-grandmother-18?id=05a4d568b50e9815
        webhookUrl: 'https://alive-grandmother-18.webhook.cool',
        termsAndConditions: termsAndConditions_1.generalTermsAndConditions,
        messageSubjectDefault: '',
        allowSendingUnauthenticatedUsers: true,
    },
];

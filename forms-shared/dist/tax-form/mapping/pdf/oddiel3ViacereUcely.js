"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oddiel3ViacereUcely = void 0;
const dates_1 = require("../shared/dates");
const oddiel3ViacereUcelyShared_1 = require("../shared/oddiel3ViacereUcelyShared");
const functions_1 = require("./functions");
const udajeODanovnikovi_1 = require("./udajeODanovnikovi");
function splitNumber(inputNumber) {
    const formattedDecimal = (0, functions_1.formatDecimalPdf)(inputNumber, true);
    if (formattedDecimal == null) {
        return { integerPart: undefined, decimalPart: undefined };
    }
    const [integerPart, decimalPart] = formattedDecimal.split(',');
    return {
        integerPart,
        decimalPart,
    };
}
const oddiel3ViacereUcely = (data) => {
    const udaje = (0, udajeODanovnikovi_1.udajeODanovnikovi)(data);
    const mapping = (0, oddiel3ViacereUcelyShared_1.oddiel3ViacereUcelyShared)(data);
    return (0, functions_1.generateCopies)(mapping, (priznanie) => {
        const stavbyFields = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'].map((type, index) => {
            const vymera = priznanie.vymeryStaviebPodlaTypu[type];
            if (vymera === 0) {
                return {};
            }
            const { integerPart, decimalPart } = splitNumber(vymera);
            return {
                [`5_VymeraPloch${index + 1}`]: integerPart,
                [`5_VymeraPlochK${index + 1}`]: decimalPart,
            };
        });
        return {
            '5_Ico': udaje.Ico,
            '5_RodneCislo1': udaje.RodneCislo1,
            '5_RodneCislo2': udaje.RodneCislo2,
            '5_Obec': 'Bratislava',
            '5_Ulica': priznanie.ulicaACisloDomu,
            '5_CisloSupisne': (0, functions_1.formatIntegerPdf)(priznanie.supisneCislo),
            '5_NazovUzemia': priznanie.katastralneUzemie,
            '5_CisloParcely': priznanie.cisloParcely,
            '5_chbVlastnik': priznanie.isVlastnik,
            '5_chbSpravca': priznanie.isSpravca,
            '5_chbNajomca': priznanie.isNajomca,
            '5_chbUzivatel': priznanie.isUzivatel,
            '5_chbSpolPodiel': priznanie.isPodieloveSpoluvlastnictvo,
            '5_chbSpolBezpodiel': priznanie.isBezpodieloveSpoluvlastnictvo,
            '5_RodneCislo3': (0, functions_1.formatRodneCisloFirstPartPdf)(priznanie.rodneCisloManzelaManzelky),
            '5_RodneCislo4': (0, functions_1.formatRodneCisloSecondPartPdf)(priznanie.rodneCisloManzelaManzelky),
            '5_PocetSpol': (0, functions_1.formatIntegerPdf)(priznanie.pocetSpoluvlastnikov),
            '5_chbDohodaSpolAno': priznanie.spoluvlastnikUrcenyDohodou === true,
            '5_chbDohodaSpolNie': priznanie.spoluvlastnikUrcenyDohodou === false,
            '5_PopisStavby': priznanie.popisStavby,
            '5_DatumVzniku': (0, dates_1.formatDatePdf)(priznanie.datumVznikuDanovejPovinnosti),
            '5_DatumZaniku': (0, dates_1.formatDatePdf)(priznanie.datumZanikuDanovejPovinnosti),
            '5_ZakladDane': (0, functions_1.formatIntegerPdf)(priznanie.zakladDane),
            '5_CelkovaVymera': (0, functions_1.formatIntegerPdf)(priznanie.celkovaVymera),
            '5_VymeraOslobodena': (0, functions_1.formatIntegerPdf)(priznanie.vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb),
            '5_PocetPodlazi': (0, functions_1.formatIntegerPdf)(priznanie?.pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia),
            '5_Poznamka': priznanie.poznamka,
            ...(0, functions_1.mergeObjects)(stavbyFields),
        };
    });
};
exports.oddiel3ViacereUcely = oddiel3ViacereUcely;

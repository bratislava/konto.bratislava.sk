"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oddiel4 = void 0;
const dates_1 = require("../shared/dates");
const oddiel4Shared_1 = require("../shared/oddiel4Shared");
const functions_1 = require("./functions");
const udajeODanovnikovi_1 = require("./udajeODanovnikovi");
// Both fields have broken names in the original PDF, so we need to fix them.
const getCisloPriestoruFieldName = (index) => index <= 2 ? `6_Cislo Priest${index}` : `6_CisloPriest${index}`;
const getUcelVyuzitiaFieldName = (index) => index >= 4 ? `6_UcelVVyuzitia${index}` : `6_UcelVyuzitia${index}`;
const oddiel4 = (data) => {
    const udaje = (0, udajeODanovnikovi_1.udajeODanovnikovi)(data);
    const mapping = (0, oddiel4Shared_1.oddiel4Shared)(data);
    return (0, functions_1.generateCopies)(mapping, (priznanie) => {
        const nebytovePriestoryObjects = priznanie.nebytovePriestory.map((nebytovyPriestor, nebytovyPriestorIndex) => {
            const fixedIndex = nebytovyPriestorIndex + 1;
            return {
                [`6_Pc${fixedIndex}`]: `${fixedIndex}.`,
                [getCisloPriestoruFieldName(fixedIndex)]: nebytovyPriestor.cisloNebytovehoPriestoruVBytovomDome,
                [getUcelVyuzitiaFieldName(fixedIndex)]: nebytovyPriestor.ucelVyuzitiaNebytovehoPriestoruVBytovomDome,
                [`6_DatumVzniku${fixedIndex}`]: (0, dates_1.formatDatePdf)(nebytovyPriestor.datumVznikuDanovejPovinnosti),
                [`6_VymeraPozemku${fixedIndex}`]: (0, functions_1.formatIntegerPdf)(nebytovyPriestor.vymeraPodlahovychPlochNebytovehoPriestoruVBytovomDome),
                [`6_DatumZaniku${fixedIndex}`]: (0, dates_1.formatDatePdf)(nebytovyPriestor.datumZanikuDanovejPovinnosti),
            };
        });
        return {
            '6_Ico': udaje.Ico,
            '6_RodneCislo1': udaje.RodneCislo1,
            '6_RodneCislo2': udaje.RodneCislo2,
            '6_Obec': 'Bratislava',
            '6_Ulica': priznanie.ulicaACisloDomu,
            '6_CisloSupisne': (0, functions_1.formatIntegerPdf)(priznanie.supisneCislo),
            '6_NazovUzemia': priznanie.katastralneUzemie,
            '6_CisloParcely': priznanie.cisloParcely,
            '6_chbVlastnik': priznanie.isVlastnik,
            '6_chbSpravca': priznanie.isSpravca,
            '6_chbSpolPodiel': priznanie.isPodieloveSpoluvlastnictvo,
            '6_chbSpolBezpodiel': priznanie.isBezpodieloveSpoluvlastnictvo,
            '6_RodneCislo3': (0, functions_1.formatRodneCisloFirstPartPdf)(priznanie.rodneCisloManzelaManzelky),
            '6_RodneCislo4': (0, functions_1.formatRodneCisloSecondPartPdf)(priznanie.rodneCisloManzelaManzelky),
            '6_PocetSpol': (0, functions_1.formatIntegerPdf)(priznanie.pocetSpoluvlastnikov),
            '6_chbDohodaSpolAno': priznanie.spoluvlastnikUrcenyDohodou === true,
            '6_chbDohodaSpolNie': priznanie.spoluvlastnikUrcenyDohodou === false,
            '6_CisloBytu': priznanie.byt?.cisloBytu,
            '6_PopisBytu': priznanie.byt?.popisBytu,
            '6_DatumVzniku': (0, dates_1.formatDatePdf)(priznanie.byt?.datumVznikuDanovejPovinnosti),
            '6_DatumZaniku': (0, dates_1.formatDatePdf)(priznanie.byt?.datumZanikuDanovejPovinnosti),
            '6_ZDBytu': (0, functions_1.formatIntegerPdf)(priznanie.byt?.zakladDane),
            '6_Vymera': (0, functions_1.formatIntegerPdf)(priznanie.byt?.vymeraPodlahovejPlochyNaIneUcely),
            '6_Poznamka': priznanie.poznamka,
            ...(0, functions_1.mergeObjects)(nebytovePriestoryObjects),
        };
    });
};
exports.oddiel4 = oddiel4;

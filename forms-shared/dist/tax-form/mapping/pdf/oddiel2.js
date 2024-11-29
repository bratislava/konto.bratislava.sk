"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oddiel2 = void 0;
const dates_1 = require("../shared/dates");
const oddiel2Shared_1 = require("../shared/oddiel2Shared");
const functions_1 = require("./functions");
const udajeODanovnikovi_1 = require("./udajeODanovnikovi");
const oddiel2 = (data) => {
    const udaje = (0, udajeODanovnikovi_1.udajeODanovnikovi)(data);
    const mapping = (0, oddiel2Shared_1.oddiel2Shared)(data);
    return (0, functions_1.generateCopies)(mapping, (priznanie) => {
        const pozemky = priznanie.pozemky.map((pozemok, pozemokIndex) => {
            const fixedIndex = pozemokIndex + 1;
            return {
                [`3_Pc${fixedIndex}`]: `${fixedIndex}.`,
                [`3_NazovKat${fixedIndex}`]: pozemok.katastralneUzemie,
                [`3_CisloParcely${fixedIndex}`]: pozemok.cisloParcely,
                [`3_DruhPozemku${fixedIndex}`]: pozemok.druhPozemku,
                [`3_VyuzitiePozemku${fixedIndex}`]: pozemok.sposobVyuzitiaPozemku,
                [`3_DatumVzniku${fixedIndex}`]: (0, dates_1.formatDatePdf)(pozemok.datumVznikuDanovejPovinnosti),
                [`3_VymeraPozemku${fixedIndex}`]: (0, functions_1.formatDecimalPdf)(pozemok.vymeraPozemku),
                [`3_DatumZaniku${fixedIndex}`]: (0, dates_1.formatDatePdf)(pozemok.datumZanikuDanovejPovinnosti),
            };
        });
        return {
            '3_Ico': udaje.Ico,
            '3_RodneCislo1': udaje.RodneCislo1,
            '3_RodneCislo2': udaje.RodneCislo2,
            '3_Obec': priznanie.obec,
            '3_chbHodnotaAno': priznanie.hodnotaUrcenaZnaleckymPosudkom,
            '3_chbHodnotaNie': !priznanie.hodnotaUrcenaZnaleckymPosudkom,
            '3_chbVlastnik': priznanie.isVlastnik,
            '3_chbSpravca': priznanie.isSpravca,
            '3_chbNajomca': priznanie.isNajomca,
            '3_chbUzivatel': priznanie.isUzivatel,
            '3_chbSpolPodiel': priznanie.isPodieloveSpoluvlastnictvo,
            '3_chbSpolBezpodiel': priznanie.isBezpodieloveSpoluvlastnictvo,
            '3_RodneCislo1Man': (0, functions_1.formatRodneCisloFirstPartPdf)(priznanie.rodneCisloManzelaManzelky),
            '3_RodneCislo2Man': (0, functions_1.formatRodneCisloSecondPartPdf)(priznanie.rodneCisloManzelaManzelky),
            '3_PocetSpol': (0, functions_1.formatIntegerPdf)(priznanie.pocetSpoluvlastnikov),
            '3_chbDohodaSpolAno': priznanie.spoluvlastnikUrcenyDohodou === true,
            '3_chbDohodaSpolNie': priznanie.spoluvlastnikUrcenyDohodou === false,
            '3_Poznamka': priznanie.poznamka,
            ...(0, functions_1.mergeObjects)(pozemky),
        };
    });
};
exports.oddiel2 = oddiel2;

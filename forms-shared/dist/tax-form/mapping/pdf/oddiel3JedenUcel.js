"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oddiel3JedenUcel = void 0;
const dates_1 = require("../shared/dates");
const oddiel3JedenUcelShared_1 = require("../shared/oddiel3JedenUcelShared");
const functions_1 = require("./functions");
const udajeODanovnikovi_1 = require("./udajeODanovnikovi");
const oddiel3JedenUcel = (data) => {
    const udaje = (0, udajeODanovnikovi_1.udajeODanovnikovi)(data);
    const mapping = (0, oddiel3JedenUcelShared_1.oddiel3JedenUcelShared)(data);
    return (0, functions_1.generateCopies)(mapping, (priznanie) => ({
        '4_Ico': udaje.Ico,
        '4_RodneCislo1': udaje.RodneCislo1,
        '4_RodneCislo2': udaje.RodneCislo2,
        '4_Obec': priznanie.obec,
        '4_Ulica': priznanie.ulicaACisloDomu,
        '4_CisloSupisne': (0, functions_1.formatIntegerPdf)(priznanie.supisneCislo),
        '4_NazovUzemia': priznanie.katastralneUzemie,
        '4_CisloParcely': priznanie.cisloParcely,
        '4_chbVlastnik': priznanie.isVlastnik,
        '4_chbSpravca': priznanie.isSpravca,
        '4_chbNajomca': priznanie.isNajomca,
        '4_chbUzivatel': priznanie.isUzivatel,
        '4_chbSpolPodiel': priznanie.isPodieloveSpoluvlastnictvo,
        '4_chbSpolBezpodiel': priznanie.isBezpodieloveSpoluvlastnictvo,
        '4_RodneCislo3': (0, functions_1.formatRodneCisloFirstPartPdf)(priznanie.rodneCisloManzelaManzelky),
        '4_RodneCislo4': (0, functions_1.formatRodneCisloSecondPartPdf)(priznanie.rodneCisloManzelaManzelky),
        '4_PocetSpol': (0, functions_1.formatIntegerPdf)(priznanie.pocetSpoluvlastnikov),
        '4_chbDohodaSpolAno': priznanie.spoluvlastnikUrcenyDohodou === true,
        '4_chbDohodaSpolNie': priznanie.spoluvlastnikUrcenyDohodou === false,
        '4_DatumVzniku': (0, dates_1.formatDatePdf)(priznanie.datumVznikuDanovejPovinnosti),
        '4_DatumZaniku': (0, dates_1.formatDatePdf)(priznanie.datumZanikuDanovejPovinnosti),
        '4_chbPredmetDane1': priznanie.predmetDane === 'a',
        '4_chbPredmetDane2': priznanie.predmetDane === 'b',
        '4_chbPredmetDane3': priznanie.predmetDane === 'c',
        '4_chbPredmetDane4': priznanie.predmetDane === 'd',
        '4_chbPredmetDane5': priznanie.predmetDane === 'e',
        '4_chbPredmetDane6': priznanie.predmetDane === 'f',
        '4_chbPredmetDane7': priznanie.predmetDane === 'g',
        '4_chbPredmetDane8': priznanie.predmetDane === 'h',
        '4_chbPredmetDane9': priznanie.predmetDane === 'i',
        '4_ZakladDane': (0, functions_1.formatIntegerPdf)(priznanie.zakladDane),
        '4_PocetPodlazi': (0, functions_1.formatIntegerPdf)(priznanie.pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia),
        '4_CelkovaVymera': (0, functions_1.formatIntegerPdf)(priznanie.celkovaVymeraPodlahovychPlochVsetkychPodlaziStavby),
        '4_VymeraPloch': (0, functions_1.formatIntegerPdf)(priznanie.vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb),
        '4_Poznamka': priznanie.poznamka,
    }));
};
exports.oddiel3JedenUcel = oddiel3JedenUcel;

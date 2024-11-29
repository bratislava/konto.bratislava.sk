"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oddiel3JedenUcelShared = void 0;
const functions_1 = require("./functions");
const oddielBaseShared_1 = require("./oddielBaseShared");
const calculators_1 = require("../../../form-calculators/calculators");
const safeData_1 = require("../../../form-utils/safeData");
const mapPriznanie = (data, priznanie) => {
    const pouzitKalkulacku = (0, safeData_1.safeBoolean)(data.danZoStaviebJedenUcel?.kalkulackaWrapper?.pouzitKalkulacku) === true;
    const zakladDane = pouzitKalkulacku
        ? (0, calculators_1.calculateFormCalculatorFormula)('ceil (celkovaZastavanaPlocha * evalRatio(spoluvlastnickyPodiel))', priznanie)
        : (0, safeData_1.safeNumber)(priznanie?.zakladDane);
    const cisloListuVlastnictva = (0, safeData_1.safeString)(priznanie.cisloListuVlastnictva);
    const poznamka = [
        (0, safeData_1.safeString)(priznanie.poznamka),
        cisloListuVlastnictva ? `Číslo LV: ${cisloListuVlastnictva}` : null,
    ]
        .filter(Boolean)
        .join('\n');
    return {
        ...(0, oddielBaseShared_1.oddielBaseShared)(data, priznanie),
        ulicaACisloDomu: (0, safeData_1.safeString)(priznanie?.riadok1?.ulicaACisloDomu),
        supisneCislo: (0, safeData_1.safeNumber)(priznanie?.riadok1?.supisneCislo),
        katastralneUzemie: (0, safeData_1.safeString)(priznanie?.riadok2?.kataster),
        cisloParcely: (0, safeData_1.safeString)(priznanie?.riadok2?.cisloParcely),
        datumVznikuDanovejPovinnosti: (0, functions_1.parseDateFieldDate)(priznanie.datumy?.datumVznikuDanovejPovinnosti),
        datumZanikuDanovejPovinnosti: (0, functions_1.parseDateFieldDate)(priznanie.datumy?.datumZanikuDanovejPovinnosti),
        predmetDane: priznanie?.predmetDane,
        zakladDane,
        pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia: (0, safeData_1.safeNumber)(priznanie?.pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia),
        celkovaVymeraPodlahovychPlochVsetkychPodlaziStavby: (0, safeData_1.safeNumber)(priznanie?.castStavbyOslobodenaOdDaneDetaily
            ?.celkovaVymeraPodlahovychPlochVsetkychPodlaziStavby),
        vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb: (0, safeData_1.safeNumber)(priznanie?.castStavbyOslobodenaOdDaneDetaily
            ?.vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb),
        poznamka,
    };
};
const oddiel3JedenUcelShared = (data) => {
    if ((0, safeData_1.safeBoolean)(data.danZoStaviebJedenUcel?.vyplnitObject?.vyplnit) !== true) {
        return [];
    }
    return (0, safeData_1.safeArray)(data.danZoStaviebJedenUcel?.priznania).map((priznanie) => mapPriznanie(data, priznanie));
};
exports.oddiel3JedenUcelShared = oddiel3JedenUcelShared;

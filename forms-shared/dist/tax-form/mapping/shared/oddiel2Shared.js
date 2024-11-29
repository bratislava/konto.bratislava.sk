"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oddiel2Shared = void 0;
const functions_1 = require("./functions");
const oddielBaseShared_1 = require("./oddielBaseShared");
const calculators_1 = require("../../../form-calculators/calculators");
const safeData_1 = require("../../../form-utils/safeData");
const mapPriznanie = (data, priznanie) => {
    const pozemky = (0, safeData_1.safeArray)(priznanie.pozemky).slice(0, 17);
    const pozemkyHodnotaUrcenaZnaleckymPosudkom = pozemky
        .map((pozemok, index) => ({
        index,
        hodnotaUrcenaZnaleckymPosudkom: (pozemok.druhPozemku === 'D' || pozemok.druhPozemku === 'G') &&
            (0, safeData_1.safeBoolean)(pozemok.hodnotaUrcenaZnaleckymPosudkom) === true,
    }))
        .filter(({ hodnotaUrcenaZnaleckymPosudkom }) => hodnotaUrcenaZnaleckymPosudkom);
    const pozemkyMapped = pozemky.map((pozemok) => {
        const pouzitKalkulacku = (0, safeData_1.safeBoolean)(data.danZPozemkov?.kalkulackaWrapper?.pouzitKalkulacku) === true;
        const vymeraPozemku = pouzitKalkulacku
            ? (0, calculators_1.calculateFormCalculatorFormula)('roundTo(evalRatio(podielPriestoruNaSpolocnychCastiachAZariadeniachDomu) * evalRatio(spoluvlastnickyPodiel) * celkovaVymeraPozemku, 2)', pozemok)
            : (0, safeData_1.safeNumber)(pozemok?.vymeraPozemku);
        return {
            katastralneUzemie: (0, safeData_1.safeString)(pozemok.kataster),
            cisloParcely: (0, safeData_1.safeString)(pozemok.parcelneCisloSposobVyuzitiaPozemku?.cisloParcely),
            druhPozemku: (0, safeData_1.safeString)(pozemok.druhPozemku),
            sposobVyuzitiaPozemku: (0, safeData_1.safeString)(pozemok.parcelneCisloSposobVyuzitiaPozemku?.sposobVyuzitiaPozemku),
            datumVznikuDanovejPovinnosti: (0, functions_1.parseDateFieldDate)(pozemok.datumy?.datumVznikuDanovejPovinnosti),
            datumZanikuDanovejPovinnosti: (0, functions_1.parseDateFieldDate)(pozemok.datumy?.datumZanikuDanovejPovinnosti),
            vymeraPozemku,
        };
    });
    const poznamkaPozemkyLV = pozemky
        .map((pozemok, pozemokIndex) => {
        const cisloListuVlastnictva = (0, safeData_1.safeString)(pozemok.cisloListuVlastnictva);
        if (!cisloListuVlastnictva) {
            return null;
        }
        return `č. ${pozemokIndex + 1} LV: ${cisloListuVlastnictva}`;
    })
        .filter(Boolean)
        .join(' | ');
    const poznamkaPozemkyHodnotaUrcenaZnaleckymPosudkom = pozemkyHodnotaUrcenaZnaleckymPosudkom.length > 0
        ? `Hodnota určená znaleckým posudkom: ${pozemkyHodnotaUrcenaZnaleckymPosudkom
            .map(({ index }) => `č. ${index + 1}`)
            .join(', ')}`
        : null;
    const poznamka = [
        (0, safeData_1.safeString)(priznanie.poznamka),
        poznamkaPozemkyLV,
        poznamkaPozemkyHodnotaUrcenaZnaleckymPosudkom,
    ]
        .filter(Boolean)
        .join('\n');
    return {
        ...(0, oddielBaseShared_1.oddielBaseShared)(data, priznanie),
        hodnotaUrcenaZnaleckymPosudkom: pozemkyHodnotaUrcenaZnaleckymPosudkom.length > 0,
        pozemky: pozemkyMapped,
        poznamka,
    };
};
const oddiel2Shared = (data) => {
    if ((0, safeData_1.safeBoolean)(data.danZPozemkov?.vyplnitObject?.vyplnit) !== true) {
        return [];
    }
    return (0, safeData_1.safeArray)(data.danZPozemkov?.priznania).map((priznanie) => mapPriznanie(data, priznanie));
};
exports.oddiel2Shared = oddiel2Shared;

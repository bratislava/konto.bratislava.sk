"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oddiel4Shared = void 0;
const functions_1 = require("./functions");
const oddielBaseShared_1 = require("./oddielBaseShared");
const calculators_1 = require("../../../form-calculators/calculators");
const safeData_1 = require("../../../form-utils/safeData");
const zakladDaneFormula = `denominator = ratioDenominator(podielPriestoruNaSpolocnychCastiachAZariadeniachDomu);
                      highestPowerOf10 = pow(10, floor(log10 denominator));
                      isSpecialCase = denominator >= 1000 and denominator % highestPowerOf10 == 0;
                      ceil ((isSpecialCase ? celkovaVymeraSpecialCase : ratioNumerator(podielPriestoruNaSpolocnychCastiachAZariadeniachDomu) / 100) * evalRatio(spoluvlastnickyPodiel))`;
const pouzitKalkulacku = (data) => (0, safeData_1.safeBoolean)(data.danZBytovANebytovychPriestorov?.kalkulackaWrapper?.pouzitKalkulacku) === true;
const priznanieZaBytMapping = (data, priznanie) => {
    if ((0, safeData_1.safeBoolean)(priznanie?.priznanieZaByt?.priznanieZaByt) !== true) {
        return null;
    }
    const zakladDane = pouzitKalkulacku(data)
        ? (0, calculators_1.calculateFormCalculatorFormula)(zakladDaneFormula, priznanie?.priznanieZaByt ?? {})
        : (0, safeData_1.safeNumber)(priznanie?.priznanieZaByt?.vymeraPodlahovejPlochyBytu);
    return {
        cisloBytu: (0, safeData_1.safeString)(priznanie?.priznanieZaByt?.cisloBytu),
        popisBytu: (0, safeData_1.safeString)(priznanie?.priznanieZaByt?.popisBytu),
        datumVznikuDanovejPovinnosti: (0, functions_1.parseDateFieldDate)(priznanie?.priznanieZaByt?.datumy?.datumVznikuDanovejPovinnosti),
        datumZanikuDanovejPovinnosti: (0, functions_1.parseDateFieldDate)(priznanie?.priznanieZaByt?.datumy?.datumZanikuDanovejPovinnosti),
        zakladDane,
        vymeraPodlahovejPlochyNaIneUcely: (0, safeData_1.safeNumber)(priznanie.priznanieZaByt?.vymeraPodlahovejPlochyNaIneUcely),
    };
};
const priznanieZaNebytovePriestoryMapping = (data, priznanie) => {
    if ((0, safeData_1.safeBoolean)(priznanie?.priznanieZaNebytovyPriestor?.priznanieZaNebytovyPriestor) !== true) {
        return [];
    }
    const nebytovePriestory = (0, safeData_1.safeArray)(priznanie.priznanieZaNebytovyPriestor?.nebytovePriestory).slice(0, 15);
    return nebytovePriestory.map((nebytovyPriestor) => {
        const vymeraPodlahovychPlochNebytovehoPriestoruVBytovomDome = pouzitKalkulacku(data)
            ? (0, calculators_1.calculateFormCalculatorFormula)(zakladDaneFormula, nebytovyPriestor)
            : (0, safeData_1.safeNumber)(nebytovyPriestor?.vymeraPodlahovychPlochNebytovehoPriestoruVBytovomDome);
        return {
            cisloNebytovehoPriestoruVBytovomDome: (0, safeData_1.safeString)(nebytovyPriestor?.riadok?.cisloNebytovehoPriestoruVBytovomDome),
            ucelVyuzitiaNebytovehoPriestoruVBytovomDome: (0, safeData_1.safeString)(nebytovyPriestor?.riadok?.ucelVyuzitiaNebytovehoPriestoruVBytovomDome),
            datumVznikuDanovejPovinnosti: (0, functions_1.parseDateFieldDate)(nebytovyPriestor?.datumy?.datumVznikuDanovejPovinnosti),
            datumZanikuDanovejPovinnosti: (0, functions_1.parseDateFieldDate)(nebytovyPriestor?.datumy?.datumZanikuDanovejPovinnosti),
            vymeraPodlahovychPlochNebytovehoPriestoruVBytovomDome,
        };
    });
};
const mapPriznanie = (data, priznanie) => {
    const cisloListuVlastnictva = (0, safeData_1.safeString)(priznanie.cisloListuVlastnictva);
    const poznamka = [
        (0, safeData_1.safeString)(priznanie.poznamka),
        cisloListuVlastnictva ? `Číslo LV: ${cisloListuVlastnictva}` : null,
    ]
        .filter(Boolean)
        .join('\n');
    return {
        ...(0, oddielBaseShared_1.oddielBaseShared)(data, priznanie, true),
        ulicaACisloDomu: (0, safeData_1.safeString)(priznanie?.riadok1?.ulicaACisloDomu),
        supisneCislo: (0, safeData_1.safeNumber)(priznanie?.riadok1?.supisneCislo),
        katastralneUzemie: (0, safeData_1.safeString)(priznanie?.riadok2?.kataster),
        cisloParcely: (0, safeData_1.safeString)(priznanie?.riadok2?.cisloParcely),
        byt: priznanieZaBytMapping(data, priznanie),
        nebytovePriestory: priznanieZaNebytovePriestoryMapping(data, priznanie),
        poznamka,
    };
};
const oddiel4Shared = (data) => {
    if ((0, safeData_1.safeBoolean)(data.danZBytovANebytovychPriestorov?.vyplnitObject?.vyplnit) !== true) {
        return [];
    }
    return (0, safeData_1.safeArray)(data.danZBytovANebytovychPriestorov?.priznania).map((priznanie) => mapPriznanie(data, priznanie));
};
exports.oddiel4Shared = oddiel4Shared;

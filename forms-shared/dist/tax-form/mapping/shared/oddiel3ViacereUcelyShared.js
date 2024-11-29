"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oddiel3ViacereUcelyShared = void 0;
const functions_1 = require("./functions");
const oddielBaseShared_1 = require("./oddielBaseShared");
const calculators_1 = require("../../../form-calculators/calculators");
const safeData_1 = require("../../../form-utils/safeData");
const getVymeryStaviebPodlaTypu = (stavba, pouzitKalkulacku) => {
    const stavbyCalculated = (0, safeData_1.safeArray)(stavba.nehnutelnosti?.nehnutelnosti).map((nehnutelnost) => {
        if (!pouzitKalkulacku) {
            return {
                ucelVyuzitiaStavby: (0, safeData_1.safeString)(nehnutelnost.ucelVyuzitiaStavby),
                vymeraPodlahovejPlochy: (0, safeData_1.safeNumber)(nehnutelnost.vymeraPodlahovejPlochy),
            };
        }
        return {
            ucelVyuzitiaStavby: (0, safeData_1.safeString)(nehnutelnost.ucelVyuzitiaStavby),
            vymeraPodlahovejPlochy: (0, calculators_1.calculateFormCalculatorFormula)('roundTo(ratioNumerator(podielPriestoruNaSpolocnychCastiachAZariadeniachDomu) * evalRatio(spoluvlastnickyPodiel) / 100, 2)', nehnutelnost) ?? undefined,
        };
    });
    const types = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
    const array = types.map((type) => {
        const stavbyByType = stavbyCalculated?.filter((stavbaInner) => stavbaInner.ucelVyuzitiaStavby === type);
        const sum = stavbyByType?.reduce((a, b) => a + (b?.vymeraPodlahovejPlochy ?? 0), 0);
        return [type, sum];
    });
    return Object.fromEntries(array);
};
const mapPriznanie = (data, priznanie) => {
    const pouzitKalkulacku = (0, safeData_1.safeBoolean)(data.danZoStaviebViacereUcely?.kalkulackaWrapper?.pouzitKalkulacku) === true;
    const zakladDane = pouzitKalkulacku
        ? (0, calculators_1.calculateFormCalculatorFormula)('f(n) = evalRatio(n.podielPriestoruNaSpolocnychCastiachAZariadeniachDomu) * evalRatio(n.spoluvlastnickyPodiel) * celkovaVymera; mapped = map(f, nehnutelnosti.nehnutelnosti); sum(a, b) = a+b; ceil fold(sum, 0, mapped)', priznanie)
        : (0, safeData_1.safeNumber)(priznanie.zakladDane);
    const celkovaVymera = pouzitKalkulacku
        ? (0, calculators_1.calculateFormCalculatorFormula)('f(n) = ratioNumerator(n.podielPriestoruNaSpolocnychCastiachAZariadeniachDomu) * evalRatio(n.spoluvlastnickyPodiel) / 100; mapped = map(f, nehnutelnosti.nehnutelnosti); sum(a, b) = a+b; ceil fold(sum, 0, mapped)', priznanie)
        : (0, safeData_1.safeNumber)(priznanie.celkovaVymera);
    const vymeryStaviebPodlaTypu = getVymeryStaviebPodlaTypu(priznanie, pouzitKalkulacku);
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
        popisStavby: (0, safeData_1.safeString)(priznanie?.popisStavby),
        datumVznikuDanovejPovinnosti: (0, functions_1.parseDateFieldDate)(priznanie?.datumy?.datumVznikuDanovejPovinnosti),
        datumZanikuDanovejPovinnosti: (0, functions_1.parseDateFieldDate)(priznanie?.datumy?.datumZanikuDanovejPovinnosti),
        zakladDane,
        celkovaVymera,
        vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb: (0, safeData_1.safeBoolean)(priznanie.castStavbyOslobodenaOdDane) === true
            ? (0, safeData_1.safeNumber)(priznanie?.vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb)
            : undefined,
        pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia: (0, safeData_1.safeNumber)(priznanie?.pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia),
        vymeryStaviebPodlaTypu,
        poznamka,
    };
};
const oddiel3ViacereUcelyShared = (data) => {
    if ((0, safeData_1.safeBoolean)(data.danZoStaviebViacereUcely?.vyplnitObject?.vyplnit) !== true) {
        return [];
    }
    return (0, safeData_1.safeArray)(data.danZoStaviebViacereUcely?.priznania).map((priznanie) => mapPriznanie(data, priznanie));
};
exports.oddiel3ViacereUcelyShared = oddiel3ViacereUcelyShared;

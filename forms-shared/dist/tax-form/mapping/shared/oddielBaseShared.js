"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oddielBaseShared = void 0;
const types_1 = require("../../types");
const functions_1 = require("./functions");
const safeData_1 = require("../../../form-utils/safeData");
const oddielBaseShared = (data, priznanie, isBytyANebytovePriestory = false) => ({
    obec: 'Bratislava',
    isVlastnik: priznanie.pravnyVztah === types_1.PravnyVztah.Vlastnik,
    isSpravca: priznanie.pravnyVztah === types_1.PravnyVztah.Spravca,
    // "Byty a nebytové priestory" doesn't include those two.
    isNajomca: !isBytyANebytovePriestory && priznanie.pravnyVztah === types_1.PravnyVztah.Najomca,
    isUzivatel: !isBytyANebytovePriestory && priznanie.pravnyVztah === types_1.PravnyVztah.Uzivatel,
    isPodieloveSpoluvlastnictvo: priznanie.spoluvlastnictvo === types_1.Spoluvlastnictvo.Podielove,
    isBezpodieloveSpoluvlastnictvo: priznanie.spoluvlastnictvo === types_1.Spoluvlastnictvo.Bezpodielove,
    spoluvlastnikUrcenyDohodou: priznanie.spoluvlastnictvo === types_1.Spoluvlastnictvo.Podielove
        ? (0, safeData_1.safeBoolean)(priznanie.naZakladeDohody)
        : undefined,
    pocetSpoluvlastnikov: priznanie.spoluvlastnictvo === types_1.Spoluvlastnictvo.Podielove
        ? (0, safeData_1.safeNumber)(priznanie.pocetSpoluvlastnikov)
        : undefined,
    rodneCisloManzelaManzelky: priznanie.spoluvlastnictvo === types_1.Spoluvlastnictvo.Bezpodielove
        ? (0, functions_1.parseRodneCislo)(data.bezpodieloveSpoluvlastnictvoManzelov?.rodneCislo)
        : undefined,
});
exports.oddielBaseShared = oddielBaseShared;

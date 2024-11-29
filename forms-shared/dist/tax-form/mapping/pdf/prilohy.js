"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prilohy = void 0;
const functions_1 = require("../shared/functions");
const prilohyShared_1 = require("../shared/prilohyShared");
const functions_2 = require("./functions");
const poctyKeys = [
    'pocetPozemkov',
    'pocetStaviebJedenUcel',
    'pocetStaviebViacereUcely',
    'pocetBytov',
];
/**
 * Map of the section to the index the fields for the section are prefixed with.
 */
const typeIndexMapping = {
    pocetPozemkov: 3,
    pocetStaviebJedenUcel: 4,
    pocetStaviebViacereUcely: 5,
    pocetBytov: 6,
};
/**
 * Generates fields that appear on the right top corner on each page, for each page they are incremented.
 */
function getPrilohaCisloFields(data) {
    const pocty = (0, functions_1.getPocty)(data);
    const { zobrazitOslobodenie } = (0, prilohyShared_1.prilohyShared)(data);
    const prilohaCisloFields = {};
    let count = 1;
    poctyKeys.forEach((key) => {
        const pocet = pocty[key];
        if (pocet) {
            for (let i = 0; i < pocet; i++) {
                const prefixIndex = typeIndexMapping[key];
                // Copied section pages have _Copy{index} suffix.
                const prilohyKey = i === 0 ? `${prefixIndex}_Priloha` : `${prefixIndex}_Priloha_Copy${i}`;
                prilohaCisloFields[prilohyKey] = String(count++);
            }
        }
    });
    if (zobrazitOslobodenie) {
        prilohaCisloFields['12_Priloha'] = String(count++);
    }
    return prilohaCisloFields;
}
function formatNonZeroInteger(value) {
    return value === 0 ? undefined : (0, functions_2.formatIntegerPdf)(value);
}
const prilohy = (data) => {
    const mapping = (0, prilohyShared_1.prilohyShared)(data);
    const currentDate = new Date();
    const prilohaCisloFields = getPrilohaCisloFields(data);
    return {
        '2_Priloha1': formatNonZeroInteger(mapping.oddiel2),
        '2_Priloha2': formatNonZeroInteger(mapping.oddiel3),
        '2_Priloha3': formatNonZeroInteger(mapping.oddiel4),
        '2_Priloha7': mapping.zobrazitOslobodenie ? '1' : undefined,
        '2_Datum1': currentDate.getDate().toString().padStart(2, '0'),
        '2_Datum2': (currentDate.getMonth() + 1).toString().padStart(2, '0'),
        '2_Datum4': currentDate.getFullYear().toString().slice(-2),
        ...prilohaCisloFields,
    };
};
exports.prilohy = prilohy;

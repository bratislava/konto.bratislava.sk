"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBirthDate = exports.parseRodneCislo = exports.getPocty = exports.parseDateFieldDate = void 0;
const rodnecislo_1 = require("rodnecislo");
const dates_1 = require("./dates");
const safeData_1 = require("../../../form-utils/safeData");
const parseDateFieldDate = (date) => (0, dates_1.parseDate)(date, 'YYYY-MM-DD');
exports.parseDateFieldDate = parseDateFieldDate;
const getPocet = (oddiel) => {
    if ((0, safeData_1.safeBoolean)(oddiel?.vyplnitObject?.vyplnit) === true) {
        return (0, safeData_1.safeArray)(oddiel?.priznania).length;
    }
    return 0;
};
function getPocty(data) {
    return {
        pocetPozemkov: getPocet(data?.danZPozemkov),
        pocetStaviebJedenUcel: getPocet(data?.danZoStaviebJedenUcel),
        pocetStaviebViacereUcely: getPocet(data?.danZoStaviebViacereUcely),
        pocetBytov: getPocet(data?.danZBytovANebytovychPriestorov),
    };
}
exports.getPocty = getPocty;
function parseRodneCislo(rodneCisloOrBirthDate) {
    const value = (0, safeData_1.safeString)(rodneCisloOrBirthDate);
    if (!value) {
        return {
            isValid: false,
            value: undefined,
        };
    }
    const rodneCisloParsed = (0, rodnecislo_1.rodnecislo)(value);
    if (rodneCisloParsed.isValid()) {
        const [firstPart, secondPart] = (() => {
            // `rodnecislo` accepts both the variant with slash and without
            // https://github.com/kub1x/rodnecislo?tab=readme-ov-file#regexp
            if (value.includes('/')) {
                return value.split('/');
            }
            return [value.slice(0, 6), value.slice(6)];
        })();
        return {
            isValid: true,
            firstPart,
            secondPart,
            value,
        };
    }
    return {
        isValid: false,
        value,
    };
}
exports.parseRodneCislo = parseRodneCislo;
function parseBirthDate(rodneCisloOrBirthDate) {
    if (typeof rodneCisloOrBirthDate !== 'string') {
        return;
    }
    const rodneCisloParsed = (0, rodnecislo_1.rodnecislo)(rodneCisloOrBirthDate);
    if (rodneCisloParsed.isValid()) {
        return (0, dates_1.fixDate)(rodneCisloParsed.birthDate());
    }
    const dateParsed = (0, dates_1.parseDate)(rodneCisloOrBirthDate, 'DD.MM.YYYY');
    if (dateParsed) {
        return dateParsed;
    }
}
exports.parseBirthDate = parseBirthDate;

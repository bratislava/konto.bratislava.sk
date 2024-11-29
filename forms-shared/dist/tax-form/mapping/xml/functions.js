"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.phoneNumberXml = exports.formatDecimalXml = exports.formatIntegerXml = exports.formatXsDateTimeXml = exports.formatXsDateXml = void 0;
const libphonenumber_js_1 = __importDefault(require("libphonenumber-js"));
const dates_1 = require("../shared/dates");
/**
 * Converts a Date object to a xs:date (e.g. `2021-01-01+01:00`) formatted string.
 */
const formatXsDateXml = (date) => (0, dates_1.formatDate)(date, 'YYYY-MM-DDZ');
exports.formatXsDateXml = formatXsDateXml;
/**
 * Converts a Date object to a xs:dateTime (e.g. `2021-01-01T00:00:00.000+01:00`) formatted string.
 */
const formatXsDateTimeXml = (date) => (0, dates_1.formatDate)(date, 'YYYY-MM-DDTHH:mm:ss.SSSZ');
exports.formatXsDateTimeXml = formatXsDateTimeXml;
const formatIntegerXml = (value) => value == null ? undefined : value.toFixed(0);
exports.formatIntegerXml = formatIntegerXml;
const formatDecimalXml = (value) => value == null ? undefined : value.toFixed(2);
exports.formatDecimalXml = formatDecimalXml;
const medzinarodneVolacieCisloRegex = /(((\+[1-9])|(\+[1-9]\d{1,8}))|((00[1-9])|(00[1-9]\d{1,7})))/; // TelefonneCisloType.MedzinarodneVolacieCislo in XSD
const predvolbaRegex = /[1-9]\d*/; // TelefonneCisloType.Predvolba in XSD
const cisloRegex = /\d*/; // TelefonneCisloType.Cislo in XSD
/**
 * In the form, the user provides the phone number in E.164 format, however the XML expects the phone number to be split
 * into 3 parts. This function tries to parse the phone number and split it into expected parts to satisfy the strict
 * XML requirements.
 *
 * Working with phone numbers is extremely hard - https://github.com/google/libphonenumber/blob/master/FALSEHOODS.md
 * That's the reason, this function is written in the most defensive way possible.
 */
const phoneNumberXml = (value) => {
    if (typeof value !== 'string') {
        return;
    }
    const parsed = (0, libphonenumber_js_1.default)(value);
    if (!parsed ||
        !parsed.isValid() ||
        /* The input phone number can be parsed to valid number, but we expect only E.164 inputs, therefore if we format
         * the parsed number back to E.164 it must be the same. */
        parsed.format('E.164') !== value) {
        return;
    }
    const international = parsed.formatInternational();
    // E.g. +421259356500 resolves to +421 2/593 565 00, so it's the safest to replace all slashes with spaces
    const internationalWithoutSlashes = international.replaceAll('/', ' ');
    // "Predvolba" is not a valid concept in phone number parsing, so we use the second part of the phone number
    const [medzinarodneVolacieCislo, predvolba, ...rest] = internationalWithoutSlashes.split(' ');
    // TS doesn't catch this, but `rest` can be undefined which would result to an exception
    const cislo = rest?.join('') ?? '';
    const newPhoneNumber = (0, libphonenumber_js_1.default)(`${medzinarodneVolacieCislo}${predvolba}${cislo}`);
    if (!newPhoneNumber ||
        /* If the new constructed phone number doesn't equal to the original one, we screwed up. */
        !parsed.isEqual(newPhoneNumber) ||
        !medzinarodneVolacieCisloRegex.test(medzinarodneVolacieCislo) ||
        !predvolbaRegex.test(predvolba) ||
        !cisloRegex.test(cislo)) {
        return;
    }
    return {
        MedzinarodneVolacieCislo: medzinarodneVolacieCislo,
        Predvolba: predvolba,
        Cislo: cislo,
    };
};
exports.phoneNumberXml = phoneNumberXml;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tituly = exports.adresaStavbyBytu = exports.katastralneUzemie = exports.spoluvlastnictvo = exports.pravnyVztah = exports.getCiselnikEntryByCode = exports.getCiselnikEntryByCondition = void 0;
const esbsCiselniky_1 = require("../shared/esbsCiselniky");
const functions_1 = require("./functions");
const shared_1 = require("./shared");
function getCiselnikEntryByCondition(ciselnik, record) {
    const firstTruthyKey = Object.keys(record).find((key) => record[key]);
    if (!firstTruthyKey) {
        return null;
    }
    return ciselnik.find((entry) => entry.Code === firstTruthyKey);
}
exports.getCiselnikEntryByCondition = getCiselnikEntryByCondition;
function getCiselnikEntryByCode(ciselnik, code) {
    return ciselnik.find((entry) => entry.Code === code);
}
exports.getCiselnikEntryByCode = getCiselnikEntryByCode;
const pravnyVztah = (priznanie) => getCiselnikEntryByCondition(esbsCiselniky_1.esbsPravnyVztahCiselnik, {
    '0': priznanie.isVlastnik,
    '1': priznanie.isSpravca,
    '2': priznanie.isNajomca,
    '3': priznanie.isUzivatel,
});
exports.pravnyVztah = pravnyVztah;
const spoluvlastnictvo = (priznanie) => getCiselnikEntryByCondition(esbsCiselniky_1.esbsSpoluvlastnictvoCiselnik, {
    '0': priznanie.isPodieloveSpoluvlastnictvo,
    '1': priznanie.isBezpodieloveSpoluvlastnictvo,
});
exports.spoluvlastnictvo = spoluvlastnictvo;
const katastralneUzemie = (katastralneUzemieString) => {
    if (!katastralneUzemieString) {
        return null;
    }
    return esbsCiselniky_1.esbsKatastralneUzemiaCiselnik.find(({ Name }) => Name === katastralneUzemieString);
};
exports.katastralneUzemie = katastralneUzemie;
const obecFromKatastralneUzemie = (katastralneUzemieString) => {
    if (!katastralneUzemieString) {
        return null;
    }
    if (katastralneUzemieString === 'Nivy' || katastralneUzemieString === 'Trnávka') {
        return getCiselnikEntryByCode(esbsCiselniky_1.esbsBratislavaMestskaCastCiselnik, 'SK0102529320'); // Ružinov
    }
    if (katastralneUzemieString === 'Vinohrady') {
        return getCiselnikEntryByCode(esbsCiselniky_1.esbsBratislavaMestskaCastCiselnik, 'SK0103529346'); // Nové Mesto
    }
    return esbsCiselniky_1.esbsBratislavaMestskaCastCiselnik.find(({ Name }) => Name === `Bratislava - mestská časť ${katastralneUzemieString}`);
};
const adresaStavbyBytu = (priznanie) => {
    const parsed = (0, shared_1.parseUlicaACisloDomu)(priznanie.ulicaACisloDomu);
    return {
        UlicaACislo: {
            /* It's a sequence and must be in this specific order. */
            Ulica: parsed?.Ulica,
            SupisneCislo: (0, functions_1.formatIntegerXml)(priznanie.supisneCislo),
            OrientacneCislo: parsed?.OrientacneCislo,
        },
        Obec: obecFromKatastralneUzemie(priznanie.katastralneUzemie),
        Stat: getCiselnikEntryByCode(esbsCiselniky_1.esbsNationalityCiselnik, '703'), // Slovenská republika
    };
};
exports.adresaStavbyBytu = adresaStavbyBytu;
/**
 * Removes spaces and dots and lowercases the string to try to match as many possible forms of "titul".
 */
function fixValue(value) {
    return value.replaceAll(/[ .]/g, '').toLocaleLowerCase('sk-SK');
}
const tituly = (value) => {
    if (typeof value !== 'string') {
        return null;
    }
    const predMenom = esbsCiselniky_1.esbsTitulPredMenomCiselnik.find(({ Name }) => fixValue(Name) === fixValue(value));
    const zaMenom = esbsCiselniky_1.esbsTitulZaMenomCiselnik.find(({ Name }) => fixValue(Name) === fixValue(value));
    if (predMenom || zaMenom) {
        return {
            predMenom,
            zaMenom,
        };
    }
    return {
        predMenom: {
            Name: value,
        },
    };
};
exports.tituly = tituly;

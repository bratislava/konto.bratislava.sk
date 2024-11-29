"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oddiel2Xml = void 0;
const esbsCiselniky_1 = require("../shared/esbsCiselniky");
const oddiel2Shared_1 = require("../shared/oddiel2Shared");
const ciselniky_1 = require("./ciselniky");
const functions_1 = require("./functions");
const shared_1 = require("./shared");
const mapPriznanie = (data, priznanie, index) => ({
    PoradoveCislo: index + 1,
    ...(0, shared_1.sharedPriznanieXml)(data),
    Obec: priznanie.obec,
    // For some reason, the XML contains list of all "esbsDruhPozemkuDaneCiselnik" in each entry.
    DruhyZmien: {
        DruhZmeny: esbsCiselniky_1.esbsDruhPozemkuDaneCiselnik,
    },
    HodnotaPozemkuUrcenaZnalcom: priznanie.hodnotaUrcenaZnaleckymPosudkom,
    PravnyVztah: (0, ciselniky_1.pravnyVztah)(priznanie),
    Spoluvlastnictvo: (0, ciselniky_1.spoluvlastnictvo)(priznanie),
    RodneCisloManzelaAleboManzelky: (0, shared_1.formatRodneCisloXml)(priznanie.rodneCisloManzelaManzelky),
    PocetSpoluvlastnikov: (0, functions_1.formatIntegerXml)(priznanie.pocetSpoluvlastnikov),
    SpoluvlastnikUrcenyDohodou: priznanie.spoluvlastnikUrcenyDohodou,
    Pozemky: {
        Pozemok: priznanie.pozemky.map((pozemok, pozemokIndex) => ({
            PoradoveCislo: pozemokIndex + 1,
            NazovKatastralnehoUzemia: (0, ciselniky_1.katastralneUzemie)(pozemok.katastralneUzemie),
            CisloParcely: pozemok.cisloParcely,
            Vymera: (0, functions_1.formatDecimalXml)(pozemok.vymeraPozemku),
            DruhPozemku: (0, ciselniky_1.getCiselnikEntryByCode)(esbsCiselniky_1.esbsDruhPozemkuDaneCiselnik, pozemok.druhPozemku),
            DatumVznikuDanovejPovinnosti: (0, functions_1.formatXsDateXml)(pozemok.datumVznikuDanovejPovinnosti),
            DatumZanikuDanovejPovinnosti: (0, functions_1.formatXsDateXml)(pozemok.datumZanikuDanovejPovinnosti),
        })),
    },
});
const oddiel2Xml = (data) => {
    const mapping = (0, oddiel2Shared_1.oddiel2Shared)(data);
    if (mapping.length === 0) {
        return null;
    }
    return {
        DanZPozemkov: {
            DanZPozemkovZaznam: mapping.map((priznanie, index) => mapPriznanie(data, priznanie, index)),
        },
    };
};
exports.oddiel2Xml = oddiel2Xml;

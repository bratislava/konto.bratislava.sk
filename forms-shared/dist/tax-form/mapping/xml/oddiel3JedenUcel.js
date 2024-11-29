"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oddiel3JedenUcelXml = void 0;
const esbsCiselniky_1 = require("../shared/esbsCiselniky");
const oddiel3JedenUcelShared_1 = require("../shared/oddiel3JedenUcelShared");
const ciselniky_1 = require("./ciselniky");
const functions_1 = require("./functions");
const shared_1 = require("./shared");
const mapPriznanie = (data, priznanie, index) => ({
    PoradoveCislo: index + 1,
    ...(0, shared_1.sharedPriznanieXml)(data),
    AdresaStavby: (0, ciselniky_1.adresaStavbyBytu)(priznanie),
    NazovKatastralnehoUzemia: (0, ciselniky_1.katastralneUzemie)(priznanie.katastralneUzemie),
    CisloParcely: priznanie.cisloParcely,
    PravnyVztah: (0, ciselniky_1.pravnyVztah)(priznanie),
    Spoluvlastnictvo: (0, ciselniky_1.spoluvlastnictvo)(priznanie),
    RodneCisloManzelaAleboManzelky: (0, shared_1.formatRodneCisloXml)(priznanie.rodneCisloManzelaManzelky),
    PocetSpoluvlastnikov: (0, functions_1.formatIntegerXml)(priznanie.pocetSpoluvlastnikov),
    SpoluvlastnikUrcenyDohodou: priznanie.spoluvlastnikUrcenyDohodou,
    DatumVznikuDanovejPovinnosti: (0, functions_1.formatXsDateXml)(priznanie.datumVznikuDanovejPovinnosti),
    DatumZanikuDanovejPovinnosti: (0, functions_1.formatXsDateXml)(priznanie.datumZanikuDanovejPovinnosti),
    PredmetDane: (0, ciselniky_1.getCiselnikEntryByCondition)(esbsCiselniky_1.esbsPredmetDaneCiselnik, {
        '0': priznanie.predmetDane === 'a',
        '1': priznanie.predmetDane === 'b',
        '2': priznanie.predmetDane === 'c',
        '3': priznanie.predmetDane === 'd',
        '4': priznanie.predmetDane === 'e',
        '5': priznanie.predmetDane === 'f',
        '6': priznanie.predmetDane === 'g',
        '7': priznanie.predmetDane === 'h',
        '8': priznanie.predmetDane === 'i',
    }),
    ZakladDane: (0, functions_1.formatIntegerXml)(priznanie.zakladDane),
    PocetPodlazi: (0, functions_1.formatIntegerXml)(priznanie.pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia),
    CelkovaVymeraPodlahovychPloch: (0, functions_1.formatIntegerXml)(priznanie.celkovaVymeraPodlahovychPlochVsetkychPodlaziStavby),
    Poznamka: priznanie.poznamka,
});
const oddiel3JedenUcelXml = (data) => {
    const mapping = (0, oddiel3JedenUcelShared_1.oddiel3JedenUcelShared)(data);
    if (mapping.length === 0) {
        return null;
    }
    return {
        DanZoStaviebJedenUcel: {
            DanZoStaviebJedenUcelZaznam: mapping.map((priznanie, index) => mapPriznanie(data, priznanie, index)),
        },
    };
};
exports.oddiel3JedenUcelXml = oddiel3JedenUcelXml;

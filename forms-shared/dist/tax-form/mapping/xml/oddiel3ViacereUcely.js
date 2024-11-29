"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oddiel3ViacereUcelyXml = void 0;
const esbsCiselniky_1 = require("../shared/esbsCiselniky");
const oddiel3ViacereUcelyShared_1 = require("../shared/oddiel3ViacereUcelyShared");
const ciselniky_1 = require("./ciselniky");
const functions_1 = require("./functions");
const shared_1 = require("./shared");
const mapPriznanie = (data, priznanie, index) => {
    const codeTypeMapping = {
        '0': 'a',
        '1': 'b',
        '2': 'c',
        '3': 'd',
        '4': 'e',
        '5': 'f',
        '6': 'g',
        '7': 'h',
        '8': 'i',
    };
    return {
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
        PopisStavby: priznanie.popisStavby,
        DatumVznikuDanovejPovinnosti: (0, functions_1.formatXsDateXml)(priznanie.datumVznikuDanovejPovinnosti),
        DatumZanikuDanovejPovinnosti: (0, functions_1.formatXsDateXml)(priznanie.datumZanikuDanovejPovinnosti),
        ZakladDane: (0, functions_1.formatIntegerXml)(priznanie.zakladDane),
        CelkovaVymeraPodlahovychPloch: (0, functions_1.formatIntegerXml)(priznanie.celkovaVymera),
        VymeraPlochOslobodenychOdDane: (0, functions_1.formatIntegerXml)(priznanie.vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb),
        VymeraPlochNaJednotliveUcely: {
            VymeraPlochNaJednotlivyUcel: esbsCiselniky_1.esbsPredmetDaneCiselnik.map((ucel) => ({
                Ucel: ucel,
                Vymera: (0, functions_1.formatDecimalXml)(priznanie.vymeryStaviebPodlaTypu[codeTypeMapping[ucel.Code]]),
            })),
        },
        PocetPodlazi: (0, functions_1.formatIntegerXml)(priznanie.pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia),
        Poznamka: priznanie.poznamka,
    };
};
const oddiel3ViacereUcelyXml = (data) => {
    const mapping = (0, oddiel3ViacereUcelyShared_1.oddiel3ViacereUcelyShared)(data);
    if (mapping.length === 0) {
        return null;
    }
    return {
        DanZoStaviebViacereUcely: {
            DanZoStaviebViacereUcelyZaznam: mapping.map((priznanie, index) => mapPriznanie(data, priznanie, index)),
        },
    };
};
exports.oddiel3ViacereUcelyXml = oddiel3ViacereUcelyXml;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oddiel4Xml = void 0;
const oddiel4Shared_1 = require("../shared/oddiel4Shared");
const ciselniky_1 = require("./ciselniky");
const functions_1 = require("./functions");
const shared_1 = require("./shared");
const mapPriznanie = (data, priznanie, index) => ({
    PoradoveCislo: index + 1,
    ...(0, shared_1.sharedPriznanieXml)(data),
    AdresaBytu: (0, ciselniky_1.adresaStavbyBytu)(priznanie),
    NazovKatastralnehoUzemia: (0, ciselniky_1.katastralneUzemie)(priznanie.katastralneUzemie),
    CisloParcely: priznanie.cisloParcely,
    // "Číslo bytu" might be legitimately empty, but the XSD validation expects it to be present
    CisloBytu: priznanie.byt?.cisloBytu ?? '',
    PravnyVztah: (0, ciselniky_1.pravnyVztah)(priznanie),
    Spoluvlastnictvo: (0, ciselniky_1.spoluvlastnictvo)(priznanie),
    RodneCisloManzelaAleboManzelky: (0, shared_1.formatRodneCisloXml)(priznanie.rodneCisloManzelaManzelky),
    PocetSpoluvlastnikov: (0, functions_1.formatIntegerXml)(priznanie.pocetSpoluvlastnikov),
    SpoluvlastnikUrcenyDohodou: priznanie.spoluvlastnikUrcenyDohodou,
    PopisBytu: priznanie.byt?.popisBytu,
    DatumVznikuDanovejPovinnosti: (0, functions_1.formatXsDateXml)(priznanie.byt?.datumVznikuDanovejPovinnosti),
    DatumZanikuDanovejPovinnosti: (0, functions_1.formatXsDateXml)(priznanie.byt?.datumZanikuDanovejPovinnosti),
    NebytovePriestory: {
        NebytovyPriestor: priznanie.nebytovePriestory.map((nebytovyPriestor, nebytovyPriestorIndex) => ({
            PoradoveCislo: nebytovyPriestorIndex + 1,
            CisloVBytovomDome: nebytovyPriestor.cisloNebytovehoPriestoruVBytovomDome,
            UcelVyuzitiaVBytovomDome: nebytovyPriestor.ucelVyuzitiaNebytovehoPriestoruVBytovomDome,
            VymeraPodlahovychPloch: (0, functions_1.formatIntegerXml)(nebytovyPriestor.vymeraPodlahovychPlochNebytovehoPriestoruVBytovomDome),
            DatumVznikuDanovejPovinnosti: (0, functions_1.formatXsDateXml)(nebytovyPriestor.datumVznikuDanovejPovinnosti),
            DatumZanikuDanovejPovinnosti: (0, functions_1.formatXsDateXml)(nebytovyPriestor.datumZanikuDanovejPovinnosti),
        })),
    },
    ZakladDane: {
        // "Základ dane bytu" might be legitimately empty, but the XSD validation expects it to be present
        Byt: (0, functions_1.formatIntegerXml)(priznanie.byt?.zakladDane ?? 0),
    },
    VymeraPodlahovejPlochyVyuzivanejNaIneUcely: (0, functions_1.formatIntegerXml)(priznanie.byt?.vymeraPodlahovejPlochyNaIneUcely),
    // We don't provide VymeraPlochOslobodenychOdDane
    Poznamka: priznanie.poznamka,
});
const oddiel4Xml = (data) => {
    const mapping = (0, oddiel4Shared_1.oddiel4Shared)(data);
    if (mapping.length === 0) {
        return null;
    }
    return {
        DanZBytovANebytovychPriestorov: {
            DanZBytovANebytovychPriestorovZaznam: mapping.map((priznanie, index) => mapPriznanie(data, priznanie, index)),
        },
    };
};
exports.oddiel4Xml = oddiel4Xml;

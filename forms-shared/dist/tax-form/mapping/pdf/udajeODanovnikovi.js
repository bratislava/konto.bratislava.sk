"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.udajeODanovnikovi = void 0;
const udajeODanovnikoviShared_1 = require("../shared/udajeODanovnikoviShared");
const functions_1 = require("./functions");
const statCiselnik_1 = require("./statCiselnik");
function getRok(rok) {
    const rokString = rok?.toString();
    // Is number between 2000 and 2099
    if (rokString && /^(20\d{2})$/g.test(rokString)) {
        return rokString?.slice(-2);
    }
}
const udajeODanovnikovi = (data) => {
    const mapping = (0, udajeODanovnikoviShared_1.udajeODanovnikoviShared)(data);
    return {
        chbPriznanie1: mapping.isPriznanie,
        chbPriznanie2: mapping.isCiastkovePriznanie,
        chbPriznanie3: mapping.isCiastkovePriznanieNaZanikDanovejPovinnosti,
        chbPriznanie4: mapping.isOpravnePriznanie,
        chbPriznanie5: mapping.isDodatocnePriznanie,
        Rok2: getRok(mapping.rok),
        chbFO: mapping.isFyzickaOsoba || mapping.isFyzickaOsobaPodnikatel,
        chbPO: mapping.isPravnickaOsoba,
        PSC: mapping.psc,
        Obec: mapping.obec,
        Stat: (0, statCiselnik_1.getTitleFromStatCiselnik)(mapping.stat),
        TelefonneCislo: mapping.telefonneCislo,
        Email: mapping.email,
        Priezvisko: mapping.priezvisko,
        Meno: mapping.meno,
        Titul: mapping.titul,
        Ulica: mapping.ulica,
        Cislo: mapping.cislo,
        RodneCislo1: (0, functions_1.formatRodneCisloFirstPartPdf)(mapping.rodneCislo),
        RodneCislo2: (0, functions_1.formatRodneCisloSecondPartPdf)(mapping.rodneCislo),
        Ico: mapping.ico,
        ObchodnyNazov: mapping.obchodneMenoAleboNazov,
        PravnaForma: mapping.pravnaForma,
        PSC1: mapping.splnomocnenecPsc,
        Obec1: mapping.splnomocnenecObec,
        Stat1: (0, statCiselnik_1.getTitleFromStatCiselnik)(mapping.splnomocnenecStat),
        TelefonneCislo1: mapping.splnomocnenecTelefonneCislo,
        Email1: mapping.splnomocnenecEmail,
        Priezvisko1: mapping.splnomocnenecPriezvisko,
        Meno1: mapping.splnomocnenecMeno,
        Titul1: mapping.splnomocnenecTitul,
        Ulica1: mapping.splnomocnenecUlica,
        Cislo1: mapping.splnomocnenecCislo,
        chbVztah1: mapping.splnomocnenecStatutarnyZastupca,
        chbVztah2: mapping.splnomocnenecZastupca,
        chbVztah3: mapping.splnomocnenecSpravca,
    };
};
exports.udajeODanovnikovi = udajeODanovnikovi;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.udajeODanovnikoviXml = void 0;
const esbsCiselniky_1 = require("../shared/esbsCiselniky");
const udajeODanovnikoviShared_1 = require("../shared/udajeODanovnikoviShared");
const ciselniky_1 = require("./ciselniky");
const functions_1 = require("./functions");
const shared_1 = require("./shared");
const udajeODanovnikoviXml = (data) => {
    const mapping = (0, udajeODanovnikoviShared_1.udajeODanovnikoviShared)(data);
    const titul = (0, ciselniky_1.tituly)(mapping.titul);
    const splnomocnenecTitul = (0, ciselniky_1.tituly)(mapping.splnomocnenecTitul);
    return {
        DruhPriznania: (0, ciselniky_1.getCiselnikEntryByCondition)(esbsCiselniky_1.esbsDruhPriznaniaCiselnik, {
            '0': mapping.isPriznanie,
            '1': mapping.isCiastkovePriznanie,
            '2': mapping.isCiastkovePriznanieNaZanikDanovejPovinnosti,
            '3': mapping.isOpravnePriznanie,
            '4': mapping.isDodatocnePriznanie,
        }),
        NaRok: (0, functions_1.formatIntegerXml)(mapping.rok),
        Danovnik: {
            TypOsoby: (0, ciselniky_1.getCiselnikEntryByCondition)(esbsCiselniky_1.esbsTypOsobyCiselnik, {
                FO: mapping.isFyzickaOsoba,
                PO: mapping.isPravnickaOsoba,
                FOP: mapping.isFyzickaOsobaPodnikatel,
            }),
            IdentifikaciaOsoby: {
                TitulyPredMenom: titul?.predMenom ? { TitulPredMenom: titul.predMenom } : undefined,
                Meno: mapping.meno,
                Priezvisko: mapping.priezvisko,
                // RodnePriezvisko
                // MestskaCast
                TitulyZaMenom: titul?.zaMenom ? { TitulZaMenom: titul.zaMenom } : undefined,
                DatumNarodenia: (0, functions_1.formatXsDateXml)(mapping.datumNarodenia),
                RodneCislo: (0, shared_1.formatRodneCisloXml)(mapping.rodneCislo),
                // CisloObcianskehoPreukazu
                ObchodneMenoNazov: mapping.obchodneMenoAleboNazov,
                // MenoZastupcu
                // PriezviskoZastupcu
                ICO: mapping.ico,
                PravnaForma: (0, ciselniky_1.getCiselnikEntryByCode)(esbsCiselniky_1.esbsPravnaFormaCiselnik, mapping.pravnaForma),
            },
        },
        AdresaDanovnika: {
            Meno: mapping.meno,
            Priezvisko: mapping.priezvisko,
            ObchodneMenoNazov: mapping.obchodneMenoAleboNazov,
            UlicaACislo: {
                Ulica: mapping.ulica,
                OrientacneCislo: mapping.cislo,
            },
            PSC: mapping.psc,
            Obec: { Name: mapping.obec },
            Stat: (0, ciselniky_1.getCiselnikEntryByCode)(esbsCiselniky_1.esbsNationalityCiselnik, mapping.stat),
        },
        OpravnenaOsoba: {
            PravnyVztah: (0, ciselniky_1.getCiselnikEntryByCondition)(esbsCiselniky_1.esbsPravnyVztahPOCiselnik, {
                '0': mapping.splnomocnenecStatutarnyZastupca,
                '1': mapping.splnomocnenecZastupca,
                '2': mapping.splnomocnenecSpravca,
            }),
            Meno: mapping.splnomocnenecMeno,
            Priezvisko: mapping.splnomocnenecPriezvisko,
            TitulyPredMenom: splnomocnenecTitul?.predMenom
                ? { TitulPredMenom: splnomocnenecTitul.predMenom }
                : undefined,
            TitulyZaMenom: splnomocnenecTitul?.zaMenom
                ? { TitulZaMenom: splnomocnenecTitul.zaMenom }
                : undefined,
            ObchodneMenoNazov: mapping.splnomocnenecObchodneMenoAleboNazov,
            AdresaOpravnenejOsoby: {
                UlicaACislo: {
                    Ulica: mapping.splnomocnenecUlica,
                    // SupisneCislo: // TODO if needed
                    OrientacneCislo: mapping.splnomocnenecCislo,
                },
                PSC: mapping.splnomocnenecPsc,
                Obec: { Name: mapping.splnomocnenecObec },
                Stat: (0, ciselniky_1.getCiselnikEntryByCode)(esbsCiselniky_1.esbsNationalityCiselnik, mapping.splnomocnenecStat),
            },
            KontaktneUdajeOpravnenejOsoby: {
                TelefonneCislo: (0, functions_1.phoneNumberXml)(mapping.splnomocnenecTelefonneCislo),
                Email: mapping.splnomocnenecEmail,
            },
        },
        KontaktneUdajeDanovnika: {
            TelefonneCislo: (0, functions_1.phoneNumberXml)(mapping.telefonneCislo),
            Email: mapping.email,
        },
    };
};
exports.udajeODanovnikoviXml = udajeODanovnikoviXml;

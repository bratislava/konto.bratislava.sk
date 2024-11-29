"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.udajeODanovnikoviShared = void 0;
const types_1 = require("../../types");
const functions_1 = require("./functions");
const safeData_1 = require("../../../form-utils/safeData");
const udajeODanovnikoviShared = (data) => {
    const { udajeODanovnikovi: oddiel, druhPriznania } = data;
    const priznanieAkoFyzickaOsoba = oddiel?.priznanieAko === types_1.PriznanieAko.FyzickaOsoba;
    const priznanieAkoFyzickaOsobaPodnikatel = oddiel?.priznanieAko === types_1.PriznanieAko.FyzickaOsobaPodnikatel;
    const priznanieAkoPravnickaOsoba = oddiel?.priznanieAko === types_1.PriznanieAko.PravnickaOsoba;
    const podanie = priznanieAkoFyzickaOsoba || priznanieAkoFyzickaOsobaPodnikatel || priznanieAkoPravnickaOsoba;
    const priznanieFields = podanie
        ? {
            psc: (0, safeData_1.safeString)(oddiel?.obecPsc?.psc),
            obec: (0, safeData_1.safeString)(oddiel?.obecPsc?.obec),
            stat: (0, safeData_1.safeString)(oddiel?.stat),
            telefonneCislo: (0, safeData_1.safeString)(oddiel?.telefon),
            email: (0, safeData_1.safeString)(oddiel?.email),
        }
        : {};
    const fyzickaOsobaFields = priznanieAkoFyzickaOsoba
        ? {
            priezvisko: (0, safeData_1.safeString)(oddiel?.priezvisko),
            meno: (0, safeData_1.safeString)(oddiel?.menoTitul?.meno),
            titul: (0, safeData_1.safeString)(oddiel?.menoTitul?.titul),
            ulica: (0, safeData_1.safeString)(oddiel?.ulicaCisloFyzickaOsoba?.ulica),
            cislo: (0, safeData_1.safeString)(oddiel?.ulicaCisloFyzickaOsoba?.cislo),
            rodneCislo: (0, functions_1.parseRodneCislo)(oddiel?.rodneCislo),
            datumNarodenia: (0, functions_1.parseBirthDate)(oddiel?.rodneCislo),
        }
        : {};
    const fyzickaOsobaPodnikatelFields = priznanieAkoFyzickaOsobaPodnikatel
        ? {
            ico: (0, safeData_1.safeString)(oddiel?.ico),
            obchodneMenoAleboNazov: (0, safeData_1.safeString)(oddiel?.obchodneMenoAleboNazov),
            ulica: (0, safeData_1.safeString)(oddiel?.ulicaCisloFyzickaOsobaPodnikatel?.ulica),
            cislo: (0, safeData_1.safeString)(oddiel?.ulicaCisloFyzickaOsobaPodnikatel?.cislo),
        }
        : {};
    const pravnickaOsobaFields = priznanieAkoPravnickaOsoba
        ? {
            ico: (0, safeData_1.safeString)(oddiel?.ico),
            pravnaForma: (0, safeData_1.safeString)(oddiel?.pravnaForma),
            obchodneMenoAleboNazov: (0, safeData_1.safeString)(oddiel?.obchodneMenoAleboNazov),
            ulica: (0, safeData_1.safeString)(oddiel?.ulicaCisloPravnickaOsoba?.ulica),
            cislo: (0, safeData_1.safeString)(oddiel?.ulicaCisloPravnickaOsoba?.cislo),
        }
        : {};
    const voSvojomMene = (0, safeData_1.safeBoolean)(oddiel?.voSvojomMene) === true;
    const splnomocnenecFyzickaOsoba = !voSvojomMene && oddiel?.opravnenaOsoba?.splnomocnenecTyp === types_1.SplonomocnenecTyp.FyzickaOsoba;
    const splnomocnenecPravnickaOsoba = !voSvojomMene && oddiel?.opravnenaOsoba?.splnomocnenecTyp === types_1.SplonomocnenecTyp.PravnickaOsoba;
    const splnomocnenec = splnomocnenecFyzickaOsoba || splnomocnenecPravnickaOsoba;
    const udajeOOpravnenejOsobeNaPodaniePriznania = voSvojomMene && priznanieAkoPravnickaOsoba;
    const pravnickaOsobaNieVoSvojomMene = !voSvojomMene && priznanieAkoPravnickaOsoba;
    const splnomocnenecFields = splnomocnenec
        ? {
            splnomocnenecPsc: (0, safeData_1.safeString)(oddiel?.opravnenaOsoba?.obecPsc?.psc),
            splnomocnenecObec: (0, safeData_1.safeString)(oddiel?.opravnenaOsoba?.obecPsc?.obec),
            splnomocnenecStat: (0, safeData_1.safeString)(oddiel?.opravnenaOsoba?.stat),
            splnomocnenecTelefonneCislo: (0, safeData_1.safeString)(oddiel?.opravnenaOsoba?.telefon),
            splnomocnenecEmail: (0, safeData_1.safeString)(oddiel?.opravnenaOsoba?.email),
        }
        : {};
    const splnomocnenecFyzickaOsobaFields = splnomocnenecFyzickaOsoba
        ? {
            splnomocnenecPriezvisko: (0, safeData_1.safeString)(oddiel?.opravnenaOsoba?.priezvisko),
            splnomocnenecMeno: (0, safeData_1.safeString)(oddiel?.opravnenaOsoba?.menoTitul?.meno),
            splnomocnenecTitul: (0, safeData_1.safeString)(oddiel?.opravnenaOsoba?.menoTitul?.titul),
            splnomocnenecUlica: (0, safeData_1.safeString)(oddiel?.opravnenaOsoba?.ulicaCisloFyzickaOsoba?.ulica),
            splnomocnenecCislo: (0, safeData_1.safeString)(oddiel?.opravnenaOsoba?.ulicaCisloFyzickaOsoba?.cislo),
        }
        : {};
    const splnomocnenecPravnickaOsobaFields = splnomocnenecFyzickaOsoba
        ? {
            splnomocnenecObchodneMenoAleboNazov: (0, safeData_1.safeString)(oddiel?.opravnenaOsoba?.obchodneMenoAleboNazov),
            splnomocnenecUlica: (0, safeData_1.safeString)(oddiel?.opravnenaOsoba?.ulicaCisloPravnickaOsoba?.ulica),
            splnomocnenecCislo: (0, safeData_1.safeString)(oddiel?.opravnenaOsoba?.ulicaCisloPravnickaOsoba?.cislo),
        }
        : {};
    const pravnickaOsobaNieVoSvojomMeneFields = pravnickaOsobaNieVoSvojomMene
        ? {
            splnomocnenecStatutarnyZastupca: oddiel?.pravnyVztahKPO === types_1.PravnyVztahKPO.StatutarnyZastupca,
            splnomocnenecZastupca: oddiel?.pravnyVztahKPO === types_1.PravnyVztahKPO.Zastupca,
            splnomocnenecSpravca: oddiel?.pravnyVztahKPO === types_1.PravnyVztahKPO.Spravca,
        }
        : {};
    const udajeOOpravnenejOsobeNaPodaniePriznaniaFields = udajeOOpravnenejOsobeNaPodaniePriznania
        ? {
            splnomocnenecPriezvisko: (0, safeData_1.safeString)(oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.priezvisko),
            splnomocnenecMeno: (0, safeData_1.safeString)(oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.menoTitul?.meno),
            splnomocnenecTitul: (0, safeData_1.safeString)(oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.menoTitul?.titul),
            splnomocnenecUlica: (0, safeData_1.safeString)(oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.ulicaCisloFyzickaOsoba?.ulica),
            splnomocnenecCislo: (0, safeData_1.safeString)(oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.ulicaCisloFyzickaOsoba?.cislo),
            splnomocnenecPsc: (0, safeData_1.safeString)(oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.obecPsc?.psc),
            splnomocnenecObec: (0, safeData_1.safeString)(oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.obecPsc?.obec),
            splnomocnenecStat: (0, safeData_1.safeString)(oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.stat),
            splnomocnenecTelefonneCislo: (0, safeData_1.safeString)(oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.telefon),
            splnomocnenecEmail: (0, safeData_1.safeString)(oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.email),
            splnomocnenecStatutarnyZastupca: oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.pravnyVztahKPO ===
                types_1.PravnyVztahKPO.StatutarnyZastupca,
            splnomocnenecZastupca: oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.pravnyVztahKPO ===
                types_1.PravnyVztahKPO.Zastupca,
            splnomocnenecSpravca: oddiel?.udajeOOpravnenejOsobeNaPodaniePriznania?.pravnyVztahKPO ===
                types_1.PravnyVztahKPO.Spravca,
        }
        : {};
    return {
        isPriznanie: druhPriznania?.druh === types_1.DruhPriznaniaEnum.Priznanie,
        isCiastkovePriznanie: druhPriznania?.druh === types_1.DruhPriznaniaEnum.CiastkovePriznanie,
        isCiastkovePriznanieNaZanikDanovejPovinnosti: druhPriznania?.druh === types_1.DruhPriznaniaEnum.CiastkovePriznanieNaZanikDanovejPovinnosti,
        isOpravnePriznanie: druhPriznania?.druh === types_1.DruhPriznaniaEnum.OpravnePriznanie,
        isDodatocnePriznanie: druhPriznania?.druh === types_1.DruhPriznaniaEnum.DodatocnePriznanie,
        rok: (0, safeData_1.safeNumber)(druhPriznania?.rok),
        isFyzickaOsoba: priznanieAkoFyzickaOsoba,
        isFyzickaOsobaPodnikatel: priznanieAkoFyzickaOsobaPodnikatel,
        isPravnickaOsoba: priznanieAkoPravnickaOsoba,
        ...priznanieFields,
        ...fyzickaOsobaFields,
        ...fyzickaOsobaPodnikatelFields,
        ...pravnickaOsobaFields,
        ...splnomocnenecFyzickaOsobaFields,
        ...splnomocnenecPravnickaOsobaFields,
        ...splnomocnenecFields,
        ...pravnickaOsobaNieVoSvojomMeneFields,
        ...udajeOOpravnenejOsobeNaPodaniePriznaniaFields,
    };
};
exports.udajeODanovnikoviShared = udajeODanovnikoviShared;

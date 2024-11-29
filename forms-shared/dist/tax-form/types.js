"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spoluvlastnictvo = exports.PravnyVztah = exports.DruhPriznaniaEnum = exports.PravnyVztahKPO = exports.PriznanieAko = exports.SplonomocnenecTyp = void 0;
var SplonomocnenecTyp;
(function (SplonomocnenecTyp) {
    SplonomocnenecTyp["FyzickaOsoba"] = "fyzickaOsoba";
    SplonomocnenecTyp["PravnickaOsoba"] = "pravnickaOsoba";
})(SplonomocnenecTyp || (exports.SplonomocnenecTyp = SplonomocnenecTyp = {}));
var PriznanieAko;
(function (PriznanieAko) {
    PriznanieAko["FyzickaOsoba"] = "fyzickaOsoba";
    PriznanieAko["FyzickaOsobaPodnikatel"] = "fyzickaOsobaPodnikatel";
    PriznanieAko["PravnickaOsoba"] = "pravnickaOsoba";
})(PriznanieAko || (exports.PriznanieAko = PriznanieAko = {}));
var PravnyVztahKPO;
(function (PravnyVztahKPO) {
    PravnyVztahKPO["StatutarnyZastupca"] = "statutarnyZastupca";
    PravnyVztahKPO["Zastupca"] = "zastupca";
    PravnyVztahKPO["Spravca"] = "spravca";
})(PravnyVztahKPO || (exports.PravnyVztahKPO = PravnyVztahKPO = {}));
var DruhPriznaniaEnum;
(function (DruhPriznaniaEnum) {
    DruhPriznaniaEnum["Priznanie"] = "priznanie";
    DruhPriznaniaEnum["CiastkovePriznanie"] = "ciastkovePriznanie";
    DruhPriznaniaEnum["CiastkovePriznanieNaZanikDanovejPovinnosti"] = "ciastkovePriznanieNaZanikDanovejPovinnosti";
    DruhPriznaniaEnum["OpravnePriznanie"] = "opravnePriznanie";
    DruhPriznaniaEnum["DodatocnePriznanie"] = "dodatocnePriznanie";
})(DruhPriznaniaEnum || (exports.DruhPriznaniaEnum = DruhPriznaniaEnum = {}));
var PravnyVztah;
(function (PravnyVztah) {
    PravnyVztah["Vlastnik"] = "vlastnik";
    PravnyVztah["Spravca"] = "spravca";
    PravnyVztah["Najomca"] = "najomca";
    PravnyVztah["Uzivatel"] = "uzivatel";
})(PravnyVztah || (exports.PravnyVztah = PravnyVztah = {}));
var Spoluvlastnictvo;
(function (Spoluvlastnictvo) {
    Spoluvlastnictvo["Podielove"] = "podieloveSpoluvlastnictvo";
    Spoluvlastnictvo["Bezpodielove"] = "bezpodieloveSpoluvlastnictvoManzelov";
})(Spoluvlastnictvo || (exports.Spoluvlastnictvo = Spoluvlastnictvo = {}));

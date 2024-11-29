"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../tax-form/types");
const exampleForm = {
    name: 'priznanieKDaniZNehnutelnostiExample3',
    formData: {
        druhPriznania: {
            rok: 2024,
            druh: types_1.DruhPriznaniaEnum.Priznanie,
        },
        udajeODanovnikovi: {
            stat: '703',
            email: 'test@mail.com',
            obecPsc: {
                psc: '85103',
                obec: 'Bratislava',
            },
            telefon: '+421901111111',
            priznanieAko: types_1.PriznanieAko.FyzickaOsoba,
            voSvojomMene: true,
            menoTitul: {
                meno: 'Test',
                titul: 'Ing.',
            },
            priezvisko: 'Test',
            rodneCislo: '910101/1111',
            ulicaCisloFyzickaOsoba: {
                cislo: '1',
                ulica: 'Test',
            },
            korespondencnaAdresa: {
                korespondencnaAdresaRovnaka: true,
            },
        },
        danZPozemkov: {
            vyplnitObject: {
                vyplnit: false,
            },
        },
        danZoStaviebJedenUcel: {
            vyplnitObject: {
                vyplnit: false,
            },
        },
        danZoStaviebViacereUcely: {
            vyplnitObject: {
                vyplnit: false,
            },
        },
        danZBytovANebytovychPriestorov: {
            vyplnitObject: {
                vyplnit: true,
            },
            kalkulackaWrapper: {
                pouzitKalkulacku: true,
            },
            priznania: [
                {
                    riadok1: {
                        supisneCislo: 1,
                        ulicaACisloDomu: 'Jána Smreka 1',
                    },
                    riadok2: {
                        kataster: 'Devínska Nová Ves',
                        cisloParcely: '1234/10',
                    },
                    pravnyVztah: 'vlastnik',
                    priznanieZaByt: {
                        priznanieZaByt: true,
                        cisloBytu: '23',
                        spoluvlastnickyPodiel: '1/2',
                        podielPriestoruNaSpolocnychCastiachAZariadeniachDomu: '3468/246230',
                    },
                    spoluvlastnictvo: 'podieloveSpoluvlastnictvo',
                    cisloListuVlastnictva: '3385',
                    priznanieZaNebytovyPriestor: {
                        priznanieZaNebytovyPriestor: false,
                    },
                    naZakladeDohody: true,
                    pocetSpoluvlastnikov: 2,
                    splnomocnenie: [],
                },
            ],
        },
        znizenieAleboOslobodenieOdDane: {
            byty: [],
            stavby: [],
            pozemky: [],
        },
    },
};
exports.default = exampleForm;

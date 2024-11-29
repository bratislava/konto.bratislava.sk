"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTaxXml = void 0;
const xml2js_1 = require("xml2js");
const functions_1 = require("./mapping/xml/functions");
const oddiel2_1 = require("./mapping/xml/oddiel2");
const oddiel3JedenUcel_1 = require("./mapping/xml/oddiel3JedenUcel");
const oddiel3ViacereUcely_1 = require("./mapping/xml/oddiel3ViacereUcely");
const oddiel4_1 = require("./mapping/xml/oddiel4");
const oslobodenie_1 = require("./mapping/xml/oslobodenie");
const prilohy_1 = require("./mapping/xml/prilohy");
const udajeODanovnikovi_1 = require("./mapping/xml/udajeODanovnikovi");
const removeEmptySubtrees_1 = require("./helpers/removeEmptySubtrees");
const generateTaxXml = (data, pretty = false, pospID = 'esmao.eforms.bratislava.obec_024', version = '201501.2') => {
    const jsonObj = {
        'E-form': {
            $: {
                xmlns: `http://schemas.gov.sk/form/${pospID}/${version}`,
            },
            Meta: {
                ID: pospID,
                Name: 'Ohlásenie o vzniku, zániku alebo zmene daňovej povinnosti k dani z nehnuteľností',
                Gestor: 'ESMaO',
                RecipientId: 'ico://sk/00603481',
                Version: version,
                ZepRequired: false,
            },
            Body: {
                ...(0, udajeODanovnikovi_1.udajeODanovnikoviXml)(data),
                ...(0, oddiel2_1.oddiel2Xml)(data),
                ...(0, oddiel3JedenUcel_1.oddiel3JedenUcelXml)(data),
                ...(0, oddiel3ViacereUcely_1.oddiel3ViacereUcelyXml)(data),
                ...(0, oddiel4_1.oddiel4Xml)(data),
                ...(0, oslobodenie_1.oslobodenieXml)(data),
                ...(0, prilohy_1.prilohyXml)(data),
                DatumZadaniaPodania: (0, functions_1.formatXsDateTimeXml)(new Date()),
                ZakladneVyhlasenie: {
                    SpravnostUdajovText: 'Všeobecné informácie o poskytnutí, spracovaní a ochrane osobných údajov nájdete na https://esluzby.bratislava.sk/page/ochrana-osobnych-udajov',
                    SuhlasSoSpracovanimText: 'Týmto dávam na základe slobodnej vôle súhlas na spracovanie mojich osobných údajov uvedených vo formulári tohto podania a získaných z môjho osobného dokladu za v zmysle Nariadenia európskeho parlamentu a rady EÚ 2016/679 o ochrane fyzických osôb pri spracúvaní osobných údajov a o voľnom pohybe takýchto údajov a zákona č. 18/2018 Z.z. o ochrane osobných údajov a o zmene a doplnení niektorých zákonov. Zároveň potvrdzujem dovŕšenie veku 16 rokov pre potreby spracovania osobných údajov. Osobné údaje poskytujem za účelom spracovania mojej žiadosti.',
                    PoskytujemSuhlas: 'true',
                    PoskytujemSuhlasText: 'Poskytujem súhlas na spracovanie osobných údajov',
                    NeposkytujemSuhlas: 'false',
                    NeposkytujemSuhlasText: 'Neposkytujem súhlas na spracovanie osobných údajov',
                },
                Dorucenie: {
                    AdresatPodania: {
                        AdresatPodania: 'Mesto',
                    },
                    Checkbox: {
                        Notifikacia: 'true',
                    },
                    FormaOdoslaniaZiadosti: 'Elektronicky',
                    FormaDoruceniaRozhodnutia: {
                        TypSposobuDorucenia: 'Elektronická schránka',
                    },
                },
            },
        },
    };
    const jsonObjWithoutLeafs = (0, removeEmptySubtrees_1.removeEmptySubtrees)(jsonObj);
    const builder = new xml2js_1.Builder({
        xmldec: { version: '1.0', encoding: 'UTF-8' },
        renderOpts: { pretty },
    });
    return builder.buildObject(jsonObjWithoutLeafs);
};
exports.generateTaxXml = generateTaxXml;

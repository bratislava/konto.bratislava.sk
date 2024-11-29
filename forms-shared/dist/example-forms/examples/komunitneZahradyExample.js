"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exampleForm = {
    name: 'komunitneZahradyExample',
    formData: {
        ziadatel: {
            menoPriezvisko: {
                meno: 'Ján',
                priezvisko: 'Kováč',
            },
            adresa: {
                ulicaACislo: 'Mierová 12',
                mestoPsc: {
                    mesto: 'Bratislava',
                    psc: '82108',
                },
            },
            email: 'jan.kovac@priklad.sk',
            telefon: '+421905987654',
        },
        obcianskeZdruzenie: {
            nazovObcianskehoZdruzenia: 'Zelená Bratislava',
            ico: '12345678',
            adresaSidla: {
                ulicaACislo: 'Šancová 56',
                mestoPsc: {
                    mesto: 'Bratislava',
                    psc: '83104',
                },
            },
            statutar: {
                menoStatutara: 'Marta',
                priezviskoStatutara: 'Nováková',
            },
        },
        pozemok: {
            typPozemku: 'predschvalenyPozemok',
            predschvalenyPozemokVyber: 'Azalková',
        },
        zahrada: {
            dovodyZalozenia: 'Priestor je v súčasnosti nevyužívaný a zanedbaný. Komunitná záhrada by poskytla miesto pre miestnych obyvateľov na pestovanie rastlín a stretávanie sa.',
            suhlasKomunity: 'Získali sme podporu od miestnych obyvateľov prostredníctvom petície a verejných stretnutí.',
            organizacnyTim: 'Tím bude pozostávať z miestnych dobrovoľníkov, ktorí sa budú starať o záhradu a organizovať komunitné aktivity.',
            prevadzka: 'Údržbu zelene budú zabezpečovať dobrovoľníci. Odpad bude separovaný a recyklovaný, pričom sa budeme snažiť o zero-waste režim.',
            inkluzivnost: 'Projekt bude otvorený pre všetkých miestnych obyvateľov. Záujemcovia o záhradkárčenie budú vybraní na základe transparentného procesu.',
            financovanie: 'Plánujeme využiť granty a členské poplatky. Predbežný rozpočet už máme a plánujeme ho doplniť o ďalšie zdroje.',
        },
        prilohyPredschvalenyPozemok: {
            umiestnenie: 'ace1a8c2-f96e-4583-bdf9-64233b582572',
            dizajn: '27766841-1f8f-4daa-b6e9-df826b294ae0',
            fotografie: '7510f8c5-c777-4426-8166-90f253eb0738',
            ine: '1f174bf8-328c-4d1e-8dbb-2afe98e1a0f0',
        },
    },
    serverFiles: [
        {
            id: 'ace1a8c2-f96e-4583-bdf9-64233b582572',
            fileName: 'umiestnenie.jpg',
            fileSize: 0,
            status: 'SAFE',
        },
        {
            id: '27766841-1f8f-4daa-b6e9-df826b294ae0',
            fileName: 'dizajn.jpg',
            fileSize: 0,
            status: 'SAFE',
        },
        {
            id: '7510f8c5-c777-4426-8166-90f253eb0738',
            fileName: 'fotografie.jpg',
            fileSize: 0,
            status: 'SAFE',
        },
        {
            id: '1f174bf8-328c-4d1e-8dbb-2afe98e1a0f0',
            fileName: 'ine.pdf',
            fileSize: 0,
            status: 'SAFE',
        },
    ],
};
exports.default = exampleForm;

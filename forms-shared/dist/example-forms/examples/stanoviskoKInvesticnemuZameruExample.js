"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exampleForm = {
    name: 'stanoviskoKInvesticnemuZameruExample',
    formData: {
        ziadatel: {
            typ: 'Fyzická osoba',
            email: 'jan.kovac@priklad.sk',
            telefon: '+421905987654',
            menoPriezvisko: 'Ján Kováč',
            adresa: {
                ulicaACislo: 'Mierová 12',
                mestoPsc: {
                    mesto: 'Bratislava',
                    psc: '82108',
                },
            },
        },
        investor: {
            investorZiadatelom: false,
            splnomocnenie: 'c6bd9718-97ea-4601-b79f-c70e7064943d',
            typ: 'Fyzická osoba',
            email: 'marta.novakova@priklad.sk',
            telefon: '+421902123456',
            menoPriezvisko: 'Marta Nováková',
            adresa: {
                ulicaACislo: 'Šancová 56',
                mestoPsc: {
                    mesto: 'Bratislava',
                    psc: '83104',
                },
            },
        },
        zodpovednyProjektant: {
            menoPriezvisko: 'Peter Horváth',
            email: 'peter.horvath@priklad.sk',
            projektantTelefon: '+421911654321',
            autorizacneOsvedcenie: '123456789',
            datumSpracovania: '2024-07-03',
        },
        stavba: {
            nazov: 'Nový Bytový Dom',
            druhStavby: 'Bytový dom',
            ulica: 'Dunajská',
            supisneCislo: '464',
            parcelneCislo: '56789',
            kataster: ['Dúbravka', 'Karlova Ves'],
        },
        prilohy: {
            architektonickaStudia: ['cb1e3a95-f9d2-4e55-b482-8e7919f2b43f'],
        },
    },
    serverFiles: [
        {
            id: 'c6bd9718-97ea-4601-b79f-c70e7064943d',
            fileName: 'splnomocnenie.pdf',
            fileSize: 0,
            status: 'SAFE',
        },
        {
            id: 'cb1e3a95-f9d2-4e55-b482-8e7919f2b43f',
            fileName: 'architektonicka-studia.pdf',
            fileSize: 0,
            status: 'SAFE',
        },
    ],
};
exports.default = exampleForm;

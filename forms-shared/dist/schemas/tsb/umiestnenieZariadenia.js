"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("../../generator/functions");
const helpers_1 = require("../../generator/helpers");
exports.default = (0, functions_1.schema)({ title: 'TEST - Umiestnenie zariadenia' }, {}, [
    (0, functions_1.step)('ziadatel', { title: 'Žiadateľ' }, [
        (0, functions_1.radioGroup)('objednavatelAko', {
            type: 'string',
            title: 'Objednávateľ ako',
            required: true,
            items: (0, helpers_1.createStringItems)([
                'Fyzická osoba',
                'Fyzická osoba - podnikateľ',
                'Právnická osoba',
            ]),
        }, { variant: 'boxed', orientations: 'column' }),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([
            [
                ['objednavatelTyp'],
                {
                    enum: ['Fyzická osoba', 'Fyzická osoba - podnikateľ'],
                },
            ],
        ]), [
            (0, functions_1.object)('menoPriezvisko', { required: true }, { columns: true, columnsRatio: '1/1' }, [
                (0, functions_1.input)('meno', { title: 'Meno', required: true, type: 'text' }, {}),
                (0, functions_1.input)('priezvisko', { title: 'Priezvisko', required: true, type: 'text' }, {}),
            ]),
        ]),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([
            [
                ['objednavatelTyp'],
                {
                    enum: ['Fyzická osoba - podnikateľ', 'Právnická osoba'],
                },
            ],
        ]), [
            (0, functions_1.input)('obchodneMeno', { title: 'Obchodné meno', required: true, type: 'text' }, {}),
            (0, functions_1.input)('ico', { title: 'IČO', required: true, type: 'text' }, {}),
            (0, functions_1.input)('dic', { title: 'DIČ', required: true, type: 'text' }, {}),
            (0, functions_1.input)('icDph', { title: 'IČ DPH', required: true, type: 'text' }, {}),
        ]),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([
            [
                ['objednavatelTyp'],
                {
                    const: 'Fyzická osoba',
                },
            ],
        ]), [
            (0, functions_1.input)('adresaTrvalehoPobytu', { title: 'Adresa trvalého pobytu', required: true, type: 'text' }, { helptext: 'Vyplňte vo formáte ulica a číslo' }),
        ]),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([
            [
                ['objednavatelTyp'],
                {
                    const: 'Fyzická osoba - podnikateľ',
                },
            ],
        ]), [
            (0, functions_1.input)('adresaPodnikania', { title: 'Miesto podnikania', required: true, type: 'text' }, { helptext: 'Vyplňte vo formáte ulica a číslo' }),
        ]),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([
            [
                ['objednavatelTyp'],
                {
                    const: 'Právnická osoba',
                },
            ],
        ]), [
            (0, functions_1.input)('adresaSidla', { title: 'Adresa sídla', required: true, type: 'text' }, { helptext: 'Vyplňte vo formáte ulica a číslo' }),
        ]),
        (0, functions_1.object)('mestoPsc', { required: true }, {
            columns: true,
            columnsRatio: '3/1',
        }, [
            (0, functions_1.input)('mesto', { type: 'text', title: 'Mesto', required: true }, {}),
            (0, functions_1.input)('psc', { type: 'ba-slovak-zip', title: 'PSČ', required: true }, {}),
        ]),
        (0, functions_1.input)('email', { title: 'E-mail', required: true, type: 'email' }, {}),
        (0, functions_1.input)('telefonneCislo', { title: 'Telefónne číslo', required: true, type: 'ba-phone-number' }, { helptext: 'Vyplňte vo formáte +421' }),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['objednavatelTyp'], { const: 'Právnická osoba' }]]), [
            (0, functions_1.object)('kontaktnaOsoba', { required: true }, { objectDisplay: 'boxed', title: 'Kontaktná osoba' }, [
                (0, functions_1.input)('meno', { title: 'Meno', required: true, type: 'text' }, { helptext: 'Meno' }),
                (0, functions_1.input)('priezvisko', { title: 'Priezvisko', required: true, type: 'text' }, { helptext: 'Priezvisko' }),
                (0, functions_1.input)('email', { title: 'E-mail', required: true, type: 'email' }, {}),
                (0, functions_1.input)('telefonneCislo', { title: 'Telefónne číslo', required: true, type: 'ba-phone-number' }, { helptext: 'Vyplňte vo formáte +421' }),
            ]),
        ]),
    ]),
    (0, functions_1.step)('informacieOZariadeni', { title: 'Informácie o zariadení' }, [
        (0, functions_1.fileUpload)('umiestnenieStoziare', {
            title: 'Nahrajte vyplnený súbor Umiestnenie zariadení na stožiare verejného osvetlenia.xlsx',
            required: true,
            multiple: true,
        }, {
            type: 'dragAndDrop',
            helptext: 'V prípade, že požadovaný súbor na vyplnenie ešte nemáte, stiahnuť si ho viete na tomto odkaze. Dbajte na to, aby ste v súbore spomenuli všetky zariadenia, ktoré si želáte umiestniť. Bez vyplnenia a nahratia tohto súboru nebude možné vašu žiadosť spracovať.',
        }),
        (0, functions_1.radioGroup)('zodpovednostZaMontaz', {
            type: 'string',
            title: 'Za montáž, prevádzku a demontáž zodpovedá',
            required: true,
            items: (0, helpers_1.createStringItems)(['Organizácia', 'Fyzická osoba']),
        }, { variant: 'boxed', orientations: 'column' }),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['zodpovednostZaMontaz'], { const: 'Organizácia' }]]), [
            (0, functions_1.input)('nazovOrganizacie', { type: 'text', title: 'Názov organizácie', required: true }, {}),
            (0, functions_1.object)('kontaktnaOsoba', { required: true }, { objectDisplay: 'boxed', title: 'Kontaktná osoba' }, [
                (0, functions_1.object)('menoPriezvisko', { required: true }, {
                    columns: true,
                    columnsRatio: '1/1',
                }, [
                    (0, functions_1.input)('meno', { title: 'Meno', required: true, type: 'text' }, {}),
                    (0, functions_1.input)('priezvisko', { title: 'Priezvisko', required: true, type: 'text' }, {}),
                ]),
            ]),
        ]),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['zodpovednostZaMontaz'], { const: 'Fyzická osoba' }]]), [
            (0, functions_1.object)('menoPriezvisko', { required: true }, {
                columns: true,
                columnsRatio: '1/1',
            }, [
                (0, functions_1.input)('meno', { title: 'Meno', required: true, type: 'text' }, {}),
                (0, functions_1.input)('priezvisko', { title: 'Priezvisko', required: true, type: 'text' }, {}),
            ]),
        ]),
        (0, functions_1.input)('email', { title: 'E-mail', required: true, type: 'email' }, {}),
        (0, functions_1.input)('telefonneCislo', { title: 'Telefónne číslo', required: true, type: 'ba-phone-number' }, { helptext: 'Vyplňte vo formáte +421' }),
        (0, functions_1.datePicker)('planovanyDatumMontaze', {
            title: 'Plánovaný dátum montáže zariadenia',
            required: true,
        }, {
            helptext: 'O zahájení prác je potrebné písomne informovať minimálne 1 pracovný deň vopred prostredníctvom e-mailu na info@tsb.sk.',
        }),
        (0, functions_1.datePicker)('planovanyDatumDemontaze', {
            title: 'Plánovaný dátum demontáže zariadenia',
            required: true,
        }, {
            helptext: 'Žiadateľ je povinný na základe písomnej výzvy zabezpečiť demontáž svojho zariadenia na vlastné náklady, a to v lehote najneskôr do 15 kalendárnych dní od doručenia takejto výzvy prostredníctvom kontaktného e-mailu.',
        }),
    ]),
    (0, functions_1.step)('prilohy', { title: 'Prílohy' }, [
        (0, functions_1.fileUpload)('fotografiaVizualizacia', {
            title: 'Fotografia alebo vizualizácia zariadenia/zariadení',
            required: true,
            multiple: true,
        }, {
            type: 'dragAndDrop',
            helptext: 'Nahrajte jednu prílohu obsahujúcu fotografie alebo vizualizácie všetkých zariadení.',
        }),
    ]),
]);

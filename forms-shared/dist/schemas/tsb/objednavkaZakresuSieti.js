"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("../../generator/functions");
const helpers_1 = require("../../generator/helpers");
exports.default = (0, functions_1.schema)({
    title: 'TEST - Objednávka zákresu sietí',
}, {}, [
    (0, functions_1.step)('objednavatel', { title: 'Objednávateľ' }, [
        (0, functions_1.radioGroup)('objednavatelTyp', {
            type: 'string',
            title: 'Objednávate ako',
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
    (0, functions_1.step)('udaje', { title: 'Údaje' }, [
        (0, functions_1.object)('fakturacneUdaje', { required: true }, { objectDisplay: 'boxed', title: 'Fakturačné údaje' }, [
            (0, functions_1.input)('fakturacnaAdresa', { title: 'Fakturačná adresa', required: true, type: 'text' }, { helptext: 'Vyplňte vo formáte ulica a číslo' }),
            (0, functions_1.input)('mesto', { title: 'Mesto', required: true, type: 'text' }, {}),
            (0, functions_1.input)('psc', { title: 'PSČ', required: true, type: 'text' }, {}),
            (0, functions_1.input)('email', { title: 'E-mail', required: true, type: 'email' }, { helptext: 'Faktúra vám bude zaslaná prostredníctvom tohto emailu' }),
        ]),
        (0, functions_1.object)('udajeObjednavky', { required: true }, { objectDisplay: 'boxed', title: 'Údaje objednávky' }, [
            (0, functions_1.input)('adresaObjednavky', { title: 'Adresa objednávky', required: true, type: 'text' }, { helptext: 'Vyplňte vo formáte ulica a číslo' }),
            (0, functions_1.radioGroup)('viacKatastralneUzemia', {
                type: 'boolean',
                title: 'Nachádza sa adresa stavby v dvoch alebo viacerých katastrálnych územiach?',
                required: true,
                items: [
                    { value: true, label: 'Áno' },
                    { value: false, label: 'Nie', isDefault: true },
                ],
            }, {
                variant: 'boxed',
                orientations: 'row',
            }),
            (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['viacKatastralneUzemia'], { const: true }]]), [
                (0, functions_1.selectMultiple)('katastralneUzemiaMultiple', {
                    title: 'Katastrálne územie',
                    required: true,
                    items: (0, helpers_1.createStringItems)([
                        'Čunovo',
                        'Devín',
                        'Devínska Nová Ves',
                        'Dúbravka',
                        'Jarovce',
                        'Karlova Ves',
                        'Lamač',
                        'Nové Mesto',
                        'Vinohrady',
                        'Petržalka',
                        'Podunajské Biskupice',
                        'Rača',
                        'Rusovce',
                        'Ružinov',
                        'Trnávka',
                        'Nivy',
                        'Staré Mesto',
                        'Vajnory',
                        'Vrakuňa',
                        'Záhorská Bystrica',
                    ]),
                }, {
                    helptext: 'Vyberte zo zoznamu katastrálnych území. Zobraziť ukážku katastrálnych území.',
                }),
            ]),
            (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['viacKatastralneUzemia'], { const: false }]]), [
                (0, functions_1.selectMultiple)('katastralneUzemieSingle', {
                    title: 'Katastrálne územie',
                    required: true,
                    items: (0, helpers_1.createStringItems)([
                        'Čunovo',
                        'Devín',
                        'Devínska Nová Ves',
                        'Dúbravka',
                        'Jarovce',
                        'Karlova Ves',
                        'Lamač',
                        'Nové Mesto',
                        'Vinohrady',
                        'Petržalka',
                        'Podunajské Biskupice',
                        'Rača',
                        'Rusovce',
                        'Ružinov',
                        'Trnávka',
                        'Nivy',
                        'Staré Mesto',
                        'Vajnory',
                        'Vrakuňa',
                        'Záhorská Bystrica',
                    ]),
                }, {
                    helptext: 'Vyberte zo zoznamu katastrálnych území. Zobraziť ukážku katastrálnych území.',
                }),
            ]),
        ]),
    ]),
    (0, functions_1.step)('prilohy', { title: 'Prílohy' }, [
        (0, functions_1.fileUpload)('snimkaKatastralnejMapy', {
            title: 'Snímka z katastrálnej mapy s vyznačeným záujmovým územím',
            required: true,
        }, {
            type: 'dragAndDrop',
            helptext: `Využiť môžete katastrálnu mapu ZBGIS, kde nájdete požadované záujmové územie.

Ako vytvoriť snímku?
Prejdite do katastrálnej mapy ZBGIS. Otvorením menu v ľavom hornom rohu nájdete funkciu Meranie, ktorá Vám umožní zaznačiť Vaše záujmové územie na katastrálnej mape (zaznačenie Vám následne vypočíta výmeru plochy). Snímku vycentrujte a využite možnosť ZBGIS Tlačiť do PDF. Dokument uložte a následne nahrajte do Nahrať súbory.`,
        }),
    ]),
]);

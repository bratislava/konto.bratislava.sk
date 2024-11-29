"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("../../generator/functions");
const helpers_1 = require("../../generator/helpers");
const fields_1 = require("../shared/fields");
exports.default = (0, functions_1.schema)({
    title: 'TEST - Objednávka vytýčenia',
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
            (0, fields_1.sharedAddressField)('adresaSidla', 'Adresa sídla', true),
            (0, functions_1.input)('email', { title: 'E-mail', required: true, type: 'email' }, {
                helptext: 'Faktúra vám bude zaslaná prostredníctvom tohto emailu',
            }),
        ]),
        (0, functions_1.object)('udajeObjednavky', { required: true }, { objectDisplay: 'boxed', title: 'Údaje objednávky' }, [
            (0, functions_1.input)('dovodVytycenia', { title: 'Dôvod vytýčenia', required: true, type: 'text' }, {
                helptext: 'Napríklad: vytýčenie káblovej poruchy, za účelom rozkopávky, vybudovanie inžinierskych sietí...',
            }),
            (0, functions_1.input)('pozadovaneMiestoPlnenia', { title: 'Požadované miesto plnenia', required: true, type: 'text' }, { helptext: 'Vyplňte vo formáte ulica a číslo' }),
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
                (0, functions_1.selectMultiple)('katastralneUzemia', {
                    title: 'Katastrálne územia',
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
                (0, functions_1.select)('katastralneUzemie', {
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
            (0, functions_1.input)('druhStavby', { title: 'Druh stavby', required: false, type: 'text' }, { helptext: 'Napríklad: telekomunikačná líniová stavba' }),
            (0, functions_1.datePicker)('pozadovanyTerminPlnenia', { title: 'Požadovaný termín plnenia', required: true }, { helptext: 'Štandardný termín na vybavenie objednávky je 30 dní' }),
        ]),
    ]),
    (0, functions_1.step)('prilohy', { title: 'Prílohy' }, [
        (0, functions_1.fileUpload)('informativnyZakresSieti', {
            title: 'Informatívny zákres sietí vydaný Technickými sieťami Bratislava, a.s.',
            required: true,
            multiple: true,
        }, {
            type: 'dragAndDrop',
            helptext: 'Požiadať o informatívny zákres vydaný Technickými sieťami Bratislava, a.s. môžete formou spoplatnenej služby Objednávka informatívneho zákresu sietí',
            accept: '.pdf,.jpg,.jpeg,.png',
        }),
    ]),
]);

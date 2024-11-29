"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("../generator/functions");
const helpers_1 = require("../generator/helpers");
const fields_1 = require("./shared/fields");
exports.default = (0, functions_1.schema)({
    title: 'Predzáhradky',
}, {}, [
    (0, functions_1.step)('ziadatel', { title: 'Žiadateľ' }, [
        (0, functions_1.object)('menoPriezvisko', { required: true }, {
            columns: true,
            columnsRatio: '1/1',
        }, [
            (0, functions_1.input)('meno', { title: 'Meno', required: true, type: 'text' }, {}),
            (0, functions_1.input)('priezvisko', { title: 'Priezvisko', required: true, type: 'text' }, {}),
        ]),
        (0, fields_1.sharedAddressField)('adresa', 'Adresa trvalého pobytu', true),
        (0, functions_1.input)('email', { title: 'E-mail', required: true, type: 'email' }, {}),
        (0, fields_1.sharedPhoneNumberField)('telefon', true),
    ]),
    (0, functions_1.step)('predzahradka', {
        title: 'Predzáhradka',
    }, [
        (0, functions_1.radioGroup)('typRegistracie', {
            type: 'string',
            title: 'Mám záujem o',
            required: true,
            items: [
                { value: 'nova', label: 'Vytvorenie novej predzáhradky', isDefault: true },
                { value: 'existujuca', label: 'Registrácia existujúcej predzáhradky' },
            ],
        }, {
            variant: 'boxed',
            orientations: 'column',
        }),
        (0, functions_1.input)('adresa', {
            title: 'Adresa predzáhradky (ulica, číslo)',
            required: true,
            type: 'text',
        }, {}),
        (0, functions_1.select)('mestskaCast', {
            title: 'Mestská časť, v ktorej sa pozemok nachádza',
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
                'Petržalka',
                'Podunajské Biskupice',
                'Rača',
                'Rusovce',
                'Ružinov',
                'Staré Mesto',
                'Vajnory',
                'Vrakuňa',
                'Záhorská Bystrica',
            ], false),
        }, { placeholder: 'Vyberte' }),
        (0, functions_1.input)('parcelneCislo', { title: 'Číslo parcely', required: true, type: 'text' }, {
            helptext: 'Číslo parcely a bližšie informácie k pozemku a jeho vlastníkom nájdete na [katastrálnej mape ZBGIS](https://zbgis.skgeodesy.sk/mkzbgis/sk/kataster?pos=48.155530,17.129713,13). Pre schválenie žiadosti sa musí jednať o mestský pozemok.',
            helptextMarkdown: true,
            size: 'medium',
        }),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['typRegistracie'], { const: 'nova' }]]), [
            (0, functions_1.textArea)('rozlozenieNova', {
                title: 'Plánované rozloženie predzáhradky',
                required: true,
            }, {
                placeholder: 'Popíšte',
            }),
        ]),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['typRegistracie'], { const: 'existujuca' }]]), [
            (0, functions_1.textArea)('rozlozenieExistujuca', {
                title: 'Rozloženie predzáhradky',
                required: true,
            }, {
                placeholder: 'Popíšte',
                helptext: 'Popíšte rozloženie jednotlivých prvkov predzáhradky.',
            }),
            (0, functions_1.input)('dobaStarostlivosti', { title: 'Ako dlho sa o predzáhradku staráte?', required: true, type: 'text' }, {}),
        ]),
        (0, functions_1.textArea)('ine', { title: 'Iné', required: true }, {
            placeholder: 'Popíšte',
            helptext: 'Ak by ste nám chceli ešte niečo v súvislosti s predzáhradkou napísať, tu je na to priestor.',
        }),
    ]),
    (0, functions_1.step)('prilohy', { title: 'Prílohy' }, [
        (0, functions_1.fileUpload)('mapa', { title: 'Snímka z mapy so zakreslením miesta predzáhradky', required: true }, { type: 'dragAndDrop' }),
        (0, functions_1.fileUpload)('fotografie', {
            title: 'Fotografie predzáhradky alebo miesta, na ktorom si chcete vytvoriť predzáhradku',
            required: true,
        }, { type: 'dragAndDrop' }),
        (0, functions_1.fileUpload)('projekt', { title: 'Projekt predzáhradky' }, {
            type: 'dragAndDrop',
            helptext: 'Napríklad, vo forme jednoduchého nákresu rozloženia jednotlivých prvkov.',
        }),
        (0, functions_1.fileUpload)('inePrilohy', { title: 'Iné' }, { type: 'dragAndDrop' }),
    ]),
]);

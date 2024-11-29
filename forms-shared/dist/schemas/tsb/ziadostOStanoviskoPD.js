"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("../../generator/functions");
const helpers_1 = require("../../generator/helpers");
exports.default = (0, functions_1.schema)({
    title: 'TEST - Žiadosť o stanovisko k projektovej dokumentácii',
}, {}, [
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
    (0, functions_1.step)('udajeOStavbe', { title: 'Údaje o stavbe' }, [
        (0, functions_1.input)('nazovStavby', { type: 'text', title: 'Názov stavby', required: true }, {
            helptext: 'Napríklad: Polyfunkčný objekt ABC',
        }),
        (0, functions_1.input)('adresaStavby', { type: 'text', title: 'Adresa stavby', required: true }, { helptext: 'Vyplňte vo formáte ulica a číslo' }),
        (0, functions_1.selectMultiple)('katastralneUzemie', {
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
        (0, functions_1.datePicker)('predpokladanyTerminStavbyOd', { title: 'Predpokladaný termín stavby od', required: true }, {}),
        (0, functions_1.datePicker)('predpokladanyTerminStavbyDo', { title: 'Predpokladaný termín stavby do', required: true }, {}),
        (0, functions_1.input)('typProjektovejDokumentacie', { type: 'text', title: 'Typ projektovej dokumentácie', required: true }, { helptext: 'Napríklad: Ohlásenie stavby' }),
        (0, functions_1.radioGroup)('stupenProjektovejDokumentacie', {
            type: 'string',
            title: 'Stupeň projektovej dokumentácie',
            required: true,
            items: (0, helpers_1.createStringItems)([
                'Dokumentácia pre územné rozhodnutie (DÚR)',
                'Dokumentácia pre stavebné povolenie (DSP)',
                'Dokumentácia pre realizáciu stavby (DRS)',
            ]),
        }, { variant: 'boxed', orientations: 'column' }),
    ]),
    (0, functions_1.step)('prilohy', { title: 'Prílohy' }, [
        (0, functions_1.fileUpload)('technickaSpravaFile', {
            title: 'Technická správa',
            required: true,
            multiple: true,
        }, {
            type: 'dragAndDrop',
            helptext: 'Technická správa s popisom navrhovaného technického riešenia.',
        }),
        (0, functions_1.fileUpload)('vyznaceneZaujmoveUzemieFile', {
            title: 'Vyznačené záujmové územie na katastrálnej mape',
            required: true,
            multiple: true,
        }, {
            type: 'dragAndDrop',
            helptext: 'Využiť môžete katastrálnu mapu ZBGIS, kde nájdete požadované záujmové územie. V katastrálnej mape zvoľte funkciu Meranie v ľavom menu a vyznačte záujmové územie. Meranie uložte cez možnosť Tlačiť do PDF.',
        }),
        (0, functions_1.fileUpload)('situacnyVykresFile', {
            title: 'Situačný výkres',
            required: true,
            multiple: true,
        }, {
            type: 'dragAndDrop',
        }),
        (0, functions_1.fileUpload)('svetelnoTechnickyVypocetFile', {
            title: 'Svetelno-technický výpočet',
            required: false,
            multiple: true,
        }, {
            type: 'dragAndDrop',
            helptext: 'Výpočet je nutné doložiť v prípade stavby verejného osvetlenia.',
        }),
    ]),
]);

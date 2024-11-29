"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSurSchema = void 0;
const functions_1 = require("../../generator/functions");
const helpers_1 = require("../../generator/helpers");
const fields_1 = require("../shared/fields");
const ziadatelInvestorFields = [
    (0, functions_1.radioGroup)('typ', {
        type: 'string',
        title: 'Žiadate ako',
        required: true,
        items: (0, helpers_1.createStringItems)(['Fyzická osoba', 'Fyzická osoba – podnikateľ', 'Právnická osoba']),
    }, { variant: 'boxed' }),
    (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['typ'], { const: 'Fyzická osoba' }]]), [
        (0, functions_1.input)('menoPriezvisko', { type: 'text', title: 'Meno a priezvisko', required: true }, {}),
        (0, fields_1.sharedAddressField)('adresa', 'Korešpondenčná adresa', true),
    ], [(0, functions_1.input)('obchodneMeno', { type: 'text', title: 'Obchodné meno', required: true }, {})]),
    (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['typ'], { const: 'Fyzická osoba – podnikateľ' }]]), [
        (0, fields_1.sharedAddressField)('miestoPodnikania', 'Miesto podnikania', true),
    ]),
    (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['typ'], { const: 'Právnická osoba' }]]), [
        (0, functions_1.input)('ico', { type: 'text', title: 'IČO', required: true }, {}),
        (0, fields_1.sharedAddressField)('adresaSidla', 'Adresa sídla', true),
    ]),
    (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['typ'], { const: 'Právnická osoba' }]]), [
        (0, functions_1.input)('kontaktnaOsoba', { type: 'text', title: 'Kontaktná osoba', required: true }, {}),
    ]),
    (0, functions_1.input)('email', { title: 'E-mail', required: true, type: 'email' }, {}),
    (0, fields_1.sharedPhoneNumberField)('telefon', true),
];
const getSurSchema = (zavazne) => (0, functions_1.schema)({
    title: zavazne
        ? 'Žiadosť o záväzné stanovisko k investičnej činnosti'
        : 'Žiadosť o stanovisko k investičnému zámeru',
}, {
    titlePath: 'stavba.nazov',
    titleFallback: 'Názov stavby/projektu',
}, [
    (0, functions_1.step)('ziadatel', { title: 'Žiadateľ' }, ziadatelInvestorFields),
    (0, functions_1.step)('investor', { title: 'Investor' }, [
        (0, functions_1.radioGroup)('investorZiadatelom', {
            type: 'boolean',
            title: 'Je investor rovnaká osoba ako žiadateľ?',
            required: true,
            items: [
                { value: true, label: 'Áno', isDefault: true },
                { value: false, label: 'Nie' },
            ],
        }, {
            variant: 'boxed',
            orientations: 'row',
        }),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['investorZiadatelom'], { const: false }]]), [
            (0, functions_1.fileUpload)('splnomocnenie', { title: 'Splnomocnenie na zastupovanie', required: true }, {
                type: 'button',
                helptext: 'nahrajte splnomocnenie od investora',
            }),
            ...ziadatelInvestorFields,
        ]),
    ]),
    (0, functions_1.step)('zodpovednyProjektant', { title: 'Zodpovedný projektant' }, [
        (0, functions_1.input)('menoPriezvisko', { type: 'text', title: 'Meno a priezvisko', required: true }, {}),
        (0, functions_1.input)('email', { title: 'E-mail', required: true, type: 'email' }, {}),
        (0, fields_1.sharedPhoneNumberField)('projektantTelefon', true),
        (0, functions_1.input)('autorizacneOsvedcenie', { type: 'text', title: 'Číslo autorizačného osvedčenia', required: true }, {
            helptext: 'Autorizačné osvedčenie dokazuje, že projektant je oprávnený na výkon svojej činnosti. Nie je potrebné pri vypracovaní dokumentácie k jednoduchým / drobným stavbám, kde postačuje osoba s odborným vzdelaním.',
            size: 'medium',
        }),
        (0, functions_1.datePicker)('datumSpracovania', { title: 'Dátum spracovania projektovej dokumentácie', required: true }, { size: 'medium' }),
    ]),
    (0, functions_1.step)('stavba', { title: 'Informácie o stavbe' }, [
        (0, functions_1.input)('nazov', { type: 'text', title: 'Názov stavby/projektu', required: true }, {}),
        (0, functions_1.radioGroup)('druhStavby', {
            type: 'string',
            title: 'Druh stavby',
            items: (0, helpers_1.createStringItems)([
                'Bytový dom',
                'Rodinný dom',
                'Iná budova na bývanie',
                'Nebytová budova',
                'Inžinierska stavba',
                'Iné',
            ]),
            required: true,
        }, { variant: 'boxed' }),
        (0, functions_1.input)('ulica', { type: 'text', title: 'Ulica', required: true }, { size: 'medium' }),
        (0, functions_1.input)('supisneCislo', { type: 'text', title: 'Súpisné číslo' }, { size: 'medium' }),
        (0, functions_1.input)('parcelneCislo', { type: 'text', title: 'Parcelné číslo', required: true }, { size: 'medium' }),
        (0, functions_1.selectMultiple)('kataster', {
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
                'Nivy',
                'Nové Mesto',
                'Petržalka',
                'Podunajské Biskupice',
                'Rača',
                'Rusovce',
                'Ružinov',
                'Staré Mesto',
                'Trnávka',
                'Vajnory',
                'Vinohrady',
                'Vrakuňa',
                'Záhorská Bystrica',
            ], false),
        }, {
            helptext: 'Vyberte jedno alebo viacero katastrálnych území, v ktorých sa pozemok nachádza.',
            size: 'medium',
        }),
    ]),
    ...(zavazne
        ? [
            (0, functions_1.step)('konanieTyp', { title: 'Typ konania na stavebnom úrade' }, [
                (0, functions_1.radioGroup)('typ', {
                    type: 'string',
                    title: 'Typ konania',
                    items: (0, helpers_1.createStringItems)([
                        'Územné konanie',
                        'Územné konanie spojené so stavebným konaním',
                        'Zmena stavby pred dokončením',
                        'Zmena v užívaní stavby',
                        'Konanie o dodatočnom povolení stavby',
                    ]),
                    required: true,
                }, { variant: 'boxed' }),
                (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['typ'], { const: 'Konanie o dodatočnom povolení stavby' }]]), [
                    (0, functions_1.radioGroup)('ziadostOdovodnenie', {
                        type: 'string',
                        title: 'Upresnenie konania',
                        items: (0, helpers_1.createStringItems)([
                            'Realizácia stavby, resp. jej úprav bez akéhokoľvek povolenia',
                            'Dodatočné povolenie zmeny stavby pred dokončením',
                        ]),
                        required: true,
                    }, { variant: 'boxed' }),
                ]),
                (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([
                    [
                        ['ziadostOdovodnenie'],
                        { const: 'Dodatočné povolenie zmeny stavby pred dokončením' },
                    ],
                ]), [
                    (0, functions_1.fileUpload)('stavbaPisomnosti', {
                        title: 'Relevantné písomnosti súvisiace so stavbou',
                        required: true,
                        multiple: true,
                    }, {
                        type: 'button',
                        helptext: 'napr. vydané stavebné povolenie, stanoviská hlavného mesta',
                    }),
                    (0, functions_1.fileUpload)('stavbaFotodokumentacia', { title: 'Fotodokumentácia stavby', required: true, multiple: true }, {
                        type: 'button',
                    }),
                ]),
            ]),
        ]
        : []),
    (0, functions_1.step)('prilohy', { title: 'Prílohy' }, [
        (0, functions_1.fileUpload)(zavazne ? 'projektovaDokumentacia' : 'architektonickaStudia', {
            title: zavazne ? 'Projektová dokumentácia' : 'Architektonická štúdia',
            required: true,
            multiple: true,
        }, {
            type: 'dragAndDrop',
            helptext: zavazne
                ? 'Jednotlivé časti dokumentácie môžete nahrať samostatne alebo ako jeden súbor.'
                : 'Jednotlivé časti štúdie môžete nahrať samostatne alebo ako jeden súbor.',
            belowComponents: [
                {
                    type: 'additionalLinks',
                    props: {
                        links: [
                            zavazne
                                ? {
                                    href: 'https://bratislava.sk/zivotne-prostredie-a-vystavba/rozvoj-mesta/usmernovanie-vystavby/zavazne-stanovisko-k-investicnej-cinnosti',
                                    title: 'Čo všetko má obsahovať projektová dokumentácia',
                                }
                                : {
                                    href: 'https://bratislava.sk/zivotne-prostredie-a-vystavba/rozvoj-mesta/usmernovanie-vystavby/stanovisko-k-investicnemu-zameru',
                                    title: 'Čo všetko má obsahovať architektonická štúdia',
                                },
                        ],
                    },
                },
            ],
        }),
    ]),
]);
exports.getSurSchema = getSurSchema;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bezpodieloveSpoluvlastnictvoManzelov = exports.splnomocnenec = exports.danovnik = exports.udajeOOpravnenejOsobeNaPodaniePriznania = void 0;
const functions_1 = require("../../generator/functions");
const helpers_1 = require("../../generator/helpers");
const fields_1 = require("../shared/fields");
const esbsCiselniky_1 = require("./esbsCiselniky");
var UlicaCisloTyp;
(function (UlicaCisloTyp) {
    UlicaCisloTyp["FyzickaOsoba"] = "FyzickaOsoba";
    UlicaCisloTyp["FyzickaOsobaPodnikatel"] = "FyzickaOsobaPodnikatel";
    UlicaCisloTyp["PravnickaOsoba"] = "PravnickaOsoba";
    UlicaCisloTyp["BezpodieloveSpoluvlastnictvoManzelov"] = "BezpodieloveSpoluvlastnictvoManzelov";
    UlicaCisloTyp["KorespondencnaAdresa"] = "KorespondencnaAdresa";
})(UlicaCisloTyp || (UlicaCisloTyp = {}));
const rodneCisloField = (0, functions_1.input)('rodneCislo', { type: 'text', title: 'Rodné číslo', required: true }, {
    helptextFooter: 'Rodné číslo zadávajte s lomítkom. V prípade, že nemáte rodné číslo, uveďte dátum narodenia v tvare DD.MM.YYYY.',
});
const priezviskoField = (0, functions_1.input)('priezvisko', { type: 'text', title: 'Priezvisko', required: true }, {});
const menoTitulField = (0, functions_1.object)('menoTitul', { required: true }, {
    columns: true,
    columnsRatio: '3/1',
}, [
    (0, functions_1.input)('meno', { type: 'text', title: 'Meno', required: true }, {}),
    (0, functions_1.input)('titul', { type: 'text', title: 'Titul' }, {}),
]);
const ulicaCisloFields = (type) => (0, functions_1.object)(`ulicaCislo${type}`, { required: true }, {
    columns: true,
    columnsRatio: '3/1',
}, [
    (0, functions_1.input)('ulica', { type: 'text', title: 'Ulica', required: true }, {
        helptextFooter: {
            [UlicaCisloTyp.FyzickaOsoba]: 'Zadajte ulicu svojho trvalého pobytu.',
            [UlicaCisloTyp.FyzickaOsobaPodnikatel]: 'Zadajte ulicu miesta podnikania podľa živnostenského registra.',
            [UlicaCisloTyp.PravnickaOsoba]: 'Zadajte ulicu sídla.',
            [UlicaCisloTyp.BezpodieloveSpoluvlastnictvoManzelov]: 'Zadajte ulicu trvalého pobytu manžela/manželky.',
            [UlicaCisloTyp.KorespondencnaAdresa]: undefined,
        }[type],
    }),
    (0, functions_1.input)('cislo', { type: 'text', title: 'Čislo', required: true }, {}),
]);
const obecPscField = (0, functions_1.object)('obecPsc', { required: true }, {
    columns: true,
    columnsRatio: '3/1',
}, [
    (0, functions_1.input)('obec', { type: 'text', title: 'Obec', required: true }, {}),
    (0, functions_1.input)('psc', { type: 'text', title: 'PSČ', required: true }, {}),
]);
const statField = (0, functions_1.select)('stat', {
    title: 'Štát',
    required: true,
    items: esbsCiselniky_1.esbsNationalityCiselnik.map(({ Name, Code }) => ({
        value: Code,
        label: Name,
        isDefault: Code === '703' ? true : undefined,
    })),
}, {});
const emailField = (required = true) => (0, functions_1.input)('email', { title: 'E-mail', type: 'email', required }, { helptextFooter: 'E-mailová adresa nám pomôže komunikovať s vami rýchlejšie.' });
const telefonField = (required = true) => (0, fields_1.sharedPhoneNumberField)('telefon', required, 'Telefónne číslo nám pomôže komunikovať s vami rýchlejšie.');
const icoField = (0, functions_1.input)('ico', { type: 'ba-ico', title: 'IČO', required: true }, {});
const pravnaFormaField = (0, functions_1.select)('pravnaForma', {
    title: 'Právna forma',
    required: true,
    items: [
        {
            value: '111',
            label: '111 Verejná obchodná spoločnosť',
        },
        {
            value: '112',
            label: '112 Spoločnosť s ručením obmedzeným',
        },
        {
            value: '113',
            label: '113 Komanditná spoločnosť',
        },
        {
            value: '117',
            label: '117 Nadácia',
        },
        {
            value: '118',
            label: '118 Neinvestičný fond',
        },
        {
            value: '119',
            label: '119 Nezisková organizácia',
        },
        {
            value: '121',
            label: '121 Akciová spoločnosť',
        },
        {
            value: '205',
            label: '205 Družstvo',
        },
        {
            value: '271',
            label: '271 Spoločenstvá vlastníkov pozemkov, bytov a pod.',
        },
        {
            value: '301',
            label: '301 Štátny podnik',
        },
        {
            value: '311',
            label: '311 Národná banka Slovenska',
        },
        {
            value: '312',
            label: '312 Banka – štátny peňažný ústav',
        },
        {
            value: '321',
            label: '321 Rozpočtová organizácia',
        },
        {
            value: '331',
            label: '331 Príspevková organizácia',
        },
        {
            value: '381',
            label: '381 Fondy',
        },
        {
            value: '382',
            label: '382 Verejnoprávna inštitúcia',
        },
        {
            value: '421',
            label: '421 Zahraničná osoba',
        },
        {
            value: '434',
            label: '434 Doplnková dôchodková poisťovňa',
        },
        {
            value: '445',
            label: '445 Komoditná burza',
        },
        {
            value: '701',
            label: '701 Združenie (zväz, spolok, spoločnosť, klub a iné)',
        },
        {
            value: '711',
            label: '711 Politická strana, politické hnutie',
        },
        {
            value: '721',
            label: '721 Cirkevná organizácia',
        },
        {
            value: '741',
            label: '741 Stavovská organizácia – profesná komora',
        },
        {
            value: '745',
            label: '745 Komora (s vynimkou profesných komôr)',
        },
        {
            value: '751',
            label: '751 Záujmové združenie právnických osôb',
        },
        {
            value: '801',
            label: '801 Obec (obecný úrad)',
        },
        {
            value: '921',
            label: '921 Medzinárodné organizácie a združenia',
        },
        {
            value: '931',
            label: '931 Zastúpenie zahraničnej právnickej osoby',
        },
    ],
}, {});
const obchodneMenoAleboNazovField = (0, functions_1.input)('obchodneMenoAleboNazov', { type: 'text', title: 'Obchodné meno alebo názov', required: true }, {});
const pravnyVztahKPOField = (0, functions_1.select)('pravnyVztahKPO', {
    title: 'Vyberte právny vzťah k právnickej osobe, za ktorú podávate priznanie',
    items: (0, helpers_1.createCamelCaseItems)(['štatutárny zástupca', 'zástupca', 'správca'], false),
    required: true,
}, {});
exports.udajeOOpravnenejOsobeNaPodaniePriznania = (0, functions_1.object)('udajeOOpravnenejOsobeNaPodaniePriznania', { required: true }, {
    objectDisplay: 'boxed',
    title: 'Údaje o oprávnenej osobe na podanie priznania',
}, [
    pravnyVztahKPOField,
    priezviskoField,
    menoTitulField,
    ulicaCisloFields(UlicaCisloTyp.FyzickaOsoba),
    obecPscField,
    statField,
    emailField(),
    telefonField(),
]);
const korespondencnaAdresaField = (0, functions_1.radioGroup)('korespondencnaAdresaRovnaka', {
    type: 'boolean',
    title: 'Je korešpondenčná adresa rovnáká ako adresa trvalého pobytu?',
    required: true,
    items: [
        { value: true, label: 'Áno', isDefault: true },
        { value: false, label: 'Nie' },
    ],
}, {
    variant: 'boxed',
    orientations: 'row',
    labelSize: 'h5',
});
exports.danovnik = [
    (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([
        [['voSvojomMene'], { const: false }],
        [['priznanieAko'], { const: 'pravnickaOsoba' }],
    ]), [pravnyVztahKPOField]),
    (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['priznanieAko'], { const: 'fyzickaOsoba' }]]), [
        rodneCisloField,
        priezviskoField,
        menoTitulField,
        ulicaCisloFields(UlicaCisloTyp.FyzickaOsoba),
    ]),
    (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['priznanieAko'], { enum: ['fyzickaOsobaPodnikatel', 'pravnickaOsoba'] }]]), [icoField]),
    (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['priznanieAko'], { const: 'pravnickaOsoba' }]]), [
        pravnaFormaField,
    ]),
    (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['priznanieAko'], { enum: ['fyzickaOsobaPodnikatel', 'pravnickaOsoba'] }]]), [obchodneMenoAleboNazovField]),
    (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['priznanieAko'], { const: 'fyzickaOsobaPodnikatel' }]]), [
        ulicaCisloFields(UlicaCisloTyp.FyzickaOsobaPodnikatel),
    ]),
    (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['priznanieAko'], { const: 'pravnickaOsoba' }]]), [
        ulicaCisloFields(UlicaCisloTyp.PravnickaOsoba),
    ]),
    obecPscField,
    statField,
    (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([
        [['voSvojomMene'], { const: true }],
        [['priznanieAko'], { const: 'pravnickaOsoba' }],
    ]), [exports.udajeOOpravnenejOsobeNaPodaniePriznania]),
    (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['priznanieAko'], { const: 'fyzickaOsoba' }]]), [
        (0, functions_1.object)('korespondencnaAdresa', { required: true }, { objectDisplay: 'boxed' }, [
            korespondencnaAdresaField,
            (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['korespondencnaAdresaRovnaka'], { const: false }]]), [
                ulicaCisloFields(UlicaCisloTyp.KorespondencnaAdresa),
                obecPscField,
                statField,
            ]),
        ]),
    ]),
    emailField(),
    telefonField(),
];
exports.splnomocnenec = [
    (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['splnomocnenecTyp'], { const: 'fyzickaOsoba' }]]), [
        priezviskoField,
        menoTitulField,
        ulicaCisloFields(UlicaCisloTyp.FyzickaOsoba),
    ]),
    (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['splnomocnenecTyp'], { const: 'pravnickaOsoba' }]]), [
        obchodneMenoAleboNazovField,
        ulicaCisloFields(UlicaCisloTyp.PravnickaOsoba),
    ]),
    obecPscField,
    statField,
    emailField(),
    telefonField(),
];
const rovnakaAdresaField = (0, functions_1.radioGroup)('rovnakaAdresa', {
    type: 'boolean',
    title: 'Má trvalý pobyt na rovnakej adrese ako vy?',
    required: true,
    items: [
        { value: true, label: 'Áno', isDefault: true },
        { value: false, label: 'Nie' },
    ],
}, {
    variant: 'boxed',
    orientations: 'row',
});
exports.bezpodieloveSpoluvlastnictvoManzelov = [
    rodneCisloField,
    priezviskoField,
    menoTitulField,
    rovnakaAdresaField,
    (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['rovnakaAdresa'], { const: false }]]), [
        ulicaCisloFields(UlicaCisloTyp.BezpodieloveSpoluvlastnictvoManzelov),
        obecPscField,
        statField,
    ]),
    emailField(false),
    telefonField(false),
];

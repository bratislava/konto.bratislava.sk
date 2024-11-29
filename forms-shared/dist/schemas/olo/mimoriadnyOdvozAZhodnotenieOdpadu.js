"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mimoriadnyOdvozAZhodnotenieOdpaduExtractName = exports.mimoriadnyOdvozAZhodnotenieOdpaduExtractEmail = void 0;
const functions_1 = require("../../generator/functions");
const fields_1 = require("../shared/fields");
const helpers_1 = require("../../generator/helpers");
const safeData_1 = require("../../form-utils/safeData");
exports.default = (0, functions_1.schema)({
    title: 'Mimoriadny odvoz a zhodnotenie odpadu',
}, {}, [
    (0, functions_1.step)('ziadatel', { title: 'Žiadateľ' }, [
        (0, functions_1.radioGroup)('ziadatelTyp', {
            type: 'string',
            title: 'Žiadam ako',
            required: true,
            items: (0, helpers_1.createStringItems)(['Fyzická osoba', 'Právnická osoba', 'Správcovská spoločnosť']),
        }, { variant: 'boxed', orientations: 'column' }),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['ziadatelTyp'], { const: 'Fyzická osoba' }]]), [
            (0, functions_1.object)('menoPriezvisko', { required: true }, {
                columns: true,
                columnsRatio: '1/1',
            }, [
                (0, functions_1.input)('meno', { title: 'Meno', required: true, type: 'text' }, {}),
                (0, functions_1.input)('priezvisko', { title: 'Priezvisko', required: true, type: 'text' }, {}),
            ]),
            (0, fields_1.sharedAddressField)('adresaObyvatel', 'Adresa trvalého pobytu', true),
        ]),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([
            [['ziadatelTyp'], { enum: ['Právnická osoba', 'Správcovská spoločnosť'] }],
        ]), [
            (0, functions_1.input)('nazov', { type: 'text', title: 'Názov organizácie', required: true }, {}),
            (0, fields_1.sharedAddressField)('adresaPravnickaOsoba', 'Adresa sídla organizácie', true),
            (0, functions_1.input)('ico', { type: 'text', title: 'IČO', required: true }, {}),
            (0, functions_1.input)('dic', { type: 'text', title: 'DIČ', required: true }, {}),
            (0, functions_1.checkbox)('platcaDph', { title: 'Som platca DPH?' }, { checkboxLabel: 'Som platca DPH?', variant: 'boxed' }),
            (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['platcaDph'], { const: true }]]), [
                (0, functions_1.input)('icDph', { type: 'text', title: 'IČ DPH', required: true }, {}),
            ]),
        ]),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['ziadatelTyp'], { const: 'Právnická osoba' }]]), [
            (0, functions_1.input)('konatel', { type: 'text', title: 'Konateľ', required: true }, { helptext: 'Uveďte meno a priezvisko konateľa' }),
            (0, functions_1.input)('zastupeny', {
                type: 'text',
                title: 'Zastúpený - na základe splnomocnenia',
                required: true,
            }, {
                helptext: 'Uveďte meno a priezvisko osoby zastupujúcej na základe splnomocnenia',
            }),
        ]),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([
            [['ziadatelTyp'], { enum: ['Právnická osoba', 'Správcovská spoločnosť'] }],
        ]), [
            (0, functions_1.input)('kontaktnaOsoba', { type: 'text', title: 'Meno kontaktnej osoby', required: true }, {}),
        ]),
        (0, fields_1.sharedPhoneNumberField)('telefon', true),
        (0, functions_1.input)('email', { title: 'E-mail', required: true, type: 'email' }, {}),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([
            [['ziadatelTyp'], { enum: ['Právnická osoba', 'Správcovská spoločnosť'] }],
        ]), [
            (0, functions_1.object)('fakturacia', { required: true }, { objectDisplay: 'boxed', title: 'Fakturácia' }, [
                (0, functions_1.input)('iban', { type: 'ba-iban', title: 'IBAN', required: true }, {}),
                (0, functions_1.checkbox)('elektronickaFaktura', {
                    title: 'Zasielanie faktúry elektronicky',
                }, {
                    helptext: 'V prípade vyjadrenia nesúhlasu bude zákazníkovi za zasielanie faktúry poštou účtovaný poplatok 10 € bez DPH. Osobitné ustanovenia o zasielaní faktúry v elektronickej podobe v zmysle bodu 5.9 VOP.',
                    checkboxLabel: 'Súhlasím so zaslaním elektronickej faktúry',
                    variant: 'boxed',
                }),
                (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['elektronickaFaktura'], { const: true }]]), [
                    (0, functions_1.input)('emailPreFaktury', {
                        type: 'email',
                        title: 'E-mail pre zasielanie elektronických faktúr',
                        required: true,
                    }, {}),
                ]),
            ]),
        ]),
    ]),
    (0, functions_1.step)('sluzba', { title: 'Služba' }, [
        (0, functions_1.arrayField)('infoOOdpade', { title: 'Info o odpade', required: true }, {
            variant: 'topLevel',
            addButtonLabel: 'Pridať ďalší odpad',
            itemTitle: 'Odpad č. {index}',
        }, [
            (0, functions_1.input)('miestoDodania', { type: 'text', title: 'Miesto dodania / výkonu služby', required: true }, { helptext: 'Vyplňte vo formáte ulica a číslo' }),
            (0, functions_1.select)('druhOdpadu', {
                title: 'Vyberte druh odpadu',
                required: true,
                items: (0, helpers_1.createStringItems)([
                    'Zmesový komunálny odpad',
                    'Kuchynský biologicky rozložiteľný odpad',
                    'Jedlé oleje a tuky',
                    'Papier',
                    'Plasty/kovové obaly a nápojové kartóny',
                    'Sklo',
                ]),
            }, {}),
            (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['druhOdpadu'], { const: 'Zmesový komunálny odpad' }]]), [
                (0, functions_1.select)('objemNadobyZmesovyKomunalnyOdpad', {
                    title: 'Vyberte objem nádoby',
                    required: true,
                    items: (0, helpers_1.createStringItems)([
                        '120 l zberná nádoba',
                        '240 l zberná nádoba',
                        '1100 l zberná nádoba',
                        '3000 l polopodzemný kontajner',
                        '5000 l polopodzemný kontajner',
                    ]),
                }, {}),
            ]),
            (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([
                [['druhOdpadu'], { const: 'Kuchynský biologicky rozložiteľný odpad' }],
            ]), [
                (0, functions_1.select)('objemNadobyKuchynskyBiologicky', {
                    title: 'Vyberte objem nádoby',
                    required: true,
                    items: (0, helpers_1.createStringItems)([
                        '23 l zberná nádoba',
                        '120 l zberná nádoba',
                        '240 l zberná nádoba',
                    ]),
                }, {
                    helptext: '23 l zberná nádoba sa poskytuje iba pre odvoz z rodinných domov.',
                }),
            ]),
            (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['druhOdpadu'], { const: 'Jedlé oleje a tuky' }]]), [
                (0, functions_1.select)('objemNadobyJedleOlejeATuky', {
                    title: 'Vyberte objem nádoby',
                    required: true,
                    items: (0, helpers_1.createStringItems)(['120 l zberná nádoba']),
                }, {
                    helptext: 'Služba sa poskytuje iba pre bytové doby a firmy. Pre rodinné domy sú určené nádoby na [zberné hniezda](https://www.olo.sk/zberne-hniezda/).',
                    helptextMarkdown: true,
                }),
            ]),
            (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['druhOdpadu'], { const: 'Papier' }]]), [
                (0, functions_1.select)('objemNadobyPapier', {
                    title: 'Vyberte objem nádoby',
                    required: true,
                    items: (0, helpers_1.createStringItems)([
                        '120 l zberná nádoba',
                        '240 l zberná nádoba',
                        '1100 l zberná nádoba',
                        '3000 l polopodzemný kontajner',
                        '5000 l polopodzemný kontajner',
                    ]),
                }, {}),
            ]),
            (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([
                [['druhOdpadu'], { const: 'Plasty/kovové obaly a nápojové kartóny' }],
            ]), [
                (0, functions_1.select)('objemNadobyPlastyKovoveObaly', {
                    title: 'Vyberte objem nádoby',
                    required: true,
                    items: (0, helpers_1.createStringItems)([
                        '120 l zberná nádoba',
                        '240 l zberná nádoba',
                        '1100 l zberná nádoba',
                        '3000 l polopodzemný kontajner',
                        '5000 l polopodzemný kontajner',
                    ]),
                }, {}),
            ]),
            (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['druhOdpadu'], { const: 'Sklo' }]]), [
                (0, functions_1.select)('objemNadobySklo', {
                    title: 'Vyberte objem nádoby',
                    required: true,
                    items: (0, helpers_1.createStringItems)([
                        '120 l zberná nádoba',
                        '240 l zberná nádoba',
                        '1100 l zberná nádoba',
                        '1800 l zvon na sklo',
                        '3000 l polopodzemný kontajner',
                        '5000 l polopodzemný kontajner',
                    ]),
                }, {}),
            ]),
            (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['druhOdpadu'], { const: 'Biologicky rozložiteľný odpad' }]]), [
                (0, functions_1.select)('objemNadobyBiologickyRozlozitelny', {
                    title: 'Vyberte objem nádoby',
                    required: true,
                    items: (0, helpers_1.createStringItems)(['120 l zberná nádoba', '240 l zberná nádoba']),
                }, {}),
            ]),
        ]),
        (0, functions_1.datePicker)('preferovanyDatum', {
            title: 'Preferovaný dátum vykonania služby',
            required: true,
        }, {
            helptext: 'Vami zvolený dátum má iba informačný charakter. Objednávku je potrebné podať minimálne 2 pracovné dni pred zvoleným termínom. V prípade, ak vami zvolený termín nebude voľný, budeme vás kontaktovať.',
        }),
        (0, functions_1.textArea)('doplnujuceInfo', {
            title: 'Doplňujúce info',
            required: false,
        }, {
            helptext: 'Špecifikujte individuálne požiadavky.',
        }),
    ]),
    (0, functions_1.step)('suhlasy', { title: 'Súhlasy' }, [
        (0, functions_1.checkbox)('suhlasSVop', {
            title: 'Súhlas so Všeobecnými obchodnými podmienkami OLO',
            required: true,
            constValue: true,
        }, {
            checkboxLabel: 'Súhlasím s Všeobecnými obchodnými podmienkami OLO',
            variant: 'boxed',
        }),
        (0, functions_1.customComponentsField)('suhlasSVopLink', {
            type: 'additionalLinks',
            props: {
                links: [
                    {
                        title: 'Všeobecné obchodné podmienky OLO',
                        href: 'https://olo.sk/vseobecne-obchodne-podmienky',
                    },
                ],
            },
        }, {}),
    ]),
]);
const mimoriadnyOdvozAZhodnotenieOdpaduExtractEmail = (formData) => (0, safeData_1.safeString)(formData.ziadatel?.email);
exports.mimoriadnyOdvozAZhodnotenieOdpaduExtractEmail = mimoriadnyOdvozAZhodnotenieOdpaduExtractEmail;
const mimoriadnyOdvozAZhodnotenieOdpaduExtractName = (formData) => {
    if (formData.ziadatel?.ziadatelTyp === 'Fyzická osoba') {
        return (0, safeData_1.safeString)(formData.ziadatel?.menoPriezvisko?.meno);
    }
    if (formData.ziadatel?.ziadatelTyp === 'Právnická osoba' ||
        formData.ziadatel?.ziadatelTyp === 'Správcovská spoločnosť') {
        return (0, safeData_1.safeString)(formData.ziadatel?.nazov);
    }
};
exports.mimoriadnyOdvozAZhodnotenieOdpaduExtractName = mimoriadnyOdvozAZhodnotenieOdpaduExtractName;

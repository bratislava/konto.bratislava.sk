"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.odvozOdpaduVelkokapacitnymAleboLisovacimKontajneromExtractName = exports.odvozOdpaduVelkokapacitnymAleboLisovacimKontajneromExtractEmail = void 0;
const functions_1 = require("../../generator/functions");
const helpers_1 = require("../../generator/helpers");
const fields_1 = require("../shared/fields");
const safeData_1 = require("../../form-utils/safeData");
exports.default = (0, functions_1.schema)({ title: 'Odvoz odpadu veľkokapacitným alebo lisovacím kontajnerom' }, {}, [
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
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['ziadatelTyp'], { enum: ['Právnická osoba', 'Správcovská spoločnosť'] }]]), [
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
            }, { helptext: 'Uveďte meno a priezvisko osoby zastupujúcej na základe splnomocnenia' }),
        ]),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['ziadatelTyp'], { enum: ['Právnická osoba', 'Správcovská spoločnosť'] }]]), [
            (0, functions_1.input)('kontaktnaOsoba', { type: 'text', title: 'Meno kontaktnej osoby', required: true }, {}),
        ]),
        (0, fields_1.sharedPhoneNumberField)('telefon', true),
        (0, functions_1.input)('email', { title: 'E-mail', required: true, type: 'email' }, {}),
        (0, functions_1.object)('fakturacia', { required: true }, { objectDisplay: 'boxed', title: 'Fakturácia' }, [
            (0, functions_1.input)('iban', { type: 'ba-iban', title: 'IBAN', required: true }, {}),
            (0, functions_1.checkbox)('elektronickaFaktura', {
                title: 'Zasielanie faktúry elektronicky',
                required: true,
            }, {
                helptext: 'V prípade vyjadrenia nesúhlasu bude zákazníkovi za zasielanie faktúry poštou účtovaný poplatok 10 € bez DPH. Osobitné ustanovenia o zasielaní faktúry v elektronickej podobe v zmysle bodu 5.9 VOP.',
                checkboxLabel: 'Súhlasím so zaslaním elektronickej fakúry',
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
    (0, functions_1.step)('sluzba', { title: 'Služba' }, [
        (0, functions_1.input)('miestoDodania', { type: 'text', title: 'Miesto dodania / výkonu služby', required: true }, { helptext: 'Vyplňte vo formáte ulica a číslo' }),
        (0, functions_1.select)('druhOdpadu', {
            title: 'Druh odpadu',
            required: true,
            items: (0, helpers_1.createStringItems)(['Objemný', 'Záhradný', 'Iné'], false),
        }, {}),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['druhOdpadu'], { const: 'Iné' }]]), [
            (0, functions_1.textArea)('druhOdpaduIne', {
                title: 'Druh odpadu iné',
                required: true,
            }, {
                placeholder: 'Špecifikujte, prosím, druh odpadu',
            }),
        ]),
        (0, functions_1.select)('objemKontajnera', {
            title: 'Objem kontajnera',
            required: true,
            items: [
                { value: '7m3_3t', label: 'objem: 7 m³ / nosnosť: do 3 t' },
                { value: '10m3_3t', label: 'objem: 10 m³ / nosnosť: do 3 t' },
                { value: '11m3_8t', label: 'objem: 11 m³ / nosnosť: do 8 t' },
                { value: '16m3_8t', label: 'objem: 16 m³ / nosnosť: do 8 t' },
                { value: '27m3_8t', label: 'objem: 27 m³ / nosnosť: do 8 t' },
                { value: '30m3_8t', label: 'objem: 30 m³ / nosnosť: do 8 t' },
            ],
        }, {}),
        (0, functions_1.datePicker)('preferovanyDatumPristavenia', {
            title: 'Preferovaný dátum pristavenia kontajnera',
            required: true,
        }, { size: 'medium' }),
        (0, functions_1.timePicker)('casPristavenia', {
            title: 'Čas pristavenia kontajnera',
            required: true,
        }, {
            helptext: 'V pracovné dni od 7.00 - 12.30',
            size: 'medium',
        }),
        (0, functions_1.datePicker)('datumOdvozu', {
            title: 'Presný dátum odvozu kontajnera',
            required: true,
        }, { size: 'medium' }),
        (0, functions_1.timePicker)('casOdvozu', {
            title: 'Čas odvozu kontajnera',
            required: true,
        }, {
            helptext: 'V pracovné dni od 7.00 - 12.30',
            size: 'medium',
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
const odvozOdpaduVelkokapacitnymAleboLisovacimKontajneromExtractEmail = (formData) => (0, safeData_1.safeString)(formData.ziadatel?.email);
exports.odvozOdpaduVelkokapacitnymAleboLisovacimKontajneromExtractEmail = odvozOdpaduVelkokapacitnymAleboLisovacimKontajneromExtractEmail;
const odvozOdpaduVelkokapacitnymAleboLisovacimKontajneromExtractName = (formData) => {
    if (formData.ziadatel?.ziadatelTyp === 'Fyzická osoba') {
        return (0, safeData_1.safeString)(formData.ziadatel?.menoPriezvisko?.meno);
    }
    if (formData.ziadatel?.ziadatelTyp === 'Právnická osoba' ||
        formData.ziadatel?.ziadatelTyp === 'Správcovská spoločnosť') {
        return (0, safeData_1.safeString)(formData.ziadatel?.nazov);
    }
};
exports.odvozOdpaduVelkokapacitnymAleboLisovacimKontajneromExtractName = odvozOdpaduVelkokapacitnymAleboLisovacimKontajneromExtractName;

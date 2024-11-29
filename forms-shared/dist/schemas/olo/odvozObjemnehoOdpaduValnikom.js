"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.odvozObjemnehoOdpaduValnikomExtractName = exports.odvozObjemnehoOdpaduValnikomExtractEmail = void 0;
const functions_1 = require("../../generator/functions");
const helpers_1 = require("../../generator/helpers");
const fields_1 = require("../shared/fields");
const safeData_1 = require("../../form-utils/safeData");
exports.default = (0, functions_1.schema)({ title: 'Odvoz objemného odpadu valníkom' }, {}, [
    (0, functions_1.step)('ziadatel', { title: 'Žiadateľ' }, [
        (0, functions_1.radioGroup)('ziadatelTyp', {
            type: 'string',
            title: 'Žiadam ako',
            required: true,
            items: (0, helpers_1.createStringItems)(['Právnická osoba', 'Správcovská spoločnosť']),
        }, { variant: 'boxed', orientations: 'column' }),
        (0, functions_1.input)('nazov', { type: 'text', title: 'Názov organizácie', required: true }, {}),
        (0, fields_1.sharedAddressField)('adresaSidla', 'Adresa sídla organizácie', true),
        (0, functions_1.input)('ico', { type: 'text', title: 'IČO', required: true }, {}),
        (0, functions_1.input)('dic', { type: 'text', title: 'DIČ', required: true }, {}),
        (0, functions_1.checkbox)('platcaDph', { title: 'Som platca DPH?' }, { checkboxLabel: 'Som platca DPH', variant: 'boxed' }),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['platcaDph'], { const: true }]]), [
            (0, functions_1.input)('icDph', { type: 'text', title: 'IČ DPH', required: true }, {}),
        ]),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['ziadatelTyp'], { const: 'Právnická osoba' }]]), [
            (0, functions_1.input)('konatel', { type: 'text', title: 'Konateľ', required: true }, { helptext: 'Uveďte meno a priezvisko konateľa' }),
            (0, functions_1.input)('zastupeny', {
                type: 'text',
                title: 'Zastúpený - na základe splnomocnenia',
                required: true,
            }, { helptext: 'Uveďte meno a priezvisko osoby zastupujúcej na základe splnomocnenia' }),
        ]),
        (0, functions_1.input)('kontaktnaOsoba', { type: 'text', title: 'Meno kontaktnej osoby', required: true }, {}),
        (0, fields_1.sharedPhoneNumberField)('telefon', true),
        (0, functions_1.input)('email', { title: 'E-mail', required: true, type: 'email' }, {}),
        (0, functions_1.object)('fakturacia', { required: true }, { objectDisplay: 'boxed', title: 'Fakturácia' }, [
            (0, functions_1.input)('iban', { type: 'ba-iban', title: 'IBAN', required: true }, {}),
            (0, functions_1.checkbox)('elektronickaFaktura', {
                title: 'Súhlasím so zaslaním elektronickej faktúry',
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
    (0, functions_1.step)('sluzba', { title: 'Služba' }, [
        (0, functions_1.input)('miestoDodania', {
            type: 'text',
            title: 'Miesto dodania / výkonu služby',
            required: true,
        }, {
            helptext: 'Vyplňte vo formáte ulica a číslo',
        }),
        (0, functions_1.datePicker)('preferovanyDatumPristavenia', {
            title: 'Preferovaný dátum pristavenia vozidla',
            required: true,
        }, { size: 'medium' }),
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
const odvozObjemnehoOdpaduValnikomExtractEmail = (formData) => (0, safeData_1.safeString)(formData.ziadatel?.email);
exports.odvozObjemnehoOdpaduValnikomExtractEmail = odvozObjemnehoOdpaduValnikomExtractEmail;
const odvozObjemnehoOdpaduValnikomExtractName = (formData) => (0, safeData_1.safeString)(formData.ziadatel?.nazov);
exports.odvozObjemnehoOdpaduValnikomExtractName = odvozObjemnehoOdpaduValnikomExtractName;

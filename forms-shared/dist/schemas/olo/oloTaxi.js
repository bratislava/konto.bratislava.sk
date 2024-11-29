"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oloTaxiExtractName = exports.oloTaxiExtractEmail = void 0;
const functions_1 = require("../../generator/functions");
const fields_1 = require("../shared/fields");
const helpers_1 = require("../../generator/helpers");
const safeData_1 = require("../../form-utils/safeData");
exports.default = (0, functions_1.schema)({
    title: 'OLO Taxi',
}, {}, [
    (0, functions_1.step)('ziadatel', { title: 'Žiadateľ' }, [
        (0, functions_1.radioGroup)('ziadatelTyp', {
            type: 'string',
            title: 'Žiadam ako',
            required: true,
            items: (0, helpers_1.createStringItems)(['Fyzická osoba']),
        }, { variant: 'boxed', orientations: 'column' }),
        (0, functions_1.object)('menoPriezvisko', { required: true }, {
            columns: true,
            columnsRatio: '1/1',
        }, [
            (0, functions_1.input)('meno', { title: 'Meno', required: true, type: 'text' }, {}),
            (0, functions_1.input)('priezvisko', { title: 'Priezvisko', required: true, type: 'text' }, {}),
        ]),
        (0, fields_1.sharedAddressField)('adresaTrvalehoPobytu', 'Adresa trvalého pobytu', true),
        (0, fields_1.sharedPhoneNumberField)('telefon', true),
        (0, functions_1.input)('email', { title: 'E-mail', required: true, type: 'email' }, {}),
    ]),
    (0, functions_1.step)('sluzba', { title: 'Služba' }, [
        (0, functions_1.input)('miestoDodania', {
            type: 'text',
            title: 'Miesto dodania / výkonu služby',
            required: true,
        }, {
            placeholder: 'Zadajte presnú adresu',
            helptext: 'Vyplňte vo formáte ulica a číslo',
        }),
        (0, functions_1.datePicker)('preferovanyDatumOdvozu', {
            title: 'Preferovaný dátum odvozu',
            required: true,
        }, {
            helptext: 'Vami zvolený dátum má iba informačný charakter. Objednávku je potrebné podať minimálne 2 pracovné dni pred zvoleným termínom. V prípade, ak vami zvolený termín nebude voľný, budeme vás kontaktovať.',
        }),
        (0, functions_1.select)('preferovanyCasOdvozu', {
            title: 'Preferovaný čas odvozu',
            required: true,
            items: (0, helpers_1.createStringItems)([
                '07:00 (pondelok - sobota)',
                '09:00 (pondelok - sobota)',
                '11:00 (pondelok - sobota)',
                '13:00 (pondelok - piatok)',
            ], false),
        }, {}),
        (0, functions_1.textArea)('mnozstvoADruhOdpadu', {
            title: 'Množstvo a druh odpadu',
            required: true,
        }, {
            helptext: 'Špecifikujte druh odpadu, uveďte počet kusov alebo množstvo v m³.',
        }),
        (0, functions_1.checkbox)('suhlasSPlatbou', {
            title: 'Vyjadrenie súhlasu s platbou',
            required: true,
            constValue: true,
        }, {
            checkboxLabel: 'Súhlasím s platbou za službu OLO Taxi',
            variant: 'boxed',
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
const oloTaxiExtractEmail = (formData) => (0, safeData_1.safeString)(formData.ziadatel?.email);
exports.oloTaxiExtractEmail = oloTaxiExtractEmail;
const oloTaxiExtractName = (formData) => (0, safeData_1.safeString)(formData.ziadatel?.menoPriezvisko?.meno);
exports.oloTaxiExtractName = oloTaxiExtractName;

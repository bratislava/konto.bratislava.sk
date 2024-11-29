"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.podnetyAPochvalyObcanovExtractName = exports.podnetyAPochvalyObcanovExtractEmail = void 0;
const functions_1 = require("../../generator/functions");
const helpers_1 = require("../../generator/helpers");
const fields_1 = require("../shared/fields");
const safeData_1 = require("../../form-utils/safeData");
exports.default = (0, functions_1.schema)({ title: 'Podnety a pochvaly občanov' }, {}, [
    (0, functions_1.step)('podnet', { title: 'Podať podnet' }, [
        (0, functions_1.radioGroup)('kategoriaPodnetu', {
            type: 'string',
            title: 'Kategória podnetu',
            required: true,
            items: (0, helpers_1.createStringItems)(['Nevykonaný odvoz', 'Pracovníci OLO', 'Poškodená nádoba', 'Pochvala', 'Iné'], false),
        }, {
            variant: 'boxed',
            orientations: 'column',
        }),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['kategoriaPodnetu'], { const: 'Nevykonaný odvoz' }]]), [
            (0, functions_1.datePicker)('terminNevykonaniaOdvozuOdpadu', {
                title: 'Presný termín nevykonania odvozu odpadu',
                required: true,
            }, {}),
            (0, functions_1.checkboxGroup)('druhOdpadu', {
                title: 'Vyberte druh odpadu',
                required: true,
                items: (0, helpers_1.createStringItems)([
                    'Zmesový komunálny odpad',
                    'Kuchynský biologicky rozložiteľný odpad',
                    'Biologicky rozložiteľný odpad',
                    'Jedlé oleje a tuky',
                    'Papier',
                    'Plasty/Kovové obaly a nápojové kartóny',
                    'Sklo',
                ], false),
            }, {
                variant: 'boxed',
                helptext: 'Vyberte aspoň jednu možnosť',
            }),
            (0, functions_1.input)('adresaMiestaOdvozu', {
                type: 'text',
                title: 'Presná adresa miesta odvozu',
                required: true,
            }, {
                helptext: 'Vyplňte vo formáte ulica a číslo',
            }),
        ]),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['kategoriaPodnetu'], { const: 'Pracovníci OLO' }]]), [
            (0, functions_1.datePicker)('datumCasUdalosti', {
                title: 'Dátum a orientačný čas vzniknutej udalosti',
                required: true,
            }, {}),
        ]),
        (0, functions_1.input)('meno', { type: 'text', title: 'Meno', required: true }, {}),
        (0, functions_1.input)('priezvisko', { type: 'text', title: 'Priezvisko', required: true }, {}),
        (0, fields_1.sharedPhoneNumberField)('telefon', true),
        (0, functions_1.input)('email', { title: 'Email', required: true, type: 'email' }, {}),
        (0, functions_1.textArea)('sprava', { title: 'Správa', required: true }, { helptext: 'Napíšte svoje podnety' }),
        (0, functions_1.fileUpload)('prilohy', {
            title: 'Prílohy',
            required: false,
            multiple: true,
        }, {
            type: 'dragAndDrop',
        }),
    ]),
]);
const podnetyAPochvalyObcanovExtractEmail = (formData) => (0, safeData_1.safeString)(formData.podnet?.email);
exports.podnetyAPochvalyObcanovExtractEmail = podnetyAPochvalyObcanovExtractEmail;
const podnetyAPochvalyObcanovExtractName = (formData) => (0, safeData_1.safeString)(formData.podnet?.meno);
exports.podnetyAPochvalyObcanovExtractName = podnetyAPochvalyObcanovExtractName;

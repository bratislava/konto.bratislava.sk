"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vyplnitKrokRadio = void 0;
const functions_1 = require("../../generator/functions");
const helpers_1 = require("../../generator/helpers");
const vyplnitKrokRadio = ({ title, helptext, helptextMarkdown, fields, }) => [
    (0, functions_1.object)('vyplnitObject', {}, {
        objectDisplay: 'boxed',
    }, [
        (0, functions_1.radioGroup)('vyplnit', {
            type: 'boolean',
            title,
            required: true,
            items: [
                { value: true, label: 'Áno' },
                { value: false, label: 'Nie', isDefault: true },
            ],
        }, {
            variant: 'boxed',
            orientations: 'row',
            labelSize: 'h3',
            helptext,
            helptextMarkdown,
        }),
    ]),
    (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['vyplnitObject', 'vyplnit'], { const: true }]]), fields),
];
exports.vyplnitKrokRadio = vyplnitKrokRadio;

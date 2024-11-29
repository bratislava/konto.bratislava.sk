"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("../../generator/functions");
const helpers_1 = require("../../generator/helpers");
const osoby_1 = require("./osoby");
exports.default = (0, functions_1.conditionalStep)('bezpodieloveSpoluvlastnictvoManzelov', 
// This hard to read condition verifies if any of the "priznania" is "bezpodielové spoluvlastníctvo manželov".
{
    anyOf: [
        'danZPozemkov',
        'danZoStaviebJedenUcel',
        'danZoStaviebViacereUcely',
        'danZBytovANebytovychPriestorov',
    ].map((stepKey) => (0, helpers_1.createCondition)([
        [
            [stepKey, 'vyplnitObject', 'vyplnit'],
            {
                const: true,
            },
        ],
        [
            [stepKey, 'array:priznania', 'spoluvlastnictvo'],
            {
                type: 'string',
                enum: ['bezpodieloveSpoluvlastnictvoManzelov'],
            },
        ],
    ])),
}, { title: 'Údaje o manželovi/manželke' }, osoby_1.bezpodieloveSpoluvlastnictvoManzelov);

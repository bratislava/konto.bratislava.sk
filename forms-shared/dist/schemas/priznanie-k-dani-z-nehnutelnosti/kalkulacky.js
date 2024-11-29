"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kalkulackaFields = void 0;
const functions_1 = require("../../generator/functions");
const helpers_1 = require("../../generator/helpers");
const kalkulackaFields = ({ title, checkboxLabel, helptext, inner, }) => [
    (0, functions_1.object)('kalkulackaWrapper', {}, {
        objectDisplay: 'boxed',
    }, [
        (0, functions_1.checkbox)('pouzitKalkulacku', {
            title,
            required: true,
            default: true,
        }, {
            variant: 'basic',
            labelSize: 'h3',
            checkboxLabel,
            helptext,
        }),
    ]),
    (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([
        [
            ['kalkulackaWrapper', 'pouzitKalkulacku'],
            {
                const: true,
            },
        ],
    ]), [inner(true)], [(0, functions_1.skipUiSchema)(inner(false))]),
];
exports.kalkulackaFields = kalkulackaFields;

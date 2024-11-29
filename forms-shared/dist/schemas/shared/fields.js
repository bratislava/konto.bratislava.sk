"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sharedAddressField = exports.sharedPhoneNumberField = void 0;
const functions_1 = require("../../generator/functions");
/**
 * Create phone number input field consitent with all forms.
 */
const sharedPhoneNumberField = (property, required, helptext) => (0, functions_1.input)(property, { type: 'ba-phone-number', title: 'Telefónne číslo', required }, { size: 'medium', placeholder: '+421', helptext });
exports.sharedPhoneNumberField = sharedPhoneNumberField;
/**
 * Create address input fields.
 */
const sharedAddressField = (property, title, required) => (0, functions_1.object)(property, { required }, { objectDisplay: 'boxed', title }, [
    (0, functions_1.input)('ulicaACislo', { title: 'Ulica a číslo', required, type: 'text' }, {}),
    (0, functions_1.object)('mestoPsc', { required: true }, {
        columns: true,
        columnsRatio: '3/1',
    }, [
        (0, functions_1.input)('mesto', { type: 'text', title: 'Mesto', required: true }, {}),
        (0, functions_1.input)('psc', { type: 'ba-slovak-zip', title: 'PSČ', required: true }, {}),
    ]),
]);
exports.sharedAddressField = sharedAddressField;

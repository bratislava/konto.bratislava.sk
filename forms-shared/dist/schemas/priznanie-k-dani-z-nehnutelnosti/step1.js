"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("../../generator/functions");
const helpers_1 = require("../../generator/helpers");
exports.default = (0, functions_1.step)('druhPriznania', { title: 'Druh priznania' }, [
    (0, functions_1.radioGroup)('druh', {
        type: 'string',
        title: 'Vyberte druh priznania',
        required: true,
        items: (0, helpers_1.createCamelCaseItemsV2)([
            {
                label: 'Priznanie',
                description: 'Označte, ak ste sa stali v Bratislave vlastníkom prvej nehnuteľnosti.',
            },
            {
                label: 'Čiastkové priznanie',
                description: 'Označte, ak ste v Bratislave už daňovníkom za inú nehnuteľnosť.',
            },
            {
                label: 'Čiastkové priznanie na zánik daňovej povinnosti.',
                description: 'Označte, ak ste predali/darovali nehnuteľnosť v Bratislave (zaniklo vlastníctvo).',
            },
            {
                label: 'Opravné priznanie',
                description: 'Označte v prípade, ak opravujete údaje v už podanom priznaní v lehote do 31. januára.',
            },
            {
                label: 'Dodatočné priznanie',
                description: 'Označte, ak ste si v minulosti zabudli/neuviedli správne údaje v priznaní k dani z nehnuteľností najneskôr do štyroch rokov od konca roka, v ktorom vznikla povinnosť podať priznanie k dani z nehnuteľností.',
            },
        ]),
    }, { variant: 'boxed', orientations: 'column' }),
    (0, functions_1.number)('rok', {
        type: 'integer',
        title: 'Za aký rok podávate priznanie?',
        required: true,
        minimum: 2000,
        maximum: 2099,
    }, {
        helptextFooter: `Kúpili ste alebo predali nehnuteľnosť v roku :tax-year? Zadajte rok :tax-year-next.`,
        helptextFooterMarkdown: true,
    }),
]);

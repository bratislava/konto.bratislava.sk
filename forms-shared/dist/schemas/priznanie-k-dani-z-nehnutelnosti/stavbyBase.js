"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stavbyBase = void 0;
const functions_1 = require("../../generator/functions");
const helpers_1 = require("../../generator/helpers");
const pravnyVztahSpoluvlastnictvo_1 = require("./pravnyVztahSpoluvlastnictvo");
const stepEnum_1 = require("./stepEnum");
const stavbyBase = (step) => [
    (0, functions_1.input)('cisloListuVlastnictva', { type: 'text', title: 'Číslo listu vlastníctva' }, { size: 'medium', placeholder: 'Napr. 4567' }),
    (0, functions_1.object)('riadok1', { required: true }, {
        columns: true,
        columnsRatio: '3/1',
    }, [
        (0, functions_1.input)('ulicaACisloDomu', { type: 'text', title: 'Ulica a číslo domu', required: true }, {}),
        (0, functions_1.number)('supisneCislo', { title: 'Súpisné číslo', required: true, type: 'integer', minimum: 1 }, {}),
    ]),
    (0, functions_1.object)('riadok2', { required: true }, {
        columns: true,
        columnsRatio: '1/1',
    }, [
        (0, functions_1.select)('kataster', {
            title: 'Názov katastrálneho územia',
            required: true,
            items: (0, helpers_1.createStringItems)([
                'Čunovo',
                'Devín',
                'Devínska Nová Ves',
                'Dúbravka',
                'Jarovce',
                'Karlova Ves',
                'Lamač',
                'Nivy',
                'Nové Mesto',
                'Petržalka',
                'Podunajské Biskupice',
                'Rača',
                'Rusovce',
                'Ružinov',
                'Staré Mesto',
                'Trnávka',
                'Vajnory',
                'Vinohrady',
                'Vrakuňa',
                'Záhorská Bystrica',
            ], false),
        }, {}),
        (0, functions_1.input)('cisloParcely', { type: 'text', title: 'Číslo parcely', required: true }, {
            placeholder: 'Napr. 7986/1',
            helptextFooter: {
                [stepEnum_1.StepEnum.DanZPozemkov]: 'Zadávajte číslo s lomítkom. Nachádza sa na LV ako parcelné číslo. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/3_pozemok_cislo_parcely_d88349308a.png"}',
                [stepEnum_1.StepEnum.DanZoStaviebJedencel]: 'Zadávajte číslo s lomítkom. Nachádza sa na LV ako parcelné číslo. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/4_stavba_cislo_parcely_ec11c9dbb0.png"}',
                [stepEnum_1.StepEnum.DanZoStaviebViacereUcely]: 'Zadávajte číslo s lomítkom. Nachádza sa na LV ako parcelné číslo. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/5_stavba_cislo_parcely_f37ad2e4f7.png"}',
                [stepEnum_1.StepEnum.DanZBytovANebytovychPriestorov]: 'Zadávajte číslo s lomítkom. Nachádza sa na LV ako parcelné číslo. Ak dom stojí na viacerých parcelách, uveďte prvú z nich. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/6_byt_cislo_parcely_a7124f13a3.png"}',
            }[step],
            helptextFooterMarkdown: true,
        }),
    ]),
    ...(0, pravnyVztahSpoluvlastnictvo_1.pravnyVztahSpoluvlastnictvo)(step),
];
exports.stavbyBase = stavbyBase;

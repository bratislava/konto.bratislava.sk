"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pravnyVztahSpoluvlastnictvo = void 0;
const functions_1 = require("../../generator/functions");
const helpers_1 = require("../../generator/helpers");
const stepEnum_1 = require("./stepEnum");
const pravnyVztahSpoluvlastnictvo = (step) => [
    (0, functions_1.radioGroup)('pravnyVztah', {
        type: 'string',
        title: 'Právny vzťah',
        required: true,
        items: (0, helpers_1.createCamelCaseItems)(step === stepEnum_1.StepEnum.DanZBytovANebytovychPriestorov
            ? ['Vlastník', 'Správca']
            : ['Vlastník', 'Správca', 'Nájomca', 'Užívateľ']),
    }, { variant: 'boxed' }),
    (0, functions_1.radioGroup)('spoluvlastnictvo', {
        type: 'string',
        title: 'Spoluvlastníctvo',
        required: true,
        items: (0, helpers_1.createCamelCaseItemsV2)([
            { label: 'Som jediný vlastník' },
            {
                label: 'Podielové spoluvlastníctvo',
                description: 'Nehnuteľnosť vlastníte s ďalšou/ďalšími osobou/osobami (váš podiel na LV je napr. 1/2).',
            },
            {
                label: 'Bezpodielové spoluvlastníctvo manželov',
                description: 'Nehnuteľnosť vlastníte bezpodielovo s manželom/kou (váš podiel na LV je 1/1). Priznanie podáva len jeden z manželov. Údaje o manželovi/manželke zadáte na konci tohto formulára.',
            },
        ]),
    }, { variant: 'boxed' }),
    (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['spoluvlastnictvo'], { const: 'podieloveSpoluvlastnictvo' }]]), [
        (0, functions_1.number)('pocetSpoluvlastnikov', { title: 'Zadajte počet spoluvlastníkov', type: 'integer', minimum: 1, required: true }, {
            size: 'medium',
            helptextFooter: 'Uveďte počet všetkých spoluvlastníkov, vrátane vás (napr. ja + súrodenec = 2).',
        }),
        (0, functions_1.radioGroup)('naZakladeDohody', {
            type: 'boolean',
            title: 'Podávate priznanie za všetkých spoluvlastníkov na základe dohody?',
            required: true,
            items: [
                { value: true, label: 'Áno', isDefault: true },
                { value: false, label: 'Nie' },
            ],
        }, {
            variant: 'boxed',
            orientations: 'row',
        }),
    ]),
    (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([
        [['spoluvlastnictvo'], { const: 'podieloveSpoluvlastnictvo' }],
        [['naZakladeDohody'], { const: true }],
    ]), [
        (0, functions_1.fileUpload)('splnomocnenie', 
        // TODO: Reconsider required when tax form will be sent online.
        {
            title: 'Nahrajte sken dohody o určení zástupcu na podanie priznania k dani z nehnuteľností',
            multiple: true,
        }, {
            type: 'dragAndDrop',
            belowComponents: [
                {
                    type: 'additionalLinks',
                    props: {
                        links: [
                            {
                                title: 'Stiahnite si tlačivo dohody o určení zástupcu',
                                href: 'https://cdn-api.bratislava.sk/strapi-homepage/upload/Dohoda_o_urceni_zastupcu_DZN_56a8433ec7.pdf',
                            },
                        ],
                    },
                },
            ],
            helptextFooter: 'Pri dohode o určení zástupcu sa nevyžadujú úradne osvedčené podpisy spoluvlastníkov.',
        }),
    ]),
];
exports.pravnyVztahSpoluvlastnictvo = pravnyVztahSpoluvlastnictvo;

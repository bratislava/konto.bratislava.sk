"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("../../generator/functions");
const helpers_1 = require("../../generator/helpers");
const osoby_1 = require("./osoby");
exports.default = (0, functions_1.step)('udajeODanovnikovi', { title: 'Údaje o daňovníkovi' }, [
    (0, functions_1.radioGroup)('voSvojomMene', {
        type: 'boolean',
        title: 'Podávate priznanie k dani z nehnuteľností vo svojom mene?',
        required: true,
        items: [
            { value: true, label: 'Áno', isDefault: true },
            {
                value: false,
                label: 'Nie',
                description: 'Označte v prípade, že podávate priznanie k dani z nehnuteľností ako oprávnená osoba na základe napr. plnej moci alebo ako zákonný zástupca.',
            },
        ],
    }, { variant: 'boxed', orientations: 'column' }),
    (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['voSvojomMene'], { const: false }]]), [
        (0, functions_1.object)('opravnenaOsoba', { required: true }, {
            objectDisplay: 'boxed',
            title: 'Údaje o oprávnenej osobe na podanie priznania',
        }, [
            (0, functions_1.fileUpload)('splnomocnenie', 
            // TODO: Reconsider required when tax form will be sent online.
            { title: 'Nahrajte splnomocnenie', multiple: true }, {
                type: 'dragAndDrop',
                helptextFooter: 'Keďže ste v predošlom kroku zvolili, že priznanie nepodávate vo svojom mene, je nutné nahratie skenu plnej moci. Následne, po odoslaní formulára je potrebné doručiť originál plnej moci v listinnej podobe na [oddelenie miestnych daní, poplatkov a licencií](https://bratislava.sk/mesto-bratislava/dane-a-poplatky). Splnomocnenie sa neprikladá v prípade zákonného zástupcu neplnoletej osoby.',
                helptextFooterMarkdown: true,
            }),
            (0, functions_1.radioGroup)('splnomocnenecTyp', {
                type: 'string',
                title: 'Podávate ako oprávnená osoba (splnomocnenec)',
                required: true,
                items: (0, helpers_1.createCamelCaseItemsV2)([
                    { label: 'Fyzická osoba', description: 'Občan SR alebo cudzinec.' },
                    {
                        label: 'Právnicka osoba',
                        description: 'Organizácia osôb alebo majetku vytvorená na určitý účel (napr. podnikanie).',
                    },
                ]),
            }, { variant: 'boxed' }),
            ...osoby_1.splnomocnenec,
        ]),
    ]),
    (0, functions_1.radioGroup)('priznanieAko', {
        type: 'string',
        title: 'Podávate priznanie ako',
        required: true,
        items: (0, helpers_1.createCamelCaseItemsV2)([
            { label: 'Fyzická osoba', description: 'Občan SR alebo cudzinec.' },
            { label: 'Fyzická osoba podnikateľ', description: 'SZČO alebo živnostník.' },
            {
                label: 'Právnicka osoba',
                description: 'Organizácia osôb alebo majetku vytvorená na určitý účel (napr. podnikanie).',
            },
        ]),
    }, { variant: 'boxed' }),
    ...osoby_1.danovnik,
]);

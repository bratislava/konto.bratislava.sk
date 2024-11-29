"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("../../generator/functions");
const helpers_1 = require("../../generator/helpers");
const kalkulacky_1 = require("./kalkulacky");
const stavbyBase_1 = require("./stavbyBase");
const stepEnum_1 = require("./stepEnum");
const vyplnitKrokRadio_1 = require("./vyplnitKrokRadio");
var Typ;
(function (Typ) {
    Typ[Typ["Byt"] = 0] = "Byt";
    Typ[Typ["NebytovyPriestor"] = 1] = "NebytovyPriestor";
})(Typ || (Typ = {}));
const specialCaseCondition = (0, helpers_1.createCondition)([
    [
        ['podielPriestoruNaSpolocnychCastiachAZariadeniachDomu'],
        {
            type: 'string',
            format: 'ba-ratio',
            // The regex itself doesn't validate all the requirements for ratio, but works as an addition to the
            // format: 'ba-ratio' validation to ensure that the denominator is a number starting with 1-9 followed
            // by 3 or more zeroes.
            pattern: '^\\d+\\/([1-9]0{3,})$',
        },
    ],
]);
const vymeraPodlahovejPlochyBytu = (0, functions_1.number)('vymeraPodlahovejPlochyBytu', {
    type: 'integer',
    title: 'Výmera podlahovej plochy bytu (základ dane bytu)',
    required: true,
    minimum: 0,
}, {
    helptextFooter: 'Zadávajte číslo zaokrúhlené nahor (napr. ak 12.3 m^2^, tak zadajte 13).',
    helptextFooterMarkdown: true,
});
const celkovaVymeraSpecialCase = (typ) => (0, functions_1.number)('celkovaVymeraSpecialCase', {
    type: 'number',
    title: typ === Typ.Byt
        ? 'Celková výmera podlahovej plochy vášho bytu'
        : 'Celková výmera podlahovej plochy vášho nebytového priestoru',
    required: true,
    minimum: 0,
}, {
    helptextFooter: 'Ak má číslo za lomkou vo vašom podiele priestoru na spoločných častiach hodnotu, napríklad, 1 000, 10 000, alebo 100 000, údaj z listu vlastníctva vám nepomôže. Správne údaje o podlahovej ploche nájdete v kúpnej zmluve alebo znaleckom posudku (celková podlahová plocha okrem balkónov, lodžií a terás).',
});
const vymeraKalkulacka = (0, functions_1.customComponentsField)('vymeraKalkulacka', {
    type: 'calculator',
    props: {
        variant: 'black',
        calculators: [
            {
                label: 'Základ dane',
                // The special case checks whether the denominator is number starting with 1-9 followed by 3 or more zeroes.
                formula: `denominator = ratioDenominator(podielPriestoruNaSpolocnychCastiachAZariadeniachDomu);
          highestPowerOf10 = pow(10, floor(log10 denominator));
          isSpecialCase = denominator >= 1000 and denominator % highestPowerOf10 == 0;
            ceil ((isSpecialCase ? celkovaVymeraSpecialCase : ratioNumerator(podielPriestoruNaSpolocnychCastiachAZariadeniachDomu) / 100) * evalRatio(spoluvlastnickyPodiel))`,
                missingFieldsMessage: '**Pre výpočet základu dane vyplňte správne všetky polia:**\n' +
                    '- Podiel priestoru na spoločných častiach a zariadeniach domu\n' +
                    '- Spoluvlastnícky podiel',
                unit: 'm^2^',
                unitMarkdown: true,
            },
        ],
    },
}, {});
const podielPriestoruNaSpolocnychCastiachAZariadeniachDomu = (typ) => (0, functions_1.input)('podielPriestoruNaSpolocnychCastiachAZariadeniachDomu', {
    type: 'ba-ratio',
    title: 'Podiel priestoru na spoločných častiach a zariadeniach domu',
    required: true,
}, {
    placeholder: typ === Typ.Byt ? 'Napr. 4827/624441' : 'Napr. 124827/624441',
    helptextFooter: typ === Typ.Byt
        ? 'Zadávajte celý zlomok. Nájdete ho vedľa údajov o vchode, poschodí a čísle bytu. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/6_byt_podiel_priestoru_265f9a3965.png"}'
        : 'Zadávajte celý zlomok. Nájdete ho vedľa údajov o vchode, poschodí a čísle priestoru. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/6_nebytovypriestor_podiel_priestoru_86f78e3c99.png"}',
    helptextFooterMarkdown: true,
});
const spoluvlastnickyPodiel = (typ) => (0, functions_1.input)('spoluvlastnickyPodiel', { type: 'ba-ratio', title: 'Spoluvlastnícky podiel', required: true }, {
    placeholder: 'Napr. 1/150',
    helptextFooter: typ === Typ.Byt
        ? 'Zadávajte celý zlomok. Nájdete ho vedľa údajov o mene vlastníkov. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/6_byt_spoluvlastnicky_podiel_cf4b72f71b.png"}'
        : 'Zadávajte celý zlomok. Nájdete ho vedľa údajov o mene vlastníkov. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/6_nebytovypriestor_spoluvlastnicky_podiel_79034be7a6.png"}',
    helptextFooterMarkdown: true,
});
const vymeraPodlahovychPlochNebytovehoPriestoruVBytovomDome = (0, functions_1.number)('vymeraPodlahovychPlochNebytovehoPriestoruVBytovomDome', {
    type: 'integer',
    title: 'Výmera podlahových plôch nebytového priestoru v bytovom dome',
    required: true,
    minimum: 0,
}, {
    helptextFooter: 'Zadávajte číslo zaokrúhlené nahor na celé číslo (príklad: 48,27 = 49).',
});
const innerArray = (kalkulacka) => (0, functions_1.arrayField)('priznania', { title: 'Priznania k dani z bytov a z nebytových priestorov v bytovom dome', required: true }, {
    hideTitle: true,
    variant: 'topLevel',
    addTitle: 'Podávate priznanie aj za ďalší byt alebo nebytový priestor v inom bytovom dome?',
    addDescription: 'V prípade, že podávate priznanie aj za ďalší byt, alebo iný nebytový priestor, je potrebné pridať ďalšie priznanie.',
    addButtonLabel: 'Pridať ďalšie priznanie',
    itemTitle: 'Priznanie k dani z bytov a z nebytových priestorov v bytovom dome č. {index}',
}, [
    ...(0, stavbyBase_1.stavbyBase)(stepEnum_1.StepEnum.DanZBytovANebytovychPriestorov),
    (0, functions_1.object)('priznanieZaByt', {}, {
        objectDisplay: 'boxed',
    }, [
        (0, functions_1.radioGroup)('priznanieZaByt', {
            type: 'boolean',
            title: 'Podávate priznanie za byt?',
            required: true,
            items: [
                { value: true, label: 'Áno' },
                { value: false, label: 'Nie', isDefault: false },
            ],
        }, {
            variant: 'boxed',
            orientations: 'row',
            labelSize: 'h4',
        }),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['priznanieZaByt'], { const: true }]]), [
            (0, functions_1.input)('cisloBytu', { type: 'text', title: 'Číslo bytu', required: true }, {}),
            (0, functions_1.input)('popisBytu', { type: 'text', title: 'Popis bytu' }, { helptextFooter: 'Stručný popis bytu.', placeholder: 'Napr. dvojizbový byt' }),
            kalkulacka
                ? podielPriestoruNaSpolocnychCastiachAZariadeniachDomu(Typ.Byt)
                : (0, functions_1.skipSchema)(podielPriestoruNaSpolocnychCastiachAZariadeniachDomu(Typ.Byt)),
            (0, functions_1.conditionalFields)(specialCaseCondition, [
                kalkulacka
                    ? celkovaVymeraSpecialCase(Typ.Byt)
                    : (0, functions_1.skipSchema)(celkovaVymeraSpecialCase(Typ.Byt)),
            ]),
            kalkulacka
                ? spoluvlastnickyPodiel(Typ.Byt)
                : (0, functions_1.skipSchema)(spoluvlastnickyPodiel(Typ.Byt)),
            kalkulacka ? vymeraKalkulacka : (0, functions_1.skipSchema)(vymeraKalkulacka),
            kalkulacka ? (0, functions_1.skipSchema)(vymeraPodlahovejPlochyBytu) : vymeraPodlahovejPlochyBytu,
            (0, functions_1.number)('vymeraPodlahovejPlochyNaIneUcely', {
                type: 'integer',
                title: 'Výmera podlahovej plochy bytu používaného na iné účely',
                minimum: 0,
            }, {
                helptextFooter: 'Vyplňte v prípade, ak používate časť bytu napríklad na podnikateľské účely. Zadajte výmeru.',
            }),
            (0, functions_1.object)('datumy', {}, {
                columns: true,
                columnsRatio: '1/1',
            }, [
                (0, functions_1.datePicker)('datumVznikuDanovejPovinnosti', { title: 'Dátum vzniku daňovej povinnosti' }, {
                    helptextFooter: 'Vypĺňate len v prípade, ak ste byt zdedili alebo vydražili (v tom prípade uvediete prvý deň mesiaca nasledujúceho po tom, v ktorom ste nehnuteľnosť nadobudli).',
                }),
                (0, functions_1.datePicker)('datumZanikuDanovejPovinnosti', { title: 'Dátum zániku daňovej povinnosti' }, {
                    helptextFooter: 'Vypĺňate len v prípade, ak ste byt predali alebo darovali (uvediete dátum 31.12.rok predaja/darovania).',
                }),
            ]),
        ]),
    ]),
    (0, functions_1.object)('priznanieZaNebytovyPriestor', {}, {
        objectDisplay: 'boxed',
    }, [
        (0, functions_1.radioGroup)('priznanieZaNebytovyPriestor', {
            type: 'boolean',
            title: 'Podávate priznanie za nebytový priestor (napr. garážové státie, pivnica, obchodný priestor a pod.)?',
            required: true,
            items: [
                { value: true, label: 'Áno' },
                { value: false, label: 'Nie', isDefault: true },
            ],
        }, {
            variant: 'boxed',
            orientations: 'row',
            labelSize: 'h4',
        }),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['priznanieZaNebytovyPriestor'], { const: true }]]), [
            (0, functions_1.arrayField)('nebytovePriestory', { title: 'Nebytové priestory', required: true, maxItems: 15 }, {
                hideTitle: true,
                variant: 'nested',
                addButtonLabel: 'Pridať ďalší nebytový priestor v tom istom bytovom dome',
                itemTitle: 'Nebytový priestor č. {index}',
                cannotAddItemMessage: 'Dosiahli ste maximálny počet nebytových pozemkov (15) na jedno priznanie. Pridajte ďalšie priznanie.',
            }, [
                (0, functions_1.object)('riadok', {}, {
                    columns: true,
                    columnsRatio: '1/1',
                }, [
                    (0, functions_1.input)('ucelVyuzitiaNebytovehoPriestoruVBytovomDome', {
                        type: 'text',
                        title: 'Účel využitia nebytového priestoru v bytovom dome',
                        required: true,
                    }, {
                        helptextFooter: 'Napr. garážovanie, skladovanie, podnikanie alebo iné.',
                    }),
                    (0, functions_1.input)('cisloNebytovehoPriestoruVBytovomDome', {
                        type: 'text',
                        title: 'Číslo nebytového priestoru v bytovom dome',
                        required: true,
                    }, {
                        helptextFooter: 'Napr. číslo parkovacieho státia alebo pivničnej kobky (malo by byť uvedené aj na LV). :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/6_nebytovypriestor_cislo_3d64bba380.png"}',
                        helptextFooterMarkdown: true,
                    }),
                ]),
                kalkulacka
                    ? podielPriestoruNaSpolocnychCastiachAZariadeniachDomu(Typ.NebytovyPriestor)
                    : (0, functions_1.skipSchema)(podielPriestoruNaSpolocnychCastiachAZariadeniachDomu(Typ.NebytovyPriestor)),
                (0, functions_1.conditionalFields)(specialCaseCondition, [
                    kalkulacka
                        ? celkovaVymeraSpecialCase(Typ.NebytovyPriestor)
                        : (0, functions_1.skipSchema)(celkovaVymeraSpecialCase(Typ.NebytovyPriestor)),
                ]),
                kalkulacka
                    ? spoluvlastnickyPodiel(Typ.NebytovyPriestor)
                    : (0, functions_1.skipSchema)(spoluvlastnickyPodiel(Typ.NebytovyPriestor)),
                kalkulacka ? vymeraKalkulacka : (0, functions_1.skipSchema)(vymeraKalkulacka),
                kalkulacka
                    ? (0, functions_1.skipSchema)(vymeraPodlahovychPlochNebytovehoPriestoruVBytovomDome)
                    : vymeraPodlahovychPlochNebytovehoPriestoruVBytovomDome,
                (0, functions_1.object)('datumy', {}, {
                    columns: true,
                    columnsRatio: '1/1',
                }, [
                    (0, functions_1.datePicker)('datumVznikuDanovejPovinnosti', { title: 'Dátum vzniku daňovej povinnosti' }, {
                        helptextFooter: 'Vypĺňate len v prípade, ak ste nebytový priestor zdedili alebo vydražili (v tom prípade uvediete prvý deň mesiaca nasledujúceho po tom, v ktorom ste nehnuteľnosť nadobudli).',
                    }),
                    (0, functions_1.datePicker)('datumZanikuDanovejPovinnosti', { title: 'Dátum zániku daňovej povinnosti' }, {
                        helptextFooter: 'Vypĺňate len v prípade, ak ste nebytový priestor predali alebo darovali (uvediete dátum 31.12.rok predaja/darovania).',
                    }),
                ]),
            ]),
        ]),
    ]),
    (0, functions_1.input)('poznamka', { type: 'text', title: 'Poznámka' }, { placeholder: 'Tu môžete napísať doplnkové informácie' }),
]);
exports.default = (0, functions_1.step)('danZBytovANebytovychPriestorov', {
    title: 'Priznanie k dani z bytov a z nebytových priestorov v bytovom dome',
    stepperTitle: 'Daň z bytov a z nebytových priestorov (v bytovom dome)',
}, (0, vyplnitKrokRadio_1.vyplnitKrokRadio)({
    title: 'Chcete podať daňové priznanie k dani z bytov a z nebytových priestorov v bytovom dome?',
    helptext: `K úspešnému vyplneniu oddielu potrebujete list vlastníctva (LV) k jednotlivým priestorom. Ide o tú časť LV, kde máte nadpis “Byty a nebytové priestory” v časti “ČASŤ B: VLASTNÍCI A INÉ OPRÁVNENÉ OSOBY Z PRÁVA K NEHNUTEĽNOSTI”.\n\nV prípade, že sa vás daň z bytov a z nebytových priestorov netýka, túto časť preskočte.\n\n:form-image-preview[Zobraziť ukážku LV k bytovému domu]{src="https://cdn-api.bratislava.sk/general-strapi/upload/6_priznanie_f168d61548.png"}`,
    helptextMarkdown: true,
    fields: (0, kalkulacky_1.kalkulackaFields)({
        title: 'Kalkulačka výpočtu výmery podlahových plôch bytov a nebytových priestorov',
        helptext: 'Zjednodušili sme pre vás výpočet. Stačí ak zadáte dva údaje z LV a výmery podlahových plôch vypočítame za vás.',
        checkboxLabel: 'Chcem pomôcť s výpočtom a použiť kalkulačku výmery podlahových plôch',
        inner: innerArray,
    }),
}));

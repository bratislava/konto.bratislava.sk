"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnostiExtractName = exports.triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnostiExtractEmail = void 0;
const functions_1 = require("../../generator/functions");
const helpers_1 = require("../../generator/helpers");
const fields_1 = require("../shared/fields");
const safeData_1 = require("../../form-utils/safeData");
const getFakturacia = (novyOdberatel) => (0, functions_1.object)(novyOdberatel ? 'fakturaciaNovehoOdoberatela' : 'fakturacia', { required: true }, { objectDisplay: 'boxed', title: 'Fakturácia' }, [
    (0, functions_1.input)('iban', { type: 'ba-iban', title: novyOdberatel ? 'Nový IBAN' : 'IBAN', required: true }, {}),
    (0, functions_1.checkbox)('elektronickaFaktura', {
        title: 'Súhlasím so zaslaním elektronickej faktúry',
    }, {
        helptext: 'V prípade vyjadrenia nesúhlasu bude zákazníkovi za zasielanie faktúry poštou účtovaný poplatok 10 € bez DPH. Osobitné ustanovenia o zasielaní faktúry v elektronickej podobe v zmysle bodu 5.9 VOP.',
        checkboxLabel: 'Súhlasím so zaslaním elektronickej faktúry',
        variant: 'boxed',
    }),
    (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['elektronickaFaktura'], { const: true }]]), [
        (0, functions_1.input)('emailPreFaktury', {
            type: 'text',
            title: 'E-mail pre zasielanie elektronických faktúr',
            required: true,
        }, {}),
    ]),
]);
exports.default = (0, functions_1.schema)({
    title: 'Triedený zber papiera, plastov a skla pre správcovské spoločnosti',
}, {}, [
    (0, functions_1.step)('ziadatel', { title: 'Žiadateľ' }, [
        (0, functions_1.radioGroup)('typOdberatela', {
            type: 'string',
            title: 'Typ odberateľa',
            required: true,
            items: (0, helpers_1.createStringItemsV2)([
                {
                    label: 'Nový',
                    description: 'Nemám uzavretú zmluvu',
                },
                {
                    label: 'Existujúci',
                    description: 'Mám uzavretú zmluvu',
                },
                {
                    label: 'Zmena odberateľa',
                    description: 'Napr. preberám prevádzku alebo správu nehnuteľnosti',
                },
            ]),
        }, {
            variant: 'boxed',
            orientations: 'column',
        }),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([
            [
                ['typOdberatela'],
                {
                    enum: ['Zmena odberateľa'],
                },
            ],
        ]), [
            (0, functions_1.input)('nazovOrganizaciePovodnehoOdberatela', { type: 'text', title: 'Názov organizácie pôvodného odberateľa', required: true }, {}),
            (0, functions_1.input)('nazovOrganizacieNovehoOdberatela', { type: 'text', title: 'Názov organizácie nového odberateľa', required: true }, {}),
            (0, fields_1.sharedAddressField)('novaAdresaSidla', 'Nová adresa sídla organizácie', true),
        ], [
            (0, functions_1.input)('nazovOrganizacie', { type: 'text', title: 'Názov organizácie', required: true }, {}),
            (0, fields_1.sharedAddressField)('adresaSidla', 'Adresa sídla organizácie', true),
        ]),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['typOdberatela'], { const: 'Existujúci' }]]), [
            (0, functions_1.input)('cisloZmluvy', { type: 'text', title: 'Číslo zmluvy', required: true }, {}),
        ]),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['typOdberatela'], { enum: ['Nový', 'Existujúci'] }]]), [
            (0, functions_1.input)('ico', { type: 'text', title: 'IČO', required: true }, {}),
        ]),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['typOdberatela'], { const: 'Zmena odberateľa' }]]), [
            (0, functions_1.input)('icoPovodnehoOdberatela', { type: 'text', title: 'IČO pôvodného odberateľa', required: true }, {}),
            (0, functions_1.input)('noveIco', { type: 'text', title: 'Nové IČO', required: true }, {}),
            (0, functions_1.input)('dicNovehoOdberatela', { type: 'text', title: 'DIČ nového odberateľa', required: true }, {}),
            (0, functions_1.datePicker)('datumZmeny', { title: 'Dátum zmeny', required: true }, { helptext: 'Uveďte dátum predpokladanej zmeny odberateľa' }),
        ], [(0, functions_1.input)('dic', { type: 'text', title: 'DIČ', required: true }, {})]),
        (0, functions_1.checkbox)('platcaDph', { title: 'Som platca DPH?' }, { checkboxLabel: 'Som platca DPH', variant: 'boxed' }),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['platcaDph'], { const: true }]]), [
            (0, functions_1.input)('icDph', { type: 'text', title: 'IČ DPH', required: true }, {}),
        ]),
        (0, functions_1.input)('menoKontaktnejOsoby', { type: 'text', title: 'Meno kontaktnej osoby', required: true }, {}),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['typOdberatela'], { const: 'Zmena odberateľa' }]]), [
            (0, functions_1.input)('noveTelefonneCislo', { type: 'ba-phone-number', title: 'Nové telefónne číslo', required: true }, { size: 'medium', placeholder: '+421' }),
            (0, functions_1.input)('novyEmail', { title: 'Nový email', required: true, type: 'email' }, {}),
        ], [
            (0, fields_1.sharedPhoneNumberField)('telefon', true),
            (0, functions_1.input)('email', { title: 'Email', required: true, type: 'email' }, {}),
        ]),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['typOdberatela'], { enum: ['Zmena odberateľa'] }]]), [getFakturacia(true)], [getFakturacia(false)]),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['typOdberatela'], { enum: ['Zmena odberateľa'] }]]), [
            (0, functions_1.radioGroup)('zmenyVPocteNadob', {
                type: 'boolean',
                title: 'Chcem vykonať zmeny v počte nádob alebo ohľadom frekvencie odvozu',
                required: true,
                items: [
                    { value: true, label: 'Áno' },
                    { value: false, label: 'Nie' },
                ],
            }, { variant: 'boxed', orientations: 'row' }),
        ]),
    ]),
    (0, functions_1.step)('sluzba', { title: 'Služba' }, [
        (0, functions_1.arrayField)('infoOOdpade', { title: 'Info o odpade', required: true }, {
            variant: 'topLevel',
            addButtonLabel: 'Pridať ďalší odpad',
            itemTitle: 'Odpad {index}',
        }, [
            (0, functions_1.input)('miestoDodania', { type: 'text', title: 'Miesto dodania / výkonu služby', required: true }, { helptext: 'Vyplňte vo formáte ulica a číslo' }),
            (0, functions_1.select)('druhOdpadu', {
                title: 'Vyberte druh odpadu',
                required: true,
                items: (0, helpers_1.createStringItems)([
                    'Papier (Pravidelný odvoz vytriedených zložiek komunálneho odpadu kat. číslo 20)',
                    'Plasty (Pravidelný odvoz vytriedených zložiek komunálneho odpadu kat. číslo 20)',
                    'Sklo (Pravidelný odvoz vytriedených zložiek komunálneho odpadu kat. číslo 20)',
                ]),
            }, {
                helptext: 'Vyberte len 1 komoditu. Správcovia nehnuteľností v prípade Kuchynského biologicky rozložiteľného odpadu riešia zapojenie a zmeny v systéme zapojenia na Magistráte hlavného mesta. **Zmesový komunálny odpad sa rieši na** [Magistráte hlavného mesta](https://bratislava.sk/mesto-bratislava/dane-a-poplatky/poplatok-za-komunalne-odpady-a-drobne-stavebne-odpady).',
                helptextMarkdown: true,
            }),
            (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([
                [
                    ['druhOdpadu'],
                    {
                        enum: [
                            'Papier (Pravidelný odvoz vytriedených zložiek komunálneho odpadu kat. číslo 20)',
                            'Plasty (Pravidelný odvoz vytriedených zložiek komunálneho odpadu kat. číslo 20)',
                        ],
                    },
                ],
            ]), [
                (0, functions_1.select)('objemNadobyPapierPlasty', {
                    title: 'Vyberte objem nádoby',
                    required: true,
                    items: (0, helpers_1.createStringItems)([
                        '120 l zberná nádoba',
                        '240 l zberná nádoba',
                        '1100 l zberná nádoba',
                        '3000 l polopodzemný kontajner',
                        '5000 l polopodzemný kontajner',
                    ]),
                }, {}),
                (0, functions_1.select)('frekvenciaOdvozovPapierPlasty', {
                    title: 'Frekvencia odvozov',
                    required: true,
                    items: (0, helpers_1.createStringItems)(['1 x do týždňa', '2 x do týždňa']),
                }, {}),
            ]),
            (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([
                [
                    ['druhOdpadu'],
                    {
                        const: 'Sklo (Pravidelný odvoz vytriedených zložiek komunálneho odpadu kat. číslo 20)',
                    },
                ],
            ]), [
                (0, functions_1.select)('objemNadobySklo', {
                    title: 'Vyberte objem nádoby',
                    required: true,
                    items: (0, helpers_1.createStringItems)([
                        '120 l zberná nádoba',
                        '240 l zberná nádoba',
                        '1800 l zvon na sklo',
                        '3000 l polopodzemný kontajner',
                    ]),
                }, {}),
                (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([
                    [['objemNadobySklo'], { enum: ['120 l zberná nádoba', '240 l zberná nádoba'] }],
                ]), [
                    (0, functions_1.select)('frekvenciaOdvozovSklo1', {
                        title: 'Frekvencia odvozov',
                        required: true,
                        items: (0, helpers_1.createStringItems)(['1 x do týždňa']),
                    }, {}),
                ]),
                (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['objemNadobySklo'], { const: '1800 l zvon na sklo' }]]), [
                    (0, functions_1.select)('frekvenciaOdvozovSklo2', {
                        title: 'Frekvencia odvozov',
                        required: true,
                        items: [{ value: '1x_za_4_tyzdne', label: '1 x za 4 týždne' }],
                    }, {}),
                ]),
            ]),
            (0, functions_1.number)('pocetNadob', { type: 'number', title: 'Počet nádob', required: true }, { helptext: 'Uveďte počet nádob' }),
        ]),
        (0, functions_1.input)('emailPotvrdenie', { type: 'email', title: 'E-mail (potvrdenie o prevzatí odpadov/obalov)', required: true }, {}),
    ]),
    (0, functions_1.step)('suhlasy', { title: 'Súhlasy' }, [
        (0, functions_1.checkbox)('suhlasSVop', {
            title: 'Súhlas so Všeobecnými obchodnými podmienkami OLO',
            required: true,
            constValue: true,
        }, {
            checkboxLabel: 'Súhlasím s Všeobecnými obchodnými podmienkami OLO',
            variant: 'boxed',
        }),
        (0, functions_1.customComponentsField)('suhlasSVopLink', {
            type: 'additionalLinks',
            props: {
                links: [
                    {
                        title: 'Všeobecné obchodné podmienky OLO',
                        href: 'https://olo.sk/vseobecne-obchodne-podmienky',
                    },
                ],
            },
        }, {}),
    ]),
]);
const triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnostiExtractEmail = (formData) => {
    if (formData.ziadatel?.typOdberatela === 'Zmena odberateľa') {
        return (0, safeData_1.safeString)(formData.ziadatel?.novyEmail);
    }
    return (0, safeData_1.safeString)(formData.ziadatel?.email);
};
exports.triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnostiExtractEmail = triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnostiExtractEmail;
const triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnostiExtractName = (formData) => {
    if (formData.ziadatel?.typOdberatela === 'Zmena odberateľa') {
        return (0, safeData_1.safeString)(formData.ziadatel?.nazovOrganizacieNovehoOdberatela);
    }
    return (0, safeData_1.safeString)(formData.ziadatel?.nazovOrganizacie);
};
exports.triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnostiExtractName = triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnostiExtractName;

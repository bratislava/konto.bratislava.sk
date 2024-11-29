"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("../generator/functions");
const helpers_1 = require("../generator/helpers");
const fields_1 = require("./shared/fields");
const umiestnenieADizajn = [
    (0, functions_1.fileUpload)('umiestnenie', {
        title: 'Presné umiestnenie záhrady na pozemku',
        required: true,
    }, {
        type: 'dragAndDrop',
        helptext: 'Využiť môžete [katastrálnu mapu ZBGIS](https://zbgis.skgeodesy.sk/mkzbgis/sk/kataster?pos=48.155530,17.129713,13), kde nájdete pozemok. Na snímke obrazovky vyznačte presné umiestnenie záhrady (ohraničenie). Zakreslenie presného umiestnenia záhrady na pozemku urýchli celý proces - mesto bude vedieť o ktorú časť pozemku máte konkrétne záujem.',
        helptextMarkdown: true,
    }),
    (0, functions_1.fileUpload)('dizajn', {
        title: 'Dizajn/projekt záhrady',
        required: true,
    }, {
        type: 'dragAndDrop',
        helptext: 'Situácia záhrady spracovaná v adekvátnej mierke, ktorá ilustruje plánované využitie a umiestnenie jednotlivých prvkov na záhrade.\n\n Napríklad, záhony či pestovacie boxy, výsadbu akejkoľvek trvalkovej zelene, kríkov a stromov spolu s druhovým špecifikovaním tejto zelene, kompost, mobiliár, priestor na uskladnenie náradia a zariadenia záhrady, priestor pre využívanie grilu, spôsob zabezpečenia vody a jej distribúcie.',
        helptextMarkdown: true,
    }),
];
exports.default = (0, functions_1.schema)({
    title: 'Komunitné záhrady',
}, {}, [
    (0, functions_1.step)('ziadatel', { title: 'Žiadateľ' }, [
        (0, functions_1.object)('menoPriezvisko', { required: true }, {
            columns: true,
            columnsRatio: '1/1',
        }, [
            (0, functions_1.input)('meno', { title: 'Meno', required: true, type: 'text' }, {}),
            (0, functions_1.input)('priezvisko', { title: 'Priezvisko', required: true, type: 'text' }, {}),
        ]),
        (0, fields_1.sharedAddressField)('adresa', 'Adresa trvalého pobytu', true),
        (0, functions_1.input)('email', { title: 'E-mail', required: true, type: 'email' }, {}),
        (0, fields_1.sharedPhoneNumberField)('telefon', true),
    ]),
    (0, functions_1.step)('obcianskeZdruzenie', { title: 'Občianske združenie' }, [
        (0, functions_1.input)('nazovObcianskehoZdruzenia', { title: 'Názov občianskeho združenia', required: true, type: 'text' }, {}),
        (0, functions_1.input)('ico', { title: 'IČO', required: true, type: 'text' }, { size: 'medium' }),
        (0, fields_1.sharedAddressField)('adresaSidla', 'Adresa sídla', true),
        (0, functions_1.object)('statutar', { required: true }, {
            title: 'Štatutár',
            columns: true,
            columnsRatio: '1/1',
        }, [
            (0, functions_1.input)('menoStatutara', { title: 'Meno', required: true, type: 'text' }, {}),
            (0, functions_1.input)('priezviskoStatutara', { title: 'Priezvisko', required: true, type: 'text' }, {}),
        ]),
    ]),
    (0, functions_1.step)('pozemok', {
        title: 'Pozemok',
        description: 'Odporúčame vám výber jedného z predschválených mestských pozemkov, vďaka čomu vieme žiadosť vybaviť rýchlejšie.',
    }, [
        (0, functions_1.radioGroup)('typPozemku', {
            type: 'string',
            title: 'O aký pozemok máte záujem?',
            required: true,
            items: [
                {
                    value: 'predschvalenyPozemok',
                    label: 'Predschválený mestský pozemok',
                    isDefault: true,
                },
                { value: 'inyPozemok', label: 'Iný mestský pozemok' },
            ],
        }, {
            variant: 'boxed',
            orientations: 'column',
        }),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['typPozemku'], { const: 'predschvalenyPozemok' }]]), [
            (0, functions_1.select)('predschvalenyPozemokVyber', {
                title: 'Ponuka predschválených mestských pozemkov',
                required: true,
                items: (0, helpers_1.createStringItems)([
                    'Azalková',
                    'Budatínska A',
                    'Budatínska B',
                    'Haburská A',
                    'Haburská B',
                    'Líščie údolie',
                    'Machová',
                    'Medzijárky',
                    'Nejedlého',
                    'Pri Kríži',
                    'Staré záhrady',
                    'Štefunkova',
                    'Tokajícka',
                    'Vyšehradská',
                ], false),
            }, {
                helptext: 'Pre zaistenie kvalitného verejného priestoru sme na niektorých mestských pozemkoch zaviedli zopár [podmienok](https://bratislava.sk/zivotne-prostredie-a-vystavba/zelen/udrzba-a-tvorba-zelene/komunitne-zahrady) pre vznik komunitnej záhrady.',
                helptextMarkdown: true,
            }),
        ]),
        (0, functions_1.conditionalFields)((0, helpers_1.createCondition)([[['typPozemku'], { const: 'inyPozemok' }]]), [
            (0, functions_1.input)('adresaPozemku', {
                title: 'Adresa komunitnej záhrady (ulica, číslo)',
                type: 'text',
                required: true,
            }, {}),
            (0, functions_1.select)('mestskaCast', {
                title: 'Mestská časť, v ktorej sa pozemok nachádza',
                required: true,
                items: (0, helpers_1.createStringItems)([
                    'Čunovo',
                    'Devín',
                    'Devínska Nová Ves',
                    'Dúbravka',
                    'Jarovce',
                    'Karlova Ves',
                    'Lamač',
                    'Nové Mesto',
                    'Petržalka',
                    'Podunajské Biskupice',
                    'Rača',
                    'Rusovce',
                    'Ružinov',
                    'Staré Mesto',
                    'Vajnory',
                    'Vrakuňa',
                    'Záhorská Bystrica',
                ], false),
            }, { placeholder: 'Vyberte' }),
            (0, functions_1.input)('parcelneCislo', {
                title: 'Číslo parcely',
                type: 'text',
                required: true,
            }, {
                size: 'medium',
                helptext: 'Číslo parcely a bližšie informácie k pozemku a jeho vlastníkom nájdete na [katastrálnej mape ZBGIS](https://zbgis.skgeodesy.sk/mkzbgis/sk/kataster?pos=48.155530,17.129713,13).',
                helptextMarkdown: true,
            }),
        ]),
    ]),
    (0, functions_1.step)('zahrada', {
        title: 'Záhrada',
    }, [
        (0, functions_1.textArea)('dovodyZalozenia', {
            title: 'Dôvody založenia komunitnej záhrady na danom pozemku',
            required: true,
        }, {
            placeholder: 'Popíšte',
            helptext: 'Vysvetlite, prečo považujete za vhodné zabrať daný verejný priestor a vytvoriť na ňom záhradu s menej verejným režimom (predpokladáme, že záhrady sú oplotené a poloverejné). Argumentmi môže byť doterajšie nevyužívanie alebo nevhodné využívanie priestoru, napríklad, nelegálne parkovisko na zeleni, zeleň bez udržiavaných sadových úprav, neprístupný/nevyužívaný priestor.',
            helptextMarkdown: true,
        }),
        (0, functions_1.textArea)('suhlasKomunity', { title: 'Súhlas miestnej komunity', required: true }, {
            placeholder: 'Popíšte',
            helptext: 'Dôležitý aspekt legitimity je zapojenie okolitej komunity – organizačný tím by mal získať súhlas miestnych obyvateľov a obyvateliek, ktorí priestor v súčasnosti využívajú.',
        }),
        (0, functions_1.textArea)('organizacnyTim', {
            title: 'Organizačný tím záhrady',
            required: true,
        }, { placeholder: 'Popíšte' }),
        (0, functions_1.textArea)('prevadzka', {
            title: 'Prevádzka a údržba záhrady',
            required: true,
        }, {
            placeholder: 'Popíšte',
            helptext: 'Kto a akým spôsobom bude zabezpečovať prevádzku záhrady z hľadiska údržby zelene (napríklad kosenie) a starostlivosti o poriadok? Ako bude zabezpečený odpad? Ideálne je, napríklad, zaviazať sa ku zero-waste režimu a každý, kto vytvorí odpad bude zodpovedný za jeho likvidáciu.',
        }),
        (0, functions_1.textArea)('inkluzivnost', {
            title: 'Inkluzívnosť projektu a režim komunitnej záhrady',
            required: true,
        }, {
            placeholder: 'Popíšte',
            helptext: 'Ako zabezpečíte otvorenosť projektu, kto bude mať priamy či nepriamy úžitok z projektu, ako vyberiete, kto bude záhradkár? Ako sa vysporiadate so situáciou, ak budete mať väčší záujem o záhradkárčenie, než budete mať kapacitu nasýtiť?',
        }),
        (0, functions_1.textArea)('financovanie', {
            title: 'Spôsob financovania záhrady',
            required: true,
        }, {
            placeholder: 'Popíšte',
            helptext: 'Aké budete mať členské poplatky? Využijete na tvorbu záhrady granty? Aké zdroje už máte a aké plánujete získať? V prípade, že už máte (predbežný) rozpočet, nahrajte ho do poľa nižšie.',
        }),
    ]),
    (0, functions_1.conditionalStep)('prilohyPredschvalenyPozemok', {
        type: 'object',
        properties: {
            pozemok: {
                type: 'object',
                properties: {
                    typPozemku: {
                        not: {
                            const: 'inyPozemok',
                        },
                    },
                },
                required: [],
            },
        },
        required: [],
    }, { title: 'Prílohy', customHash: 'prilohy-predschvaleny-pozemok' }, [
        ...umiestnenieADizajn,
        (0, functions_1.fileUpload)('fotografie', {
            title: 'Fotografie miesta, na ktorom si chcete vytvoriť komunitnú záhradu',
        }, { type: 'dragAndDrop' }),
        (0, functions_1.fileUpload)('ine', { title: 'Iné' }, { type: 'dragAndDrop' }),
    ]),
    (0, functions_1.conditionalStep)('prilohyInyPozemok', (0, helpers_1.createCondition)([[['pozemok', 'typPozemku'], { not: { const: 'predschvalenyPozemok' } }]]), { title: 'Prílohy', customHash: 'prilohy-iny-pozemok' }, [
        (0, functions_1.fileUpload)('fotografie', {
            title: 'Fotografie miesta, na ktorom si chcete vytvoriť komunitnú záhradu',
            required: true,
        }, {
            type: 'dragAndDrop',
            helptext: 'Zakreslenie presného umiestnenia záhrady na pozemku urýchli celý proces - mesto bude vedieť o ktorú časť pozemku máte konkrétne záujem.',
        }),
        ...umiestnenieADizajn,
        (0, functions_1.fileUpload)('ine', { title: 'Iné' }, { type: 'dragAndDrop' }),
    ]),
]);

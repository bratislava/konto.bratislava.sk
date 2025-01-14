import { createCondition, createStringItems } from '../generator/helpers'
import { sharedAddressField, sharedPhoneNumberField } from './shared/fields'
import { select } from '../generator/functions/select'
import { input } from '../generator/functions/input'
import { radioGroup } from '../generator/functions/radioGroup'
import { textArea } from '../generator/functions/textArea'
import { fileUpload } from '../generator/functions/fileUpload'
import { object } from '../generator/object'
import { step } from '../generator/functions/step'
import { conditionalStep } from '../generator/functions/conditionalStep'
import { conditionalFields } from '../generator/functions/conditionalFields'
import { schema } from '../generator/functions/schema'

const umiestnenieADizajn = [
  fileUpload(
    'umiestnenie',
    {
      title: 'Presné umiestnenie záhrady na pozemku',
      required: true,
    },
    {
      type: 'dragAndDrop',
      helptext:
        'Využiť môžete [katastrálnu mapu ZBGIS](https://zbgis.skgeodesy.sk/mkzbgis/sk/kataster?pos=48.155530,17.129713,13), kde nájdete pozemok. Na snímke obrazovky vyznačte presné umiestnenie záhrady (ohraničenie). Zakreslenie presného umiestnenia záhrady na pozemku urýchli celý proces - mesto bude vedieť o ktorú časť pozemku máte konkrétne záujem.',
      helptextMarkdown: true,
    },
  ),
  fileUpload(
    'dizajn',
    {
      title: 'Dizajn/projekt záhrady',
      required: true,
    },
    {
      type: 'dragAndDrop',
      helptext:
        'Situácia záhrady spracovaná v adekvátnej mierke, ktorá ilustruje plánované využitie a umiestnenie jednotlivých prvkov na záhrade.\n\n Napríklad, záhony či pestovacie boxy, výsadbu akejkoľvek trvalkovej zelene, kríkov a stromov spolu s druhovým špecifikovaním tejto zelene, kompost, mobiliár, priestor na uskladnenie náradia a zariadenia záhrady, priestor pre využívanie grilu, spôsob zabezpečenia vody a jej distribúcie.',
      helptextMarkdown: true,
    },
  ),
]

export default schema(
  {
    title: 'Komunitné záhrady',
  },
  {},
  [
    step('ziadatel', { title: 'Žiadateľ' }, [
      object('menoPriezvisko', { required: true }, {}, [
        input('meno', { title: 'Meno', required: true, type: 'text' }, { selfColumn: '2/4' }),
        input(
          'priezvisko',
          { title: 'Priezvisko', required: true, type: 'text' },
          { selfColumn: '2/4' },
        ),
      ]),
      sharedAddressField('adresa', 'Adresa trvalého pobytu', true),
      input('email', { title: 'E-mail', required: true, type: 'email' }, {}),
      sharedPhoneNumberField('telefon', true),
    ]),

    step('obcianskeZdruzenie', { title: 'Občianske združenie' }, [
      input(
        'nazovObcianskehoZdruzenia',
        { title: 'Názov občianskeho združenia', required: true, type: 'text' },
        {},
      ),
      input('ico', { title: 'IČO', required: true, type: 'text' }, { size: 'medium' }),
      sharedAddressField('adresaSidla', 'Adresa sídla', true),
      object(
        'statutar',
        { required: true },
        {
          title: 'Štatutár',
        },
        [
          input(
            'menoStatutara',
            { title: 'Meno', required: true, type: 'text' },
            { selfColumn: '2/4' },
          ),
          input(
            'priezviskoStatutara',
            { title: 'Priezvisko', required: true, type: 'text' },
            { selfColumn: '2/4' },
          ),
        ],
      ),
    ]),

    step(
      'pozemok',
      {
        title: 'Pozemok',
        description:
          'Odporúčame vám výber jedného z predschválených mestských pozemkov, vďaka čomu vieme žiadosť vybaviť rýchlejšie.',
      },
      [
        radioGroup(
          'typPozemku',
          {
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
          },
          {
            variant: 'boxed',
            orientations: 'column',
          },
        ),
        conditionalFields(createCondition([[['typPozemku'], { const: 'predschvalenyPozemok' }]]), [
          select(
            'predschvalenyPozemokVyber',
            {
              title: 'Ponuka predschválených mestských pozemkov',
              required: true,
              items: createStringItems(
                [
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
                ],
                false,
              ),
            },
            {
              helptext:
                'Pre zaistenie kvalitného verejného priestoru sme na niektorých mestských pozemkoch zaviedli zopár [podmienok](https://bratislava.sk/zivotne-prostredie-a-vystavba/zelen/udrzba-a-tvorba-zelene/komunitne-zahrady) pre vznik komunitnej záhrady.',
              helptextMarkdown: true,
            },
          ),
        ]),
        conditionalFields(createCondition([[['typPozemku'], { const: 'inyPozemok' }]]), [
          input(
            'adresaPozemku',
            {
              title: 'Adresa komunitnej záhrady (ulica, číslo)',
              type: 'text',
              required: true,
            },
            {},
          ),
          select(
            'mestskaCast',
            {
              title: 'Mestská časť, v ktorej sa pozemok nachádza',
              required: true,
              items: createStringItems(
                [
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
                ],
                false,
              ),
            },
            { placeholder: 'Vyberte' },
          ),
          input(
            'parcelneCislo',
            {
              title: 'Číslo parcely',
              type: 'text',
              required: true,
            },
            {
              size: 'medium',
              helptext:
                'Číslo parcely a bližšie informácie k pozemku a jeho vlastníkom nájdete na [katastrálnej mape ZBGIS](https://zbgis.skgeodesy.sk/mkzbgis/sk/kataster?pos=48.155530,17.129713,13).',

              helptextMarkdown: true,
            },
          ),
        ]),
      ],
    ),
    step(
      'zahrada',
      {
        title: 'Záhrada',
      },
      [
        textArea(
          'dovodyZalozenia',
          {
            title: 'Dôvody založenia komunitnej záhrady na danom pozemku',
            required: true,
          },
          {
            placeholder: 'Popíšte',
            helptext:
              'Vysvetlite, prečo považujete za vhodné zabrať daný verejný priestor a vytvoriť na ňom záhradu s menej verejným režimom (predpokladáme, že záhrady sú oplotené a poloverejné). Argumentmi môže byť doterajšie nevyužívanie alebo nevhodné využívanie priestoru, napríklad, nelegálne parkovisko na zeleni, zeleň bez udržiavaných sadových úprav, neprístupný/nevyužívaný priestor.',
            helptextMarkdown: true,
          },
        ),
        textArea(
          'suhlasKomunity',
          { title: 'Súhlas miestnej komunity', required: true },
          {
            placeholder: 'Popíšte',
            helptext:
              'Dôležitý aspekt legitimity je zapojenie okolitej komunity – organizačný tím by mal získať súhlas miestnych obyvateľov a obyvateliek, ktorí priestor v súčasnosti využívajú.',
          },
        ),
        textArea(
          'organizacnyTim',
          {
            title: 'Organizačný tím záhrady',
            required: true,
          },
          { placeholder: 'Popíšte' },
        ),
        textArea(
          'prevadzka',
          {
            title: 'Prevádzka a údržba záhrady',
            required: true,
          },
          {
            placeholder: 'Popíšte',
            helptext:
              'Kto a akým spôsobom bude zabezpečovať prevádzku záhrady z hľadiska údržby zelene (napríklad kosenie) a starostlivosti o poriadok? Ako bude zabezpečený odpad? Ideálne je, napríklad, zaviazať sa ku zero-waste režimu a každý, kto vytvorí odpad bude zodpovedný za jeho likvidáciu.',
          },
        ),
        textArea(
          'inkluzivnost',
          {
            title: 'Inkluzívnosť projektu a režim komunitnej záhrady',
            required: true,
          },
          {
            placeholder: 'Popíšte',
            helptext:
              'Ako zabezpečíte otvorenosť projektu, kto bude mať priamy či nepriamy úžitok z projektu, ako vyberiete, kto bude záhradkár? Ako sa vysporiadate so situáciou, ak budete mať väčší záujem o záhradkárčenie, než budete mať kapacitu nasýtiť?',
          },
        ),
        textArea(
          'financovanie',
          {
            title: 'Spôsob financovania záhrady',
            required: true,
          },
          {
            placeholder: 'Popíšte',
            helptext:
              'Aké budete mať členské poplatky? Využijete na tvorbu záhrady granty? Aké zdroje už máte a aké plánujete získať? V prípade, že už máte (predbežný) rozpočet, nahrajte ho do poľa nižšie.',
          },
        ),
      ],
    ),
    conditionalStep(
      'prilohyPredschvalenyPozemok',
      {
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
      },
      { title: 'Prílohy', customHash: 'prilohy-predschvaleny-pozemok' },
      [
        ...umiestnenieADizajn,
        fileUpload(
          'fotografie',
          {
            title: 'Fotografie miesta, na ktorom si chcete vytvoriť komunitnú záhradu',
          },
          { type: 'dragAndDrop' },
        ),
        fileUpload('ine', { title: 'Iné' }, { type: 'dragAndDrop' }),
      ],
    ),
    conditionalStep(
      'prilohyInyPozemok',
      createCondition([[['pozemok', 'typPozemku'], { not: { const: 'predschvalenyPozemok' } }]]),
      { title: 'Prílohy', customHash: 'prilohy-iny-pozemok' },
      [
        fileUpload(
          'fotografie',
          {
            title: 'Fotografie miesta, na ktorom si chcete vytvoriť komunitnú záhradu',
            required: true,
          },
          {
            type: 'dragAndDrop',
            helptext:
              'Zakreslenie presného umiestnenia záhrady na pozemku urýchli celý proces - mesto bude vedieť o ktorú časť pozemku máte konkrétne záujem.',
          },
        ),
        ...umiestnenieADizajn,
        fileUpload('ine', { title: 'Iné' }, { type: 'dragAndDrop' }),
      ],
    ),
  ],
)

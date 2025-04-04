import { createCondition, createStringItems } from '../generator/helpers'
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
import { esbsBratislavaMestskaCastNoPrefixCiselnik } from '../tax-form/mapping/shared/esbsCiselniky'
import { match } from 'ts-pattern'

const getAdresaFields = (title: string) => [
  input(
    `ulicaACislo`,
    { title, required: true, type: 'text' },
    { helptext: 'Vyplňte ulicu a číslo' },
  ),
  input(`mesto`, { type: 'text', title: 'Mesto', required: true }, { selfColumn: '3/4' }),
  input(`psc`, { type: 'ba-slovak-zip', title: 'PSČ', required: true }, { selfColumn: '1/4' }),
]

export default schema(
  {
    title: 'Komunitné záhrady',
  },
  {},
  [
    step('ziadatel', { title: 'Žiadateľ' }, [
      input('meno', { title: 'Meno', required: true, type: 'text' }, { selfColumn: '2/4' }),
      input(
        'priezvisko',
        { title: 'Priezvisko', required: true, type: 'text' },
        { selfColumn: '2/4' },
      ),
      ...getAdresaFields('Adresa trvalého pobytu'),
      input('email', { title: 'Email', required: true, type: 'email' }, {}),
      input(
        'telefon',
        { type: 'ba-phone-number', title: 'Telefónne číslo', required: true },
        { size: 'medium', helptext: 'Vyplňte vo formáte +421' },
      ),
    ]),
    step('obcianskeZdruzenie', { title: 'Občianske združenie' }, [
      input(
        'nazovObcianskehoZdruzenia',
        { title: 'Názov občianskeho združenia', required: true, type: 'text' },
        {},
      ),
      input('ico', { title: 'IČO', required: true, type: 'text' }, { size: 'medium' }),
      ...getAdresaFields('Adresa sídla'),
      object(
        'statutar',
        { required: true },
        {
          title: 'Štatutár',
        },
        [
          input('meno', { title: 'Meno', required: true, type: 'text' }, { selfColumn: '2/4' }),
          input(
            'priezvisko',
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
          'Odporúčame vám výber jedného z odporúčaných mestských pozemkov, vďaka čomu vieme žiadosť vybaviť rýchlejšie.',
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
                value: 'odporucanyPozemok',
                label: 'Odporúčaný mestský pozemok',
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
        conditionalFields(createCondition([[['typPozemku'], { const: 'odporucanyPozemok' }]]), [
          select(
            'odporucanyPozemokVyber',
            {
              title: 'Ponuka odporúčaných mestských pozemkov',
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
                'Mapu odporúčaných mestských pozemkov a podmienky pre zaistenie kvalitného verejného priestoru na niektorých mestských pozemkoch [nájdete tu](https://bratislava.sk/zivotne-prostredie-a-vystavba/zelen/udrzba-a-tvorba-zelene/komunitne-zahrady).',
              helptextMarkdown: true,
            },
          ),
        ]),
        conditionalFields(createCondition([[['typPozemku'], { const: 'inyPozemok' }]]), [
          input(
            'adresaPozemku',
            {
              title: 'Adresa komunitnej záhrady',
              type: 'text',
              required: true,
            },
            { helptext: 'Vyplňte vo formáte ulica a číslo' },
          ),
          select(
            'mestskaCast',
            {
              title: 'Mestská časť, v ktorej sa pozemok nachádza',
              required: true,
              items: esbsBratislavaMestskaCastNoPrefixCiselnik.map(({ Name, Code }) => ({
                value: Code,
                label: Name,
              })),
            },
            {},
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
            helptext:
              'Vysvetlite, prečo považujete za vhodné zabrať daný verejný priestor a vytvoriť na ňom záhradu s menej verejným režimom (predpokladáme, že záhrady sú oplotené a poloverejné). Argumentmi môže byť doterajšie nevyužívanie alebo nevhodné využívanie priestoru, napríklad, nelegálne parkovisko na zeleni, zeleň bez udržiavaných sadových úprav, neprístupný/nevyužívaný priestor.',
            helptextMarkdown: true,
          },
        ),
        textArea(
          'suhlasKomunity',
          { title: 'Súhlas miestnej komunity', required: true },
          {
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
          {},
        ),
        textArea(
          'prevadzka',
          {
            title: 'Prevádzka a údržba záhrady',
            required: true,
          },
          {
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
            helptext:
              'Aké budete mať členské poplatky? Využijete na tvorbu záhrady granty? Aké zdroje už máte a aké plánujete získať? V prípade, že už máte (predbežný) rozpočet, nahrajte ho do poľa nižšie.',
          },
        ),
      ],
    ),
    ...(['odporucanyPozemok', 'inyPozemok'] as const).map((typPozemku) =>
      conditionalStep(
        'prilohy',
        createCondition([[['pozemok', 'typPozemku'], { const: typPozemku }]]),
        { title: 'Prílohy', stepQueryParam: `prilohy` },
        [
          match(typPozemku)
            .with('inyPozemok', () =>
              fileUpload(
                'fotografie',
                {
                  title: 'Fotografie miesta, na ktorom si chcete vytvoriť komunitnú záhradu',
                  required: true,
                },
                { type: 'dragAndDrop' },
              ),
            )
            .otherwise(() => null),
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
          match(typPozemku)
            .with('odporucanyPozemok', () =>
              fileUpload(
                'fotografie',
                {
                  title: 'Fotografie miesta, na ktorom si chcete vytvoriť komunitnú záhradu',
                },
                { type: 'dragAndDrop' },
              ),
            )
            .otherwise(() => null),
          fileUpload('ine', { title: 'Iné' }, { type: 'dragAndDrop' }),
        ],
      ),
    ),
  ],
)

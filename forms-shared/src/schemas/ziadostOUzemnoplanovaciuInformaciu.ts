import { createCondition } from '../generator/helpers'
import { select } from '../generator/functions/select'
import { input } from '../generator/functions/input'
import { radioGroup } from '../generator/functions/radioGroup'
import { textArea } from '../generator/functions/textArea'
import { step } from '../generator/functions/step'
import { conditionalFields } from '../generator/functions/conditionalFields'
import { schema } from '../generator/functions/schema'
import { fileUploadMultiple } from '../generator/functions/fileUploadMultiple'
import { arrayField } from '../generator/functions/arrayField'
import { object } from '../generator/object'
import { SchemalessFormDataExtractor } from '../form-utils/evaluateFormDataExtractor'
import { match, P } from 'ts-pattern'
import {
  esbsKatastralneUzemiaCiselnik,
  katastralneUzemiaCodeAbbreviationMap,
} from '../tax-form/mapping/shared/esbsCiselniky'

const addressFields = (title: string) => [
  input(
    'ulicaCislo',
    { title, type: 'text', required: true },
    { helptext: 'Vyplňte vo formáte ulica a číslo' },
  ),
  input('mesto', { type: 'text', title: 'Mesto', required: true }, { selfColumn: '3/4' }),
  input('psc', { type: 'ba-slovak-zip', title: 'PSČ', required: true }, { selfColumn: '1/4' }),
]

export default schema(
  {
    title: 'Žiadosť o územnoplánovaciu informáciu',
  },
  [
    step('ziadatel', { title: 'Žiadateľ' }, [
      radioGroup(
        'typZiadatela',
        {
          type: 'string',
          title: 'Žiadate ako',
          required: true,
          items: [
            { value: 'fyzickaOsoba', label: 'Fyzická osoba', isDefault: true },
            { value: 'fyzickaOsobaPodnikatel', label: 'Fyzická osoba – podnikateľ' },
            { value: 'pravnickaOsoba', label: 'Právnická osoba' },
          ],
        },
        { variant: 'boxed' },
      ),
      conditionalFields(
        createCondition([[['typZiadatela'], { enum: ['fyzickaOsoba', 'fyzickaOsobaPodnikatel'] }]]),
        [
          input('meno', { title: 'Meno', required: true, type: 'text' }, { selfColumn: '2/4' }),
          input(
            'priezvisko',
            { title: 'Priezvisko', required: true, type: 'text' },
            { selfColumn: '2/4' },
          ),
        ],
      ),
      conditionalFields(
        createCondition([[['typZiadatela'], { const: 'fyzickaOsoba' }]]),
        addressFields('Adresa pobytu'),
      ),
      conditionalFields(
        createCondition([
          [['typZiadatela'], { enum: ['fyzickaOsobaPodnikatel', 'pravnickaOsoba'] }],
        ]),
        [
          input('obchodneMeno', { type: 'text', title: 'Obchodné meno', required: true }, {}),
          input('ico', { type: 'ba-ico', title: 'IČO', required: true }, { size: 'medium' }),
        ],
      ),
      conditionalFields(
        createCondition([[['typZiadatela'], { const: 'fyzickaOsobaPodnikatel' }]]),
        [...addressFields('Miesto podnikania')],
      ),
      conditionalFields(createCondition([[['typZiadatela'], { const: 'pravnickaOsoba' }]]), [
        ...addressFields('Adresa sídla'),
      ]),
      ...[['fyzickaOsoba', 'fyzickaOsobaPodnikatel'] as const, 'pravnickaOsoba' as const].map(
        (ziadatelTypy) =>
          conditionalFields(
            createCondition([
              [
                ['typZiadatela'],
                match(ziadatelTypy)
                  .with(P.string, (matchedValue) => ({
                    const: matchedValue,
                  }))
                  .with(P.array(P.string), (matchedValue) => ({
                    enum: [...matchedValue],
                  }))
                  .exhaustive(),
              ],
            ]),
            [
              object(
                'kontaktneUdaje',
                {
                  title: 'Kontaktné údaje',
                  objectDisplay: 'boxed',
                },
                [
                  ...match(ziadatelTypy)
                    .with('pravnickaOsoba', () => [
                      input(
                        'meno',
                        { title: 'Meno', required: true, type: 'text' },
                        { selfColumn: '2/4' },
                      ),
                      input(
                        'priezvisko',
                        { title: 'Priezvisko', required: true, type: 'text' },
                        { selfColumn: '2/4' },
                      ),
                    ])
                    .otherwise(() => []),
                  input('email', { title: 'Email', required: true, type: 'email' }, {}),
                  input(
                    'telefon',
                    { type: 'ba-phone-number', title: 'Telefónne číslo', required: true },
                    { size: 'medium', helptext: 'Vyplňte vo formáte +421' },
                  ),
                ],
              ),
            ],
          ),
      ),
      ...['fyzickaOsoba' as const, ['fyzickaOsobaPodnikatel', 'pravnickaOsoba'] as const].map(
        (ziadatelTypy) =>
          conditionalFields(
            createCondition([
              [
                ['typZiadatela'],
                match(ziadatelTypy)
                  .with(P.string, (matchedValue) => ({
                    const: matchedValue,
                  }))
                  .with(P.array(P.string), (matchedValue) => ({
                    enum: [...matchedValue],
                  }))
                  .exhaustive(),
              ],
            ]),
            [
              radioGroup(
                'formaDorucovania',
                {
                  type: 'string',
                  title: 'Akou formou chcete doručiť územnoplánovaciu informáciu?',
                  required: true,
                  items: match(ziadatelTypy)
                    .with('fyzickaOsoba', () => [
                      { value: 'email', label: 'Email' },
                      { value: 'posta', label: 'Poštou na adresu žiadateľa' },
                      {
                        value: 'elektronickaSchranka',
                        label: 'Elektronická schránka slovensko.sk',
                      },
                    ])
                    .with(['fyzickaOsobaPodnikatel', 'pravnickaOsoba'], () => [
                      { value: 'email', label: 'Email' },
                      {
                        value: 'elektronickaSchranka',
                        label: 'Elektronická schránka slovensko.sk',
                      },
                    ])
                    .exhaustive(),
                },
                { variant: 'boxed' },
              ),
            ],
          ),
      ),
    ]),

    step(
      'detailAUcel',
      {
        title: 'Detail a účel',
        description:
          'V jednej žiadosti o územnoplánovaciu informáciu môžete žiadať o informáciu maximálne k 5 parcelám (lokalitám). Lokalita znamená jedno parcelné číslo. Všetky lokality v žiadosti sa musia nachádzať v jednom katastrálnom území.',
      },
      [
        select(
          'katastralneUzemie',
          {
            title: 'Katastrálne územie',
            required: true,
            items: esbsKatastralneUzemiaCiselnik.map(({ Name, Code }) => ({
              value: Code,
              label: Name,
              isDefault: false,
            })),
          },
          {
            helptext:
              'Vyberte katastrálne územie, v ktorom sa nachádzajú lokality, pre ktoré žiadate územnoplánovaciu informáciu.',
          },
        ),
        object(
          'informacieOLokalite',
          {
            title: 'Informácie o lokalite',
            description:
              'V jednej žiadosti môžete žiadať o informáciu maximálne k 5 parcelám. Každá lokalita predstavuje jedno parcelné číslo. Všetky lokality musia byť umiestnené v jednom katastrálnom území vybranom vyššie.',
            objectDisplay: 'boxed',
          },
          [
            arrayField(
              'lokality',
              {
                title: 'Lokality',
                required: true,
                minItems: 1,
                maxItems: 5,
              },
              {
                addButtonLabel: 'Pridať informácie o ďalšej lokalite',
                itemTitle: 'Lokalita č. {index}',
                variant: 'topLevel',
                cannotAddItemMessage: 'Nemôžete pridať viac ako 5 lokalít.',
              },
              [
                input(
                  'parcelneCislo',
                  {
                    title: 'Parcelné číslo',
                    type: 'text',
                    required: true,
                  },
                  {
                    helptext:
                      'Číslo parcely nájdete na [katastrálnej mape ZBGIS](https://zbgis.skgeodesy.sk/mapka/sk/kataster?pos=48.143926,17.125711,11).',
                    helptextMarkdown: true,
                    selfColumn: '2/4',
                  },
                ),
                select(
                  'registerParcely',
                  {
                    title: 'Register parcely',
                    required: true,
                    items: [
                      { value: 'registerCKn', label: 'register C-KN' },
                      { value: 'registerEKn', label: 'register E-KN' },
                    ],
                  },
                  {
                    helptext: 'Vyberte či sa jedná o parcelu registra "C" alebo "E"',
                    selfColumn: '2/4',
                  },
                ),
                input(
                  'ulicaACislo',
                  {
                    title: 'Ulica a číslo / popis lokality',
                    type: 'text',
                    required: true,
                  },
                  {
                    helptext:
                      'V prípade, že žiadaná oblasť nemá presnú ulicu, uveďte prosíme upresnenie lokality, príp. lokálny názov.',
                  },
                ),
              ],
            ),
          ],
        ),
        radioGroup(
          'ucelUzemnoplanovacichiInformacii',
          {
            type: 'string',
            title: 'Účel územnoplánovacej informácie',
            required: true,
            items: [
              { value: 'planovanyInvesticnyZamer', label: 'Planovaný investičný zámer' },
              { value: 'kupaPredajNajom', label: 'Kúpa, predaj alebo nájom nehnuteľnosti' },
              { value: 'sudnoznaleckyPosudok', label: 'Súdnoznalecký posudok' },
              { value: 'informativnyZamer', label: 'Informatívny zámer' },
              { value: 'ine', label: 'Iné' },
            ],
          },
          { variant: 'boxed' },
        ),
        textArea(
          'popisZameru',
          {
            title: 'Popíšte zámer, pre ktorý žiadate o územnoplánovaciu informáciu.',
            required: false,
          },
          {},
        ),
      ],
    ),

    step('prilohy', { title: 'Prílohy' }, [
      fileUploadMultiple(
        'zakresZaujmovychParciel',
        {
          title: 'Zákres záujmových parciel do kópie katastrálnej mapy',
          required: true,
        },
        {
          type: 'dragAndDrop',
          helptext: `Využiť môžete [katastrálnu mapu ZBGIS](https://zbgis.skgeodesy.sk/mapka/sk/kataster?pos=48.143926,17.125711,11), kde nájdete požadované záujmové územie.

**Ako vytvoriť zákres?**
Prejdite do [katastrálnej mapy ZBGIS](https://zbgis.skgeodesy.sk/mapka/sk/kataster?pos=48.143926,17.125711,11). Otvorením menu v ľavom hornom rohu nájdete funkciu „Meranie“. Tá vám umožní zaznačiť vaše záujmové územie na katastrálnej mape, pričom systém vám následne vypočíta výmeru označenej plochy. Po vyznačení plochy do mapy pri položke „Meranie 1“ kliknite na ikonu troch bodiek a zvoľte možnosť „Tlačiť do PDF“. Dbajte na to, aby bolo celé vaše záujmové územie na snímke zreteľne viditeľné. Dokument uložte a následne ho nahrajte do poľa nižšie.`,
          helptextMarkdown: true,
        },
      ),
    ]),
  ],
)

type ExtractTechnicalSubjectFormData = {
  detailAUcel: {
    katastralneUzemie: (typeof esbsKatastralneUzemiaCiselnik)[number]['Code']
    informacieOLokalite: {
      lokality: {
        parcelneCislo: string
        ulicaACislo: string
      }[]
    }
  }
}

export const ziadostOUzemnoplanovaciuInformaciuExtractTechnicalSubject: SchemalessFormDataExtractor<ExtractTechnicalSubjectFormData> =
  {
    type: 'schemaless',
    extractFn: (formData) => {
      const katastralneUzemieAbbreviation =
        katastralneUzemiaCodeAbbreviationMap[formData.detailAUcel.katastralneUzemie]
      const ulica = formData.detailAUcel.informacieOLokalite.lokality[0].ulicaACislo
      const parcelneCisla = formData.detailAUcel.informacieOLokalite.lokality
        .slice(0, 2)
        .map(({ parcelneCislo }) => parcelneCislo)
        .join(', ')

      return `e-UPI ž. ${ulica}, p.č. ${parcelneCisla}, kú ${katastralneUzemieAbbreviation}`
    },
  }

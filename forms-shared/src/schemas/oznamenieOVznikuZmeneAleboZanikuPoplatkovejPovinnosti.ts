import { createCamelCaseItems, createCondition } from '../generator/helpers'
import { esbsNationalityCiselnik } from './priznanie-k-dani-z-nehnutelnosti/esbsCiselniky'
import { select } from '../generator/functions/select'
import { input } from '../generator/functions/input'
import { radioGroup } from '../generator/functions/radioGroup'
import { object } from '../generator/object'
import { step } from '../generator/functions/step'
import { conditionalFields } from '../generator/functions/conditionalFields'
import { schema } from '../generator/functions/schema'
import { fileUploadMultiple } from '../generator/functions/fileUploadMultiple'
import { createCombinations } from '../generator/createCombinations'
import { conditionalStep } from '../generator/functions/conditionalStep'
import { datePicker } from '../generator/functions/datePicker'
import { number } from '../generator/functions/number'
import { textArea } from '../generator/functions/textArea'
import { arrayField } from '../generator/functions/arrayField'
import { match, P } from 'ts-pattern'

const komunalMap = {
  fyzickaOsoba: {
    objemy: [
      { value: '120LZbernaNadoba', label: '120 l zberná nádoba' },
      { value: '240LZbernaNadoba', label: '240 l zberná nádoba' },
    ],
    frekvencie: [
      {
        condition: (objemNadobyProperty: string) =>
          createCondition([[[objemNadobyProperty], { const: '120LZbernaNadoba' }]]),
        items: [
          { value: '1X7Dni', label: '1× 7 dní' },
          { value: '1X14Dni', label: '1× 14 dní' },
          { value: '1X28Dni', label: '1× 28 dní' },
        ],
      },
      {
        condition: (objemNadobyProperty: string) =>
          createCondition([[[objemNadobyProperty], { const: '240LZbernaNadoba' }]]),
        items: [
          { value: '1X7Dni', label: '1× 7 dní' },
          { value: '1X14Dni', label: '1× 14 dní' },
          { value: '1X28Dni', label: '1× 28 dní' },
        ],
      },
      {
        condition: (objemNadobyProperty: string) =>
          createCondition([[[objemNadobyProperty], { const: undefined }]]),
        items: [{ value: '', label: '' }],
      },
    ],
  },
  spravcaSpolocenstvoVlastnikov: {
    objemy: [
      { value: '120LZbernaNadoba', label: '120 l zberná nádoba' },
      { value: '240LZbernaNadoba', label: '240 l zberná nádoba' },
      { value: 'kontajner1100L', label: 'Kontajner 1100 l' },
      { value: 'PPKontajner3000L', label: 'PP kontajner 3000 l' },
      { value: 'PPKontajner5000L', label: 'PP kontajner 5000 l' },
    ],
    frekvencie: [
      {
        condition: (objemNadobyProperty: string) =>
          createCondition([
            [[objemNadobyProperty], { enum: ['120LZbernaNadoba', '240LZbernaNadoba'] }],
          ]),
        items: [
          { value: '1X7Dni', label: '1× 7 dní' },
          { value: '2X7Dni', label: '2× 7 dní' },
          { value: '3X7Dni', label: '3× 7 dní' },
          { value: '4X7Dni', label: '4× 7 dní' },
          { value: '5X7Dni', label: '5× 7 dní' },
          { value: '6X7Dni', label: '6× 7 dní' },
          { value: '1X14Dni', label: '1× 14 dní' },
        ],
      },
      {
        condition: (objemNadobyProperty: string) =>
          createCondition([
            [
              [objemNadobyProperty],
              { enum: ['kontajner1100L', 'PPKontajner3000L', 'PPKontajner5000L'] },
            ],
          ]),
        items: [
          { value: '1X7Dni', label: '1× 7 dní' },
          { value: '2X7Dni', label: '2× 7 dní' },
          { value: '3X7Dni', label: '3× 7 dní' },
          { value: '4X7Dni', label: '4× 7 dní' },
          { value: '5X7Dni', label: '5× 7 dní' },
          { value: '6X7Dni', label: '6× 7 dní' },
        ],
      },
      {
        condition: (objemNadobyProperty: string) =>
          createCondition([[[objemNadobyProperty], { const: undefined }]]),
        items: [{ value: '', label: '' }],
      },
    ],
  },
  fyzickaOsobaPodnikatel: {
    objemy: [
      { value: '120LZbernaNadoba', label: '120 l zberná nádoba' },
      { value: '240LZbernaNadoba', label: '240 l zberná nádoba' },
      { value: 'kontajner1100L', label: 'Kontajner 1100 l' },
    ],
    frekvencie: [
      {
        condition: (objemNadobyProperty: string, pocetNadobProperty: string) =>
          createCondition([
            [[objemNadobyProperty], { enum: ['120LZbernaNadoba', '240LZbernaNadoba'] }],
            [[pocetNadobProperty], { minimum: 2 }],
          ]),
        items: [
          { value: '1X7Dni', label: '1× 7 dní' },
          { value: '2X7Dni', label: '2× 7 dní' },
          { value: '3X7Dni', label: '3× 7 dní' },
          { value: '4X7Dni', label: '4× 7 dní' },
          { value: '5X7Dni', label: '5× 7 dní' },
          { value: '6X7Dni', label: '6× 7 dní' },
        ],
      },
      {
        condition: (objemNadobyProperty: string, pocetNadobProperty: string) =>
          createCondition([
            [[objemNadobyProperty], { enum: ['120LZbernaNadoba', '240LZbernaNadoba'] }],
            [[pocetNadobProperty], { not: { minimum: 2 } }],
          ]),
        items: [
          { value: '1X7Dni', label: '1× 7 dní' },
          { value: '2X7Dni', label: '2× 7 dní' },
          { value: '3X7Dni', label: '3× 7 dní' },
          { value: '4X7Dni', label: '4× 7 dní' },
          { value: '5X7Dni', label: '5× 7 dní' },
          { value: '6X7Dni', label: '6× 7 dní' },
          { value: '1X14Dni', label: '1× 14 dní' },
        ],
      },
      {
        condition: (objemNadobyProperty: string) =>
          createCondition([[[objemNadobyProperty], { const: 'kontajner1100L' }]]),
        items: [
          { value: '1X7Dni', label: '1× 7 dní' },
          { value: '2X7Dni', label: '2× 7 dní' },
          { value: '3X7Dni', label: '3× 7 dní' },
          { value: '4X7Dni', label: '4× 7 dní' },
          { value: '5X7Dni', label: '5× 7 dní' },
          { value: '6X7Dni', label: '6× 7 dní' },
        ],
      },
      {
        condition: (objemNadobyProperty: string) =>
          createCondition([[[objemNadobyProperty], { not: { type: 'string' } }]]),
        items: [{ value: '', label: '' }],
      },
    ],
  },
  pravnickaOsoba: {
    objemy: [
      { value: '120LZbernaNadoba', label: '120 l zberná nádoba' },
      { value: '240LZbernaNadoba', label: '240 l zberná nádoba' },
      { value: 'kontajner1100L', label: 'Kontajner 1100 l' },
      { value: 'lisovaciKontajner10000L', label: 'Lisovací kontajner 10 000' },
      { value: 'lisovaciKontajner13000L', label: 'Lisovací kontajner 13 000' },
      { value: 'PPKontajner3000L', label: 'PP kontajner 3000 l' },
      { value: 'PPKontajner5000L', label: 'PP kontajner 5000 l' },
    ],
    frekvencie: [
      {
        condition: (objemNadobyProperty: string, pocetNadobProperty: string) =>
          createCondition([
            [[objemNadobyProperty], { enum: ['120LZbernaNadoba', '240LZbernaNadoba'] }],
            [[pocetNadobProperty], { minimum: 2 }],
          ]),
        items: [
          { value: '1X7Dni', label: '1× 7 dní' },
          { value: '2X7Dni', label: '2× 7 dní' },
          { value: '3X7Dni', label: '3× 7 dní' },
          { value: '4X7Dni', label: '4× 7 dní' },
          { value: '5X7Dni', label: '5× 7 dní' },
          { value: '6X7Dni', label: '6× 7 dní' },
        ],
      },
      {
        condition: (objemNadobyProperty: string, pocetNadobProperty: string) =>
          createCondition([
            [[objemNadobyProperty], { enum: ['120LZbernaNadoba', '240LZbernaNadoba'] }],
            [[pocetNadobProperty], { not: { minimum: 1 } }],
          ]),
        items: [
          { value: '1X7Dni', label: '1× 7 dní' },
          { value: '2X7Dni', label: '2× 7 dní' },
          { value: '3X7Dni', label: '3× 7 dní' },
          { value: '4X7Dni', label: '4× 7 dní' },
          { value: '5X7Dni', label: '5× 7 dní' },
          { value: '6X7Dni', label: '6× 7 dní' },
          { value: '1X14Dni', label: '1× 14 dní' },
        ],
      },
      {
        condition: (objemNadobyProperty: string) =>
          createCondition([
            [
              [objemNadobyProperty],
              {
                enum: [
                  'kontajner1100L',
                  'lisovaciKontajner10000L',
                  'lisovaciKontajner13000L',
                  'PPKontajner3000L',
                  'PPKontajner5000L',
                ],
              },
            ],
          ]),
        items: [
          { value: '1X7Dni', label: '1× 7 dní' },
          { value: '2X7Dni', label: '2× 7 dní' },
          { value: '3X7Dni', label: '3× 7 dní' },
          { value: '4X7Dni', label: '4× 7 dní' },
          { value: '5X7Dni', label: '5× 7 dní' },
          { value: '6X7Dni', label: '6× 7 dní' },
        ],
      },
      {
        condition: (objemNadobyProperty: string) =>
          createCondition([[[objemNadobyProperty], { const: undefined }]]),
        items: [{ value: '', label: '' }],
      },
    ],
  },
}

const getKomunalNadoba = (
  typOznamenia: 'vznikZanik' | 'zmena',
  oznamovatelTyp:
    | 'fyzickaOsoba'
    | 'spravcaSpolocenstvoVlastnikov'
    | 'fyzickaOsobaPodnikatel'
    | 'pravnickaOsoba',
) => {
  return [
    typOznamenia === 'zmena'
      ? select(
          'povodnyObjemNadoby',
          {
            title: 'Pôvodný objem nádoby',
            required: true,
            items: komunalMap[oznamovatelTyp].objemy,
          },
          {},
        )
      : null,
    select(
      'objemNadoby',
      {
        title: {
          ['vznikZanik']: 'Objem nádoby',
          ['zmena']: 'Nový objem nádoby',
        }[typOznamenia],
        required: true,
        items: komunalMap[oznamovatelTyp].objemy,
      },
      {},
    ),
    typOznamenia === 'zmena'
      ? number(
          'povodnyPocetNadob',
          {
            type: 'integer',
            title: 'Pôvodný počet nádob',
            required: true,
            minimum: 0,
          },
          {},
        )
      : null,
    number(
      'pocetNadob',
      {
        type: 'integer',
        title: {
          ['vznikZanik']: 'Počet nádob',
          ['zmena']: 'Nový počet nádob',
        }[typOznamenia],
        required: true,
        minimum: 0,
      },
      {},
    ),
    ...(typOznamenia === 'zmena'
      ? komunalMap[oznamovatelTyp].frekvencie.map(({ condition, items }) =>
          conditionalFields(condition('povodnyObjemNadoby', 'povodnyPocetNadob'), [
            select(
              'povodnaFrekvenciaOdvozu',
              {
                title: 'Pôvodna frekvencia odvozu',
                required: true,
                items,
              },
              {},
            ),
          ]),
        )
      : []),
    ...komunalMap[oznamovatelTyp].frekvencie.map(({ condition, items }) =>
      conditionalFields(condition('objemNadoby', 'pocetNadob'), [
        select(
          'frekvenciaOdvozu',
          {
            title: {
              ['vznikZanik']: 'Frekvencia odvozu',
              ['zmena']: 'Nová frekvencia odvozu',
            }[typOznamenia],
            required: true,
            items,
          },
          {},
        ),
      ]),
    ),
  ]
}

const getKomunalNove = (
  oznamovatelTyp:
    | 'fyzickaOsoba'
    | 'spravcaSpolocenstvoVlastnikov'
    | 'fyzickaOsobaPodnikatel'
    | 'pravnickaOsoba',
) => {
  return [
    arrayField(
      'nadoby',
      { title: 'Nádoby', required: true },
      {
        variant: 'topLevel',
        addButtonLabel: 'Pridať daľšiu nádobu',
        itemTitle: 'Nádoba č. {index}',
      },
      getKomunalNadoba('vznikZanik', oznamovatelTyp),
    ),
  ]
}

const getKomunalZmena = (
  oznamovatelTyp:
    | 'fyzickaOsoba'
    | 'spravcaSpolocenstvoVlastnikov'
    | 'fyzickaOsobaPodnikatel'
    | 'pravnickaOsoba',
) => {
  return [
    radioGroup(
      'pridat',
      {
        type: 'boolean',
        title: 'Chcete si objednať nové zberné nádoby?',
        required: true,
        items: [
          { value: true, label: 'Áno' },
          { value: false, label: 'Nie' },
        ],
      },
      {
        variant: 'boxed',
        orientations: 'row',
      },
    ),
    conditionalFields(createCondition([[['pridat'], { const: true }]]), [
      arrayField(
        'nadobyPridat',
        { title: 'Nové nádoby na objednanie', required: true },
        {
          variant: 'topLevel',
          addButtonLabel: 'Pridať daľšiu nádobu',
          itemTitle: 'Nová nádoba č. {index}',
        },
        getKomunalNadoba('vznikZanik', oznamovatelTyp),
      ),
    ]),
    radioGroup(
      'zmena',
      {
        type: 'boolean',
        title: 'Chcete zmeniť parametre existujúcich nádob?',
        required: true,
        items: [
          { value: true, label: 'Áno' },
          { value: false, label: 'Nie' },
        ],
      },
      {
        variant: 'boxed',
        orientations: 'row',
      },
    ),
    conditionalFields(createCondition([[['zmena'], { const: true }]]), [
      arrayField(
        'nadobyZmena',
        { title: 'Nádoby na zmenu parametrov', required: true },
        {
          variant: 'topLevel',
          addButtonLabel: 'Pridať daľšiu nádobu',
          itemTitle: 'Nádoba na zmenu č. {index}',
        },
        getKomunalNadoba('zmena', oznamovatelTyp),
      ),
    ]),
    radioGroup(
      'odobrat',
      {
        type: 'boolean',
        title: 'Chcete zrušiť niektoré zberné nádoby?',
        required: true,
        items: [
          { value: true, label: 'Áno' },
          { value: false, label: 'Nie' },
        ],
      },
      {
        variant: 'boxed',
        orientations: 'row',
      },
    ),
    conditionalFields(createCondition([[['odobrat'], { const: true }]]), [
      arrayField(
        'nadobyOdobrat',
        { title: 'Nádoby na zrušenie', required: true },
        {
          variant: 'topLevel',
          addButtonLabel: 'Pridať daľšiu nádobu',
          itemTitle: 'Nádoba na zrušenie č. {index}',
        },
        getKomunalNadoba('vznikZanik', oznamovatelTyp),
      ),
    ]),
  ]
}

const adresaFields = [
  input('ulicaACislo', { title: 'Ulica a číslo', required: true, type: 'text' }, {}),
  input('mesto', { type: 'text', title: 'Mesto', required: true }, { selfColumn: '3/4' }),
  input('psc', { type: 'ba-slovak-zip', title: 'PSČ', required: true }, { selfColumn: '1/4' }),
  select(
    'stat',
    {
      title: 'Štát',
      required: true,
      items: esbsNationalityCiselnik.map(({ Name, Code }) => ({
        value: Code,
        label: Name,
        isDefault: Code === '703' ? true : undefined,
      })),
    },
    {},
  ),
]

const getOsobaFields = (
  osobaTyp:
    | 'fyzickaOsoba'
    | 'spravcaSpolocenstvoVlastnikov'
    | 'fyzickaOsobaPodnikatel'
    | 'pravnickaOsoba'
    | 'splnomocnenecFyzickaOsoba'
    | 'splnomocnenecPravnickaOsoba'
    | 'spravcaSpolocenstvoVlastnikovPravnickaOsobaOpravnenaOsoba',
) => {
  return [
    ...match(osobaTyp)
      .with(
        P.union(
          'fyzickaOsoba',
          'fyzickaOsobaPodnikatel',
          'splnomocnenecFyzickaOsoba',
          'spravcaSpolocenstvoVlastnikovPravnickaOsobaOpravnenaOsoba',
        ),
        () => [
          input('meno', { title: 'Meno', required: true, type: 'text' }, { selfColumn: '2/4' }),
          input(
            'priezvisko',
            { title: 'Priezvisko', required: true, type: 'text' },
            { selfColumn: '2/4' },
          ),
          input('titul', { type: 'text', title: 'Titul' }, { size: 'medium' }),
        ],
      )
      .otherwise(() => []),
    match(osobaTyp)
      .with(P.union('fyzickaOsoba', 'fyzickaOsobaPodnikatel', 'splnomocnenecFyzickaOsoba'), () =>
        input(
          'rodneCislo',
          { type: 'text', title: 'Rodné číslo', required: true },
          { helptext: 'Rodné číslo zadávajte s lomítkom.', size: 'medium' },
        ),
      )
      .otherwise(() => null),
    ...match(osobaTyp)
      .with(
        P.union(
          'spravcaSpolocenstvoVlastnikov',
          'fyzickaOsobaPodnikatel',
          'pravnickaOsoba',
          'splnomocnenecPravnickaOsoba',
        ),
        (osobaTypInner) => [
          input(
            'obchodneMeno',
            {
              type: 'text',
              title: match(osobaTypInner)
                .with(
                  'spravcaSpolocenstvoVlastnikov',
                  () => 'Obchodné meno správcu / názov spoločenstva',
                )
                .with(P.union('fyzickaOsobaPodnikatel', 'pravnickaOsoba'), () => 'Obchodné meno')
                .with('splnomocnenecPravnickaOsoba', () => 'Obchodné meno alebo názov')
                .exhaustive(),
              required: true,
            },
            {},
          ),
          input('ico', { type: 'ba-ico', title: 'IČO', required: true }, {}),
        ],
      )
      .otherwise(() => []),
    input('email', { title: 'Email', required: true, type: 'email' }, {}),
    input(
      'telefon',
      { type: 'ba-phone-number', title: 'Telefónne číslo', required: true },
      { size: 'medium', placeholder: '+421', helptext: 'Vyplňte vo formáte +421' },
    ),
    object(
      'adresa',
      { required: true },
      {
        objectDisplay: 'boxed',
        title: match(osobaTyp)
          .with('fyzickaOsoba', () => 'Adresa trvalého pobytu')
          .with(
            P.union(
              'pravnickaOsoba',
              'fyzickaOsobaPodnikatel',
              'spravcaSpolocenstvoVlastnikov',
              'splnomocnenecPravnickaOsoba',
            ),
            () => 'Adresa sídla',
          )
          .with(P.union('splnomocnenecFyzickaOsoba'), () => 'Adresa trvalého/prechodného pobytu')
          .with(
            P.union('spravcaSpolocenstvoVlastnikovPravnickaOsobaOpravnenaOsoba'),
            () => 'Adresa trvalého pobytu/sídla',
          )
          .exhaustive(),
      },
      adresaFields,
    ),
    ...match(osobaTyp)
      .with('fyzickaOsoba', () => [
        radioGroup(
          'maPrechodnyPobyt',
          {
            type: 'boolean',
            title: 'Máte prechodný pobyt?',
            required: true,
            items: [
              { value: true, label: 'Áno' },
              { value: false, label: 'Nie', isDefault: true },
            ],
          },
          {
            variant: 'boxed',
            orientations: 'row',
          },
        ),
        conditionalFields(createCondition([[['maPrechodnyPobyt'], { const: true }]]), adresaFields),
      ])
      .otherwise(() => []),
  ]
}

export default schema(
  {
    title: 'Oznámenie o vzniku, zmene alebo zániku poplatkovej povinnosti',
  },
  {},
  [
    step('typOznamenia', { title: 'Typ oznámenia' }, [
      radioGroup(
        'typOznamenia',
        {
          type: 'string',
          title: 'Vyberte, prosím, druh oznámenia',
          required: true,
          items: [
            { value: 'vznik', label: 'Vznik poplatkovej povinnosti' },
            {
              value: 'zmena',
              label: 'Zmena poplatkovej povinnosti',
              description:
                'Použite túto možnosť, ak potrebujete upraviť parametre ako typ a počet nádob, frekvenciu odvozu odpadu alebo počet osôb.',
            },
            { value: 'zanik', label: 'Zánik poplatkovej povinnosti' },
          ],
        },
        {
          variant: 'boxed',
          orientations: 'column',
        },
      ),
    ]),
    step('oznamovatel', { title: 'Oznamovateľ' }, [
      radioGroup(
        'voSvojomMene',
        {
          type: 'boolean',
          title: 'Podávate oznámenie vo svojom mene?',
          required: true,
          items: [
            { value: true, label: 'Áno', isDefault: true },
            { value: false, label: 'Nie' },
          ],
        },
        {
          variant: 'boxed',
          orientations: 'row',
        },
      ),
      conditionalFields(createCondition([[['voSvojomMene'], { const: false }]]), [
        object(
          'opravnenaOsoba',
          { required: true },
          {
            objectDisplay: 'boxed',
            title: 'Údaje o oprávnenej osobe na podanie oznámenia',
          },
          [
            fileUploadMultiple(
              'splnomocnenie',
              { title: 'Nahrajte splnomocnenie', required: true },
              {
                helptext:
                  'Tu nahrajte sken plnej moci. Po odoslaní formulára bude potrebné, aby ste doručili originál plnej moci v listinnej podobe na oddelenie miestnych daní, poplatkov a licencií. Splnomocnenie sa neprikladá v prípade zákonného zástupcu neplnoletej osoby.',
              },
            ),
            radioGroup(
              'typOsoby',
              {
                type: 'string',
                title: 'Oznamujete ako oprávnená osoba (splnomocnenec)',
                required: true,
                items: [
                  { value: 'fyzickaOsoba', label: 'Fyzická osoba' },
                  { value: 'pravnickaOsoba', label: 'Právnická osoba' },
                ],
              },
              {
                variant: 'boxed',
                orientations: 'column',
              },
            ),
            conditionalFields(
              createCondition([[['typOsoby'], { const: 'fyzickaOsoba' }]]),
              getOsobaFields('splnomocnenecFyzickaOsoba'),
            ),
            conditionalFields(
              createCondition([[['typOsoby'], { const: 'pravnickaOsoba' }]]),
              getOsobaFields('splnomocnenecPravnickaOsoba'),
            ),
          ],
        ),
      ]),
      radioGroup(
        'oznamovatelTyp',
        {
          type: 'string',
          title: 'Oznamovateľ je',
          required: true,
          items: [
            { value: 'fyzickaOsoba', label: 'Fyzická osoba' },
            {
              value: 'spravcaSpolocenstvoVlastnikov',
              label: 'Správca alebo spoločenstvo vlastníkov',
            },
            { value: 'fyzickaOsobaPodnikatel', label: 'Fyzická osoba - podnikateľ' },
            { value: 'pravnickaOsoba', label: 'Právnická osoba' },
          ],
        },
        {
          variant: 'boxed',
          orientations: 'column',
        },
      ),
      ...(
        [
          'fyzickaOsoba',
          'spravcaSpolocenstvoVlastnikov',
          'fyzickaOsobaPodnikatel',
          'pravnickaOsoba',
        ] as const
      ).map((osobaTyp) =>
        conditionalFields(
          createCondition([[['oznamovatelTyp'], { const: osobaTyp }]]),
          getOsobaFields(osobaTyp),
        ),
      ),
      conditionalFields(
        createCondition([
          [['voSvojomMene'], { const: true }],
          [['oznamovatelTyp'], { enum: ['spravcaSpolocenstvoVlastnikov', 'pravnickaOsoba'] }],
        ]),
        [
          object(
            'opravnenaOsoba',
            { required: false },
            {
              objectDisplay: 'boxed',
              title: 'Údaje o oprávnenej osobe na podanie oznámenia',
            },
            [
              select(
                'pravnyVztah',
                {
                  title: 'Vyberte právny vzťah k právnickej osobe, za ktorú podávate oznámenie.',
                  items: [
                    { value: 'zastupca', label: 'Zástupca' },
                    { value: 'statutarnyOrgan', label: 'Štatutárny orgán' },
                  ],
                  required: true,
                },
                {},
              ),
              ...getOsobaFields('spravcaSpolocenstvoVlastnikovPravnickaOsobaOpravnenaOsoba'),
            ],
          ),
        ],
      ),
      radioGroup(
        'maElektronickuSchranku',
        {
          type: 'boolean',
          title: 'Máte aktivovanú elektronickú schránku na portáli Slovensko.sk?',
          required: true,
          items: [
            { value: true, label: 'Áno', isDefault: true },
            { value: false, label: 'Nie' },
          ],
        },
        {
          variant: 'boxed',
          orientations: 'row',
          helptext:
            'V prípade, že máte aktivovanú elektronickú schránku na portáli Slovensko.sk, rozhodnutie vám príde automaticky do vašej elektronickej schránky.',
        },
      ),
      conditionalFields(createCondition([[['maElektronickuSchranku'], { const: false }]]), [
        radioGroup(
          'adresaRozhodnutia',
          {
            type: 'string',
            title: 'Na akú adresu má byť doručené rozhodnutie o určení poplatku?',
            required: true,
            items: [
              { value: 'adresaTrvalehoPobytu', label: 'Adresa trvalého pobytu' },
              { value: 'adresaPrechodnehoPobytu', label: 'Adresa prechodného pobytu' },
              { value: 'adresaSidla', label: 'Adresa sídla' },
              { value: 'inaAdresa', label: 'Iná adresa' },
            ],
          },
          {
            variant: 'boxed',
            orientations: 'column',
          },
        ),
        conditionalFields(createCondition([[['adresaRozhodnutia'], { const: 'Iná adresa' }]]), [
          input('inaAdresa', { type: 'text', title: 'Iná doručovacia adresa', required: true }, {}),
          object('mestoPsc', { required: true }, {}, [
            input('mesto', { type: 'text', title: 'Mesto', required: true }, { selfColumn: '3/4' }),
            input(
              'psc',
              { type: 'ba-slovak-zip', title: 'PSČ', required: true },
              { selfColumn: '1/4' },
            ),
          ]),
          select(
            'stat',
            {
              title: 'Štát',
              required: true,
              items: esbsNationalityCiselnik.map(({ Name, Code }) => ({
                value: Code,
                label: Name,
                isDefault: Code === '703' ? true : undefined,
              })),
            },
            {},
          ),
        ]),
      ]),
    ]),
    ...createCombinations(
      {
        typOznamenia: ['vznik', 'zmena', 'zanik'] as const,
        oznamovatelTyp: [
          'fyzickaOsoba',
          'spravcaSpolocenstvoVlastnikov',
          'fyzickaOsobaPodnikatel',
          'pravnickaOsoba',
        ] as const,
      },
      ({ typOznamenia, oznamovatelTyp }) =>
        conditionalStep(
          'informacieOOdvoze',
          createCondition([
            [['typOznamenia', 'typOznamenia'], { const: typOznamenia }],
            [['oznamovatel', 'oznamovatelTyp'], { const: oznamovatelTyp }],
          ]),
          { title: 'Informácie o odvoze' },
          [
            datePicker(
              'datum',
              {
                title: {
                  vznik: 'Dátum vzniku poplatkovej povinnosti odo dňa',
                  zmena: 'Dátum zmeny poplatkovej povinnosti odo dňa',
                  zanik: 'Dátum zániku poplatkovej povinnosti odo dňa',
                }[typOznamenia],
                required: true,
              },
              {
                helptext: {
                  vznik:
                    'Poplatková povinnosť vzniká dňom nadobudnutia práva užívať nehnuteľnosť (napr. kúpa alebo nájom nehnuteľnosti).',
                  zmena:
                    'Uveďte požadovaný dátum, od ktorého chcete, aby zmena nadobudla účinnosť.',
                  zanik:
                    'Povinnosť zaniká dňom, keď prestanete užívať nehnuteľnosť (napr. odsťahovanie, predaj nehnuteľnosti, úmrtie).',
                }[typOznamenia],
              },
            ),
            input(
              'odvozneMiesto',
              {
                type: 'text',
                title:
                  oznamovatelTyp === 'spravcaSpolocenstvoVlastnikov'
                    ? 'Odvozné miesto pre bytový dom'
                    : 'Odvozné miesto',
                required: true,
              },
              { helptext: 'Vypíšte názov ulice' },
            ),
            radioGroup(
              'typCisla',
              {
                type: 'string',
                title: 'Vyberte, ktorú možnosť chcete vyplniť',
                required: true,
                items: [
                  { value: 'supisneOrientacneCislo', label: 'Súpisné/orientačné číslo' },
                  { value: 'parcelneCislo', label: 'Parcelné číslo' },
                ],
              },
              {
                variant: 'boxed',
                orientations: 'column',
              },
            ),
            conditionalFields(
              createCondition([[['typCisla'], { const: 'Súpisné/orientačné číslo' }]]),
              [
                input(
                  'supisneCislo',
                  { type: 'text', title: 'Súpisné/orientačné číslo', required: true },
                  {},
                ),
              ],
            ),
            conditionalFields(createCondition([[['typCisla'], { const: 'Parcelné číslo' }]]), [
              input('parcelneCislo', { type: 'text', title: 'Parcelné číslo', required: true }, {}),
            ]),
            object('mestoPsc', { required: true }, {}, [
              input(
                'mesto',
                { type: 'text', title: 'Mesto', required: true },
                { selfColumn: '3/4' },
              ),
              input(
                'psc',
                { type: 'ba-slovak-zip', title: 'PSČ', required: true },
                { selfColumn: '1/4' },
              ),
            ]),
            select(
              'katastralneUzemie',
              {
                title: 'Katastrálne územie',
                required: true,
                items: createCamelCaseItems(
                  [
                    'Čunovo',
                    'Devín',
                    'Devínska Nová Ves',
                    'Dúbravka',
                    'Jarovce',
                    'Karlova Ves',
                    'Lamač',
                    'Nové Mesto',
                    'Vinohrady',
                    'Petržalka',
                    'Podunajské Biskupice',
                    'Rača',
                    'Rusovce',
                    'Ružinov',
                    'Trnávka',
                    'Nivy',
                    'Staré Mesto',
                    'Vajnory',
                    'Vrakuňa',
                    'Záhorská Bystrica',
                  ],
                  false,
                ),
              },
              {},
            ),
            input(
              'stanoviste',
              { type: 'text', title: 'Stanovište' },
              {
                helptext:
                  'Vypíšte v prípade, že sa umiestnenie zberných nádob nezhoduje s adresou nehnuteľnosti',
              },
            ),
            select(
              'druhNehnutelnosti',
              {
                title: 'Druh nehnuteľnosti',
                required: true,
                items: match(oznamovatelTyp)
                  .with('fyzickaOsobaPodnikatel', () => [
                    { value: 'rodinnyDom', label: 'Rodinný dom' },
                    { value: 'byt', label: 'Byt' },
                    {
                      value: 'nehnutelnostNaIndividuálnuRekreáciu',
                      label: 'Nehnuteľnosť na individuálnu rekreáciu',
                    },
                  ])
                  .with(
                    P.union('pravnickaOsoba', 'fyzickaOsoba', 'spravcaSpolocenstvoVlastnikov'),
                    () => [
                      { value: 'nebytovaBudova', label: 'Nebytová budova' },
                      { value: 'inzinierskaStavba', label: 'Inžinierska stavba' },
                      { value: 'ostatneBudovyNaByvanie', label: 'Ostatné budovy na bývanie' },
                      { value: 'nebytovyPriestor', label: 'Nebytový priestor' },
                      { value: 'rodinnyDomPodnikanie', label: 'Rodinný dom + podnikanie' },
                    ],
                  )
                  .exhaustive(),
              },
              {},
            ),
            ...(typOznamenia === 'zmena' || typOznamenia === 'zanik'
              ? [
                  number(
                    'pocetOsob',
                    {
                      type: 'integer',
                      title: match(oznamovatelTyp)
                        .with(
                          'spravcaSpolocenstvoVlastnikov',
                          () => 'Počet osôb žijúcich v bytovom dome',
                        )
                        .with(
                          P.union('fyzickaOsoba', 'fyzickaOsobaPodnikatel', 'pravnickaOsoba'),
                          () => 'Počet osôb užívajúcich nehnuteľnosť',
                        )
                        .exhaustive(),
                      required: true,
                      minimum: 0,
                    },
                    {
                      helptext: match(oznamovatelTyp)
                        .with(
                          'fyzickaOsoba',
                          () =>
                            'Zadajte všetky osoby, ktoré sú oprávnené užívať nehnuteľnosť, vrátane maloletých detí.',
                        )
                        .with(
                          P.union(
                            'spravcaSpolocenstvoVlastnikov',
                            'fyzickaOsobaPodnikatel',
                            'pravnickaOsoba',
                          ),
                          () => 'Zadajte všetky osoby, ktoré sú oprávnené užívať nehnuteľnosť.',
                        )
                        .exhaustive(),
                    },
                  ),
                ]
              : []),
            typOznamenia === 'vznik' && oznamovatelTyp === 'spravcaSpolocenstvoVlastnikov'
              ? number(
                  'pocetBytovychJednotiek',
                  {
                    type: 'integer',
                    title: 'Počet bytových jednotiek v predmetnej nehnuteľnosti',
                    required: true,
                    minimum: 0,
                  },
                  {
                    helptext: 'Zadajte všetky osoby, ktoré sú oprávnené užívať nehnuteľnosť.',
                  },
                )
              : null,
            typOznamenia === 'zmena' || typOznamenia === 'zanik'
              ? textArea(
                  'dovod',
                  {
                    title: match(typOznamenia)
                      .with('zmena', () => 'Dôvod zmeny')
                      .with('zanik', () => 'Dôvod zániku')
                      .exhaustive(),
                    required: true,
                  },
                  {
                    helptext: match(typOznamenia)
                      .with('zmena', () => 'Popíšte dôvod zmeny')
                      .with('zanik', () => 'Popíšte dôvod zániku')
                      .exhaustive(),
                  },
                )
              : null,
          ],
        ),
    ),
    conditionalStep(
      'poplatnici',
      createCondition([[['oznamovatel', 'oznamovatelTyp'], { const: 'fyzickaOsoba' }]]),
      {
        title: 'Údaje o všetkých poplatníkoch, ktorí užívajú danú nehnuteľnosť',
        description:
          'Pre správne vyrubenie poplatku za komunálny odpad uveďte všetky osoby žijúce v danej nehnuteľnosti (s prechodným či trvalým pobytom) alebo osoby oprávnené ju užívať, vrátane maloletých detí.',
      },
      [
        arrayField(
          'poplatnici',
          { title: 'Poplatníci', required: true },
          {
            variant: 'topLevel',
            addButtonLabel: 'Pridať ďalšieho poplatníka',
            itemTitle: 'Poplatník č. {index}',
          },
          [
            object('menoPriezvisko', { required: true }, {}, [
              input('meno', { title: 'Meno', required: true, type: 'text' }, { selfColumn: '2/4' }),
              input(
                'priezvisko',
                { title: 'Priezvisko', required: true, type: 'text' },
                { selfColumn: '2/4' },
              ),
            ]),
            input('titul', { type: 'text', title: 'Titul' }, {}),
            input('rodneCislo', { type: 'text', title: 'Rodné číslo', required: true }, {}),
            radioGroup(
              'zhodujeSaAdresa',
              {
                type: 'boolean',
                title:
                  'Zhoduje sa adresa trvalého alebo prechodného pobytu poplatníka s adresou miesta odvozu, na ktorú sa táto žiadosť vzťahuje?',
                required: true,
                items: [
                  { value: true, label: 'Áno', isDefault: true },
                  { value: false, label: 'Nie' },
                ],
              },
              {
                variant: 'boxed',
                orientations: 'row',
              },
            ),
            conditionalFields(
              createCondition([[['zhodujeSaAdresa'], { const: false }]]),
              adresaFields,
            ),
          ],
        ),
      ],
    ),
    ...createCombinations(
      {
        typOznamenia: ['vznik', 'zmena'] as const,
        oznamovatelTyp: [
          'fyzickaOsoba',
          'spravcaSpolocenstvoVlastnikov',
          'fyzickaOsobaPodnikatel',
          'pravnickaOsoba',
        ] as const,
      },
      ({ typOznamenia, oznamovatelTyp }) =>
        conditionalStep(
          'komunalnyOdpad',
          createCondition([
            [['typOznamenia', 'typOznamenia'], { const: typOznamenia }],
            [['oznamovatel', 'oznamovatelTyp'], { const: oznamovatelTyp }],
          ]),
          { title: 'Komunálny odpad' },
          [
            ...(typOznamenia === 'vznik' ? getKomunalNove(oznamovatelTyp) : []),
            ...(typOznamenia === 'zmena' ? getKomunalZmena(oznamovatelTyp) : []),
          ],
        ),
    ),
    ...createCombinations(
      {
        typOdpadu: [
          'biologickyRozlozitelnyOdpadZoZahrad',
          'biologickyRozlozitelnyOdpadZKuchyne',
        ] as const,
        typOznamenia: ['vznik', 'zmena'] as const,
        oznamovatelTyp: ['fyzickaOsoba', 'spravcaSpolocenstvoVlastnikov'] as const,
      },
      ({ typOznamenia, oznamovatelTyp, typOdpadu }) =>
        conditionalStep(
          typOdpadu,
          createCondition([
            [['typOznamenia', 'typOznamenia'], { const: typOznamenia }],
            [['oznamovatel', 'oznamovatelTyp'], { const: oznamovatelTyp }],
          ]),
          {
            title: match(typOdpadu)
              .with(
                'biologickyRozlozitelnyOdpadZoZahrad',
                () => 'Biologicky rozložiteľný odpad zo záhrad',
              )
              .with(
                'biologickyRozlozitelnyOdpadZKuchyne',
                () => 'Biologicky rozložiteľný odpad z kuchyne',
              )
              .exhaustive(),
          },
          [
            object(
              'nadoba',
              { required: true },
              {
                objectDisplay: 'boxed',
                title: 'Nádoba',
                description: match([typOdpadu, oznamovatelTyp])
                  .with(
                    [
                      'biologickyRozlozitelnyOdpadZoZahrad',
                      P.union('fyzickaOsoba', 'spravcaSpolocenstvoVlastnikov'),
                    ],
                    () =>
                      'Pre biologicky rozložiteľný odpad zo záhrad si môžete vybrať iba objem nádoby. Frekvencia odvozu aj počet nádob (1 nádoba) sú pevne stanovené. Informácie o frekvencii odvozu nájdete na [webstránke OLO](https://olo.sk/).',
                  )
                  .with(
                    ['biologickyRozlozitelnyOdpadZKuchyne', 'fyzickaOsoba'],
                    () =>
                      'Pre biologicky rozložiteľný odpad z kuchyne je objem nádoby, frekvencia odvozu aj počet nádob (1 nádoba) pevne stanovená. Informácie o frekvencii odvozu nájdete na [webstránke OLO](https://olo.sk/).',
                  )
                  .with(
                    ['biologickyRozlozitelnyOdpadZKuchyne', 'spravcaSpolocenstvoVlastnikov'],
                    () =>
                      'Pre biologicky rozložiteľný odpad z kuchyne si môžete vybrať iba objem nádoby. Frekvencia odvozu aj počet nádob (1 nádoba) sú pevne stanovené. Informácie o frekvencii odvozu nájdete na [webstránke OLO](https://olo.sk/).',
                  )
                  .exhaustive(),
                descriptionMarkdown: true,
              },
              [
                ...match({ typOdpadu, oznamovatelTyp, typOznamenia })
                  .with(
                    {
                      typOdpadu: 'biologickyRozlozitelnyOdpadZKuchyne',
                      oznamovatelTyp: 'fyzickaOsoba',
                    },
                    () => [
                      select(
                        '',
                        {
                          title: 'Objem nádoby',
                          required: true,
                          items: [
                            {
                              value: '20az23LZbernaNadoba',
                              label: '20-23l zberná nádoba',
                              isDefault: true,
                            },
                          ],
                        },
                        {},
                      ),
                    ],
                  )
                  .with(
                    {
                      typOznamenia: 'zmena',
                    },
                    () => [
                      radioGroup(
                        'zmena',
                        {
                          type: 'boolean',
                          title: 'Chcete zmeniť objem existujúcej nádoby?',
                          required: true,
                          items: [
                            { value: true, label: 'Áno' },
                            { value: false, label: 'Nie' },
                          ],
                        },
                        {
                          variant: 'boxed',
                          orientations: 'row',
                        },
                      ),
                      conditionalFields(createCondition([[['zmena'], { const: true }]]), [
                        select(
                          'povodnyObjemNadoby',
                          {
                            title: 'Pôvodný objem nádoby',
                            required: true,
                            items: [
                              {
                                value: '120LZbernaNadoba',
                                label: '120 l zberná nádoba',
                                isDefault: true,
                              },
                              { value: '240LZbernaNadoba', label: '240 l zberná nádoba' },
                            ],
                          },
                          {},
                        ),
                        select(
                          'novyObjemNadoby',
                          {
                            title: 'Nový objem nádoby',
                            required: true,
                            items: [
                              { value: '120LZbernaNadoba', label: '120 l zberná nádoba' },
                              { value: '240LZbernaNadoba', label: '240 l zberná nádoba' },
                            ],
                          },
                          {},
                        ),
                      ]),
                    ],
                  )
                  .with({ typOznamenia: 'vznik' }, () => [
                    select(
                      'objemNadoby',
                      {
                        title: 'Objem nádoby',
                        required: true,
                        items: [
                          { value: '120LZbernaNadoba', label: '120 l zberná nádoba' },
                          {
                            value: '240LZbernaNadoba',
                            label: '240 l zberná nádoba',
                            isDefault: true,
                          },
                          { value: 'kompostovaci', label: 'Kompostovací zásobník' },
                        ],
                      },
                      {},
                    ),
                  ])
                  .exhaustive(),
              ],
            ),
          ],
        ),
    ),
    conditionalStep(
      'sposobPlatby',
      createCondition([[['typOznamenia', 'typOznamenia'], { enum: ['vznik', 'zmena'] }]]),
      { title: 'Spôsob platby' },
      [
        radioGroup(
          'sposobPlatby',
          {
            type: 'string',
            title: 'Spôsob platby',
            required: true,
            items: [
              {
                value: 'bezhotovostnyPrevod',
                label: 'Bezhotovostným prevodom na účet správcu poplatku',
              },
              {
                value: 'sepaInkaso',
                label: 'Prostredníctvom SEPA inkasného príkazu',
                description: 'Pre správne nastavenie budete kontaktovaný správcom daní.',
              },
              {
                value: 'sipo',
                label:
                  'Poštovým peňažným poukazom na príslušný účet správcu poplatku - prostredníctvom SIPO',
              },
              {
                value: 'hotovost',
                label: 'Pri platbách do 300 EUR v hotovosti do pokladne správcu poplatku',
              },
            ],
          },
          { variant: 'boxed', orientations: 'column' },
        ),
        conditionalFields(createCondition([[['sposobPlatby'], { const: 'sepaInkaso' }]]), [
          input('iban', { type: 'ba-iban', title: 'Zadajte váš IBAN', required: true }, {}),
        ]),
        conditionalFields(
          createCondition([
            [
              ['sposobPlatby'],
              {
                const: 'sipo',
              },
            ],
          ]),
          [
            input(
              'sipo',
              { type: 'text', title: 'Zadajte číslo SIPO', required: true },
              {
                helptext:
                  'SIPO číslo nájdete na platobnom doklade SIPO (šeku) alebo kontaktujte svoju poštu pre jeho správne nastavenie.',
              },
            ),
          ],
        ),
      ],
    ),
    ...(
      [
        'fyzickaOsoba',
        'spravcaSpolocenstvoVlastnikov',
        ['fyzickaOsobaPodnikatel', 'pravnickaOsoba'],
      ] as const
    ).map((osobaTypy) =>
      conditionalStep(
        'prilohy',
        createCondition([
          [['typOznamenia', 'typOznamenia'], { enum: ['vznik', 'zmena'] }],
          [
            ['oznamovatel', 'oznamovatelTyp'],
            match(osobaTypy)
              .with(P.string, (matchedValue) => ({
                const: matchedValue,
              }))
              .with(P.array(P.string), (matchedValue) => ({
                enum: [...matchedValue],
              }))
              .exhaustive(),
          ],
        ]),
        { title: 'Prílohy' },
        [
          fileUploadMultiple(
            'prilohy',
            { title: 'Prílohy', required: true },
            {
              helptext: match(osobaTypy)
                .with(
                  'fyzickaOsoba',
                  () => `Na overenie vami zadaných informácií nahrajte aspoň jednu z príloh, ktorá preukazuje váš vzťah k nehnuteľnosti, napríklad:
- list vlastníctva
- kúpna zmluva
- osvedčenie o dedičstve
- nájomná zmluva
- preberací protokol
- úmrtný list

V prípade potreby ďalších informácií vás bude kontaktovať správca daní.`,
                )
                .with(
                  'spravcaSpolocenstvoVlastnikov',
                  () => `Na overenie vami zadaných informácií nahrajte aspoň jednu z príloh, ktorá preukazuje váš vzťah k nehnuteľnosti, napríklad:
- list vlastníctva
- zmluva o výkone správy
- zmluva o spoločenstve

V prípade potreby ďalších informácií vás bude kontaktovať správca daní.`,
                )
                .with(
                  ['fyzickaOsobaPodnikatel', 'pravnickaOsoba'],
                  () => `Na overenie vami zadaných informácií  nahrajte aspoň jednu z príloh, ktorá preukazuje váš vzťah k nehnuteľnosti, napríklad:
- list vlastníctva
- kúpna zmluva
- nájomná zmluva
- iná príloha, ktorá preukazuje vzťah k nehnuteľnosti

V prípade potreby ďalších informácií vás bude kontaktovať správca daní.`,
                )
                .exhaustive(),
              helptextMarkdown: true,
            },
          ),
        ],
      ),
    ),
  ],
)

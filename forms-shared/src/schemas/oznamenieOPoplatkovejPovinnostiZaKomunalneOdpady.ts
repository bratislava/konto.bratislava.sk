import { createCondition } from '../generator/helpers'
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
import { checkboxGroup } from '../generator/functions/checkboxGroup'
import { esbsKatastralneUzemiaCiselnik } from '../tax-form/mapping/shared/esbsCiselniky'

const komunalnyOdpadOptions = {
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
        ],
      },
      {
        condition: (objemNadobyProperty: string) => ({
          not: {
            required: [objemNadobyProperty],
          },
        }),
        items: [{ value: '', label: '' }],
        disabled: true,
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
        condition: (objemNadobyProperty: string) => ({
          not: {
            required: [objemNadobyProperty],
          },
        }),
        items: [{ value: '', label: '' }],
        disabled: true,
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
        condition: (objemNadobyProperty: string, pocetNadobProperty: string) => ({
          anyOf: [
            createCondition([
              [[objemNadobyProperty], { enum: ['120LZbernaNadoba', '240LZbernaNadoba'] }],
              [[pocetNadobProperty], { maximum: 1 }],
            ]),
            {
              ...createCondition([
                [[objemNadobyProperty], { enum: ['120LZbernaNadoba', '240LZbernaNadoba'] }],
              ]),
              not: { required: [pocetNadobProperty] },
            },
          ],
        }),
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
        condition: (objemNadobyProperty: string) => ({
          not: {
            required: [objemNadobyProperty],
          },
        }),
        items: [{ value: '', label: '' }],
        disabled: true,
      },
    ],
  },
  pravnickaOsoba: {
    objemy: [
      { value: '120LZbernaNadoba', label: '120 l zberná nádoba' },
      { value: '240LZbernaNadoba', label: '240 l zberná nádoba' },
      { value: 'kontajner1100L', label: 'Kontajner 1100 l' },
      { value: 'lisovaciKontajner10000L', label: 'Lisovací kontajner 10 000 l' },
      { value: 'lisovaciKontajner13000L', label: 'Lisovací kontajner 13 000 l' },
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
        condition: (objemNadobyProperty: string, pocetNadobProperty: string) => ({
          anyOf: [
            createCondition([
              [[objemNadobyProperty], { enum: ['120LZbernaNadoba', '240LZbernaNadoba'] }],
              [[pocetNadobProperty], { maximum: 1 }],
            ]),
            {
              ...createCondition([
                [[objemNadobyProperty], { enum: ['120LZbernaNadoba', '240LZbernaNadoba'] }],
              ]),
              not: { required: [pocetNadobProperty] },
            },
          ],
        }),
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
        condition: (objemNadobyProperty: string) => ({
          not: {
            required: [objemNadobyProperty],
          },
        }),
        items: [{ value: '', label: '' }],
        disabled: true,
      },
    ],
  },
}

const getKomunalnyOdpadNadoby = (
  typZmeny: 'vznikZanik' | 'zmena',
  oznamovatelTyp:
    | 'fyzickaOsoba'
    | 'spravcaSpolocenstvoVlastnikov'
    | 'fyzickaOsobaPodnikatel'
    | 'pravnickaOsoba',
) => {
  return [
    match(typZmeny)
      .with('zmena', () =>
        select(
          'povodnyObjemNadoby',
          {
            title: 'Pôvodný objem nádoby',
            required: true,
            items: komunalnyOdpadOptions[oznamovatelTyp].objemy,
          },
          { selfColumn: '2/4' },
        ),
      )
      .otherwise(() => null),
    select(
      match(typZmeny)
        .with('vznikZanik', () => 'objemNadoby')
        .with('zmena', () => 'novyObjemNadoby')
        .exhaustive(),
      {
        title: match(typZmeny)
          .with('vznikZanik', () => 'Objem nádoby')
          .with('zmena', () => 'Nový objem nádoby')
          .exhaustive(),
        required: true,
        items: komunalnyOdpadOptions[oznamovatelTyp].objemy,
      },
      { selfColumn: '2/4' },
    ),
    match(typZmeny)
      .with('zmena', () =>
        number(
          'povodnyPocetNadob',
          {
            type: 'integer',
            title: 'Pôvodný počet nádob',
            required: true,
            minimum: 1,
          },
          { selfColumn: '2/4' },
        ),
      )
      .otherwise(() => null),
    number(
      'pocetNadob',
      {
        type: 'integer',
        title: match(typZmeny)
          .with('vznikZanik', () => 'Počet nádob')
          .with('zmena', () => 'Nový počet nádob')
          .exhaustive(),
        required: true,
        minimum: 1,
      },
      { selfColumn: '2/4' },
    ),
    ...match(typZmeny)
      .with('zmena', () =>
        komunalnyOdpadOptions[oznamovatelTyp].frekvencie.map(({ condition, items, disabled }) =>
          conditionalFields(condition('povodnyObjemNadoby', 'povodnyPocetNadob'), [
            select(
              'povodnaFrekvenciaOdvozu',
              {
                title: 'Pôvodná frekvencia odvozu',
                required: true,
                items,
                disabled,
              },
              { selfColumn: '2/4' },
            ),
          ]),
        ),
      )
      .otherwise(() => []),
    ...komunalnyOdpadOptions[oznamovatelTyp].frekvencie.map(({ condition, items, disabled }) =>
      conditionalFields(
        condition(
          match(typZmeny)
            .with('vznikZanik', () => 'objemNadoby')
            .with('zmena', () => 'novyObjemNadoby')
            .exhaustive(),
          match(typZmeny)
            .with('vznikZanik', () => 'pocetNadob')
            .with('zmena', () => 'novyPocetNadob')
            .exhaustive(),
        ),
        [
          select(
            match(typZmeny)
              .with('vznikZanik', () => 'frekvenciaOdvozu')
              .with('zmena', () => 'novaFrekvenciaOdvozu')
              .exhaustive(),
            {
              title: match(typZmeny)
                .with('vznikZanik', () => 'Frekvencia odvozu')
                .with('zmena', () => 'Nová frekvencia odvozu')
                .exhaustive(),
              required: true,
              disabled,
              items,
            },
            { selfColumn: '2/4' },
          ),
        ],
      ),
    ),
  ]
}

const getBioOdpadNadobaItems = ({
  typOdpadu,
  oznamovatelTyp,
}: {
  typOdpadu: 'biologickyRozlozitelnyOdpadZoZahrad' | 'biologickyRozlozitelnyOdpadZKuchyne'
  oznamovatelTyp: 'fyzickaOsoba' | 'spravcaSpolocenstvoVlastnikov'
}) =>
  match({ typOdpadu, oznamovatelTyp })
    .with(
      {
        typOdpadu: 'biologickyRozlozitelnyOdpadZKuchyne',
        oznamovatelTyp: 'fyzickaOsoba',
      },
      () => [
        {
          value: '20az23LZbernaNadoba',
          label: '20-23l zberná nádoba',
          isDefault: true,
        },
      ],
    )
    .with({ typOdpadu: 'biologickyRozlozitelnyOdpadZoZahrad' }, () => [
      { value: '120LZbernaNadoba', label: '120 l zberná nádoba' },
      { value: '240LZbernaNadoba', label: '240 l zberná nádoba' },
      { value: 'kompostovaciZasobnik', label: 'Kompostovací zásobník' },
    ])
    .with({ typOdpadu: 'biologickyRozlozitelnyOdpadZKuchyne' }, () => [
      { value: '120LZbernaNadoba', label: '120 l zberná nádoba' },
      { value: '240LZbernaNadoba', label: '240 l zberná nádoba' },
    ])
    .exhaustive()

const getVznikKomunalnyOdpadFields = (
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
        addButtonLabel: 'Pridať ďalšiu nádobu',
        itemTitle: 'Nádoba č. {index}',
      },
      getKomunalnyOdpadNadoby('vznikZanik', oznamovatelTyp),
    ),
    input(
      'poznamka',
      { title: 'Poznámka', type: 'text' },
      { helptext: 'Tu môžete napísať doplnkové informácie' },
    ),
  ]
}

const getZmenaKomunalnyOdpadFields = (
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
          { value: false, label: 'Nie', isDefault: true },
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
          addButtonLabel: 'Pridať ďalšiu nádobu',
          itemTitle: 'Nová nádoba č. {index}',
        },
        getKomunalnyOdpadNadoby('vznikZanik', oznamovatelTyp),
      ),
    ]),
    radioGroup(
      'zmena',
      {
        type: 'boolean',
        title: 'Chcete zmeniť parametre svojich nádob?',
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
    conditionalFields(createCondition([[['zmena'], { const: true }]]), [
      arrayField(
        'nadobyZmena',
        { title: 'Nádoby na zmenu parametrov', required: true },
        {
          variant: 'topLevel',
          addButtonLabel: 'Pridať ďalšiu nádobu',
          itemTitle: 'Nádoba na zmenu č. {index}',
          description:
            'Zmena bude posudená sekciou životného prostredia podľa [VZN 18/2023](https://bratislava.sk/vzn/18-2023).',
          descriptionMarkdown: true,
        },
        getKomunalnyOdpadNadoby('zmena', oznamovatelTyp),
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
          { value: false, label: 'Nie', isDefault: true },
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
          addButtonLabel: 'Pridať ďalšiu nádobu',
          itemTitle: 'Nádoba na zrušenie č. {index}',
          description:
            'Zmena bude posudená sekciou životného prostredia podľa [VZN 18/2023](https://bratislava.sk/vzn/18-2023).',
          descriptionMarkdown: true,
        },
        getKomunalnyOdpadNadoby('vznikZanik', oznamovatelTyp),
      ),
    ]),
    input(
      'poznamka',
      { title: 'Poznámka', type: 'text' },
      { helptext: 'Tu môžete napísať doplnkové informácie' },
    ),
  ]
}

const getAdresaFields = (title: string, postfix: string = '') => [
  input(
    `ulicaACislo${postfix}`,
    { title, required: true, type: 'text' },
    { helptext: 'Vyplňte ulicu a číslo' },
  ),
  input(`mesto${postfix}`, { type: 'text', title: 'Mesto', required: true }, { selfColumn: '3/4' }),
  input(
    `psc${postfix}`,
    // No validation for ZIP code, because it is not only Slovak one.
    { type: 'text', title: 'PSČ', required: true },
    { selfColumn: '1/4' },
  ),
  select(
    `stat${postfix}`,
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
          input('ico', { type: 'ba-ico', title: 'IČO', required: true }, { size: 'medium' }),
        ],
      )
      .otherwise(() => []),
    input('email', { title: 'Email', required: true, type: 'email' }, {}),
    input(
      'telefon',
      { type: 'ba-phone-number', title: 'Telefónne číslo', required: true },
      { size: 'medium', placeholder: '+421', helptext: 'Vyplňte vo formáte +421' },
    ),
    ...getAdresaFields(
      match(osobaTyp)
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
        conditionalFields(
          createCondition([[['maPrechodnyPobyt'], { const: true }]]),
          getAdresaFields('Adresa prechodného pobytu', 'PrechodnyPobyt'),
        ),
      ])
      .otherwise(() => []),
  ]
}

export default schema(
  {
    title: 'Oznámenie o poplatkovej povinnosti za komunálne odpady',
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
            { value: 'vznik', label: 'Vznik poplatkovej povinnosti', isDefault: true },
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
                type: 'dragAndDrop',
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
                  { value: 'fyzickaOsoba', label: 'Fyzická osoba', isDefault: true },
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
            { value: 'fyzickaOsoba', label: 'Fyzická osoba', isDefault: true },
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
                    { value: 'zastupca', label: 'zástupca' },
                    { value: 'statutarnyOrgan', label: 'štatutárny orgán' },
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
      ...[
        {
          condition: createCondition([
            [['oznamovatelTyp'], { const: 'fyzickaOsoba' }],
            [['maElektronickuSchranku'], { const: false }],
            [['maPrechodnyPobyt'], { const: true }],
          ]),
          items: [
            { value: 'adresaTrvalehoPobytu', label: 'Adresa trvalého pobytu', isDefault: true },
            { value: 'adresaPrechodnehoPobytu', label: 'Adresa prechodného pobytu' },
            { value: 'inaAdresa', label: 'Iná adresa' },
          ],
        },
        {
          condition: {
            ...createCondition([
              [['oznamovatelTyp'], { const: 'fyzickaOsoba' }],
              [['maElektronickuSchranku'], { const: false }],
            ]),
            anyOf: [
              createCondition([[['maPrechodnyPobyt'], { const: false }]]),
              { not: { required: ['maPrechodnyPobyt'] } },
            ],
          },
          items: [
            { value: 'adresaTrvalehoPobytu', label: 'Adresa trvalého pobytu', isDefault: true },
            { value: 'inaAdresa', label: 'Iná adresa' },
          ],
        },
        {
          condition: createCondition([
            [
              ['oznamovatelTyp'],
              {
                enum: ['spravcaSpolocenstvoVlastnikov', 'fyzickaOsobaPodnikatel', 'pravnickaOsoba'],
              },
            ],
            [['maElektronickuSchranku'], { const: false }],
          ]),
          items: [
            { value: 'adresaSidla', label: 'Adresa sídla', isDefault: true },
            { value: 'inaAdresa', label: 'Iná adresa' },
          ],
        },
      ].map(({ condition, items }) =>
        conditionalFields(condition, [
          radioGroup(
            'adresaRozhodnutia',
            {
              type: 'string',
              title: 'Na akú adresu má byť doručené rozhodnutie o určení poplatku?',
              required: true,
              items,
            },
            {
              variant: 'boxed',
              orientations: 'column',
            },
          ),
        ]),
      ),
      conditionalFields(
        createCondition([
          [['maElektronickuSchranku'], { const: false }],
          [['adresaRozhodnutia'], { const: 'inaAdresa' }],
        ]),
        getAdresaFields('Iná doručovacia adresa', 'InaDorucovaciaAdresa'),
      ),
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
                title: match(typOznamenia)
                  .with('vznik', () => 'Dátum vzniku poplatkovej povinnosti odo dňa')
                  .with('zmena', () => 'Dátum zmeny poplatkovej povinnosti odo dňa')
                  .with('zanik', () => 'Dátum zániku poplatkovej povinnosti odo dňa')
                  .exhaustive(),
                required: true,
              },
              {
                helptext: match(typOznamenia)
                  .with(
                    'vznik',
                    () =>
                      'Poplatková povinnosť vzniká dňom nadobudnutia práva užívať nehnuteľnosť (napr. kúpa alebo nájom nehnuteľnosti).',
                  )
                  .with(
                    'zmena',
                    () =>
                      'Uveďte požadovaný dátum, od ktorého chcete, aby zmena nadobudla účinnosť.',
                  )
                  .with(
                    'zanik',
                    () =>
                      'Poplatková povinnosť za komunálny odpad zaniká dňom, keď prestanete užívať nehnuteľnosť (napr. odsťahovanie, predaj nehnuteľnosti, úmrtie, zmena správcu bytového domu).',
                  )
                  .exhaustive(),
                size: 'medium',
              },
            ),
            input(
              'odvozneMiesto',
              {
                type: 'text',
                title: match(oznamovatelTyp)
                  .with('spravcaSpolocenstvoVlastnikov', () => 'Odvozné miesto pre bytový dom')
                  .with(
                    P.union('fyzickaOsoba', 'fyzickaOsobaPodnikatel', 'pravnickaOsoba'),
                    () => 'Odvozné miesto',
                  )
                  .exhaustive(),
                required: true,
              },
              { helptext: 'Vypíšte názov ulice' },
            ),
            checkboxGroup(
              'typCisla',
              {
                title: 'Vyberte, ktoré možnosti chcete vyplniť',
                required: true,
                items: [
                  {
                    value: 'supisneOrientacneCislo',
                    label: 'Súpisné/orientačné číslo',
                    isDefault: true,
                  },
                  { value: 'parcelneCislo', label: 'Parcelné číslo' },
                ],
              },
              {
                variant: 'boxed',
              },
            ),
            conditionalFields(
              createCondition([[['typCisla'], { contains: { const: 'supisneOrientacneCislo' } }]]),
              [
                input(
                  'supisneCislo',
                  { type: 'text', title: 'Súpisné/orientačné číslo', required: true },
                  { size: 'medium' },
                ),
              ],
            ),
            conditionalFields(
              createCondition([[['typCisla'], { contains: { const: 'parcelneCislo' } }]]),
              [
                input(
                  'parcelneCislo',
                  { type: 'text', title: 'Parcelné číslo', required: true },
                  { size: 'medium' },
                ),
              ],
            ),
            input('mesto', { type: 'text', title: 'Mesto', required: true }, { selfColumn: '3/4' }),
            input(
              'psc',
              { type: 'ba-slovak-zip', title: 'PSČ', required: true },
              { selfColumn: '1/4' },
            ),
            select(
              'katastralneUzemie',
              {
                title: 'Katastrálne územie',
                required: true,
                items: esbsKatastralneUzemiaCiselnik.map(({ Name, Code }) => ({
                  value: Code,
                  label: Name,
                })),
              },
              {},
            ),
            input(
              'stanoviste',
              { type: 'text', title: 'Stanovište' },
              {
                helptext:
                  'Vypíšte v prípade, že sa umiestnenie zberných nádob nezhoduje s adresou nehnuteľnosti.',
              },
            ),
            match(oznamovatelTyp)
              .with(
                P.union('fyzickaOsoba', 'pravnickaOsoba', 'fyzickaOsobaPodnikatel'),
                (oznamovatelTypInner) =>
                  select(
                    'druhNehnutelnosti',
                    {
                      title: 'Druh nehnuteľnosti',
                      required: true,
                      items: match(oznamovatelTypInner)
                        .with('fyzickaOsoba', () => [
                          { value: 'rodinnyDom', label: 'rodinný dom' },
                          {
                            value: 'nehnutelnostNaIndividualnuRekreáciu',
                            label: 'nehnuteľnosť na individuálnu rekreáciu',
                          },
                        ])
                        .with(P.union('pravnickaOsoba', 'fyzickaOsobaPodnikatel'), () => [
                          { value: 'nebytovaBudova', label: 'nebytová budova' },
                          { value: 'inzinierskaStavba', label: 'inžinierska stavba' },
                          { value: 'ostatneBudovyNaByvanie', label: 'ostatné budovy na bývanie' },
                          { value: 'nebytovyPriestor', label: 'nebytový priestor' },
                          { value: 'rodinnyDomPodnikanie', label: 'rodinný dom + podnikanie' },
                        ])
                        .exhaustive(),
                    },
                    {},
                  ),
              )
              .otherwise(() => null),
            match({ oznamovatelTyp, typOznamenia })
              .with(
                {
                  oznamovatelTyp: P.union(
                    'fyzickaOsoba',
                    'spravcaSpolocenstvoVlastnikov',
                    'fyzickaOsobaPodnikatel',
                  ),
                  typOznamenia: P.union('vznik', 'zmena'),
                },
                (matchInner) =>
                  number(
                    'pocetOsob',
                    {
                      type: 'integer',
                      title: match(matchInner.oznamovatelTyp)
                        .with(
                          'spravcaSpolocenstvoVlastnikov',
                          () => 'Počet osôb žijúcich v bytovom dome',
                        )
                        .with(
                          P.union('fyzickaOsoba', 'fyzickaOsobaPodnikatel'),
                          () => 'Počet osôb užívajúcich nehnuteľnosť',
                        )
                        .exhaustive(),
                      required: true,
                      minimum: 1,
                    },
                    {
                      helptext: match(matchInner.oznamovatelTyp)
                        .with(
                          'fyzickaOsoba',
                          () =>
                            'Zadajte všetky osoby, ktoré sú oprávnené užívať nehnuteľnosť, vrátane maloletých detí.',
                        )
                        .with(
                          P.union('spravcaSpolocenstvoVlastnikov', 'fyzickaOsobaPodnikatel'),
                          () => 'Zadajte všetky osoby, ktoré sú oprávnené užívať nehnuteľnosť.',
                        )
                        .exhaustive(),
                      size: 'medium',
                    },
                  ),
              )
              .otherwise(() => null),
            match({ typOznamenia, oznamovatelTyp })
              .with(
                { typOznamenia: 'vznik', oznamovatelTyp: 'spravcaSpolocenstvoVlastnikov' },
                () =>
                  number(
                    'pocetBytovychJednotiek',
                    {
                      type: 'integer',
                      title: 'Počet bytových jednotiek v predmetnej nehnuteľnosti',
                      required: true,
                      minimum: 1,
                    },
                    {
                      size: 'medium',
                    },
                  ),
              )
              .otherwise(() => null),
            match(typOznamenia)
              .with(P.union('zmena', 'zanik'), (innerTypOznamenia) =>
                textArea(
                  'dovod',
                  {
                    title: match(innerTypOznamenia)
                      .with('zmena', () => 'Dôvod zmeny')
                      .with('zanik', () => 'Dôvod zániku')
                      .exhaustive(),
                    required: true,
                  },
                  {
                    helptext: match(innerTypOznamenia)
                      .with('zmena', () => 'Popíšte dôvod zmeny')
                      .with('zanik', () => 'Popíšte dôvod zániku')
                      .exhaustive(),
                  },
                ),
              )
              .otherwise(() => null),
          ],
        ),
    ),
    conditionalStep(
      'poplatnici',
      createCondition([
        [['typOznamenia', 'typOznamenia'], { enum: ['vznik', 'zmena'] }],
        [['oznamovatel', 'oznamovatelTyp'], { const: 'fyzickaOsoba' }],
      ]),
      {
        title: 'Údaje o všetkých poplatníkoch, ktorí užívajú danú nehnuteľnosť',
        stepperTitle: 'Údaje o poplatníkoch',
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
            input('meno', { title: 'Meno', required: true, type: 'text' }, { selfColumn: '2/4' }),
            input(
              'priezvisko',
              { title: 'Priezvisko', required: true, type: 'text' },
              { selfColumn: '2/4' },
            ),
            input('titul', { type: 'text', title: 'Titul' }, { size: 'medium' }),
            input(
              'rodneCislo',
              { type: 'text', title: 'Rodné číslo', required: true },
              { size: 'medium' },
            ),
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
              getAdresaFields('Adresa trvalého/prechodného pobytu'),
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
          match(typOznamenia)
            .with('vznik', () => getVznikKomunalnyOdpadFields(oznamovatelTyp))
            .with('zmena', () => getZmenaKomunalnyOdpadFields(oznamovatelTyp))
            .exhaustive(),
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
                      'Pre biologicky rozložiteľný odpad zo záhrad si môžete vybrať iba objem nádoby. Frekvencia odvozu aj počet nádob (1 nádoba) sú pevne stanovené. Informácie o frekvencii odvozu nájdete na [webstránke OLO](https://www.olo.sk/odpad/zistite-si-svoj-odvozovy-den).',
                  )
                  .with(
                    ['biologickyRozlozitelnyOdpadZKuchyne', 'fyzickaOsoba'],
                    () =>
                      'Pre biologicky rozložiteľný odpad z kuchyne je objem nádoby, frekvencia odvozu aj počet nádob (1 nádoba) pevne stanovená. Informácie o frekvencii odvozu nájdete na [webstránke OLO](https://www.olo.sk/odpad/zistite-si-svoj-odvozovy-den).',
                  )
                  .with(
                    ['biologickyRozlozitelnyOdpadZKuchyne', 'spravcaSpolocenstvoVlastnikov'],
                    () =>
                      'Pre biologicky rozložiteľný odpad z kuchyne si môžete vybrať iba objem nádoby. Frekvencia odvozu aj počet nádob (1 nádoba) sú pevne stanovené. Informácie o frekvencii odvozu nájdete na [webstránke OLO](https://www.olo.sk/odpad/zistite-si-svoj-odvozovy-den).',
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
                    (matchInner) => [
                      select(
                        'objemNadoby',
                        {
                          title: 'Objem nádoby',
                          required: true,
                          items: getBioOdpadNadobaItems(matchInner),
                          disabled: true,
                        },
                        { selfColumn: '2/4' },
                      ),
                    ],
                  )
                  .with(
                    {
                      typOznamenia: 'zmena',
                    },
                    (matchInner) => {
                      return [
                        radioGroup(
                          'zmena',
                          {
                            type: 'boolean',
                            title: 'Chcete zmeniť objem vašej nádoby?',
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
                        conditionalFields(createCondition([[['zmena'], { const: true }]]), [
                          select(
                            'povodnyObjemNadoby',
                            {
                              title: 'Pôvodný objem nádoby',
                              required: true,
                              items: getBioOdpadNadobaItems(matchInner),
                            },
                            { selfColumn: '2/4' },
                          ),
                          select(
                            'novyObjemNadoby',
                            {
                              title: 'Nový objem nádoby',
                              required: true,
                              items: getBioOdpadNadobaItems(matchInner),
                            },
                            { selfColumn: '2/4' },
                          ),
                        ]),
                      ]
                    },
                  )
                  .with({ typOznamenia: 'vznik' }, (matchInner) => [
                    select(
                      'objemNadoby',
                      {
                        title: 'Objem nádoby',
                        required: true,
                        items: getBioOdpadNadobaItems(matchInner),
                      },
                      { selfColumn: '2/4' },
                    ),
                  ])
                  .exhaustive(),
              ],
            ),
            input(
              'poznamka',
              { title: 'Poznámka', type: 'text' },
              { helptext: 'Tu môžete napísať doplnkové informácie' },
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
                size: 'medium',
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
              type: 'dragAndDrop',
              helptext: match(osobaTypy)
                .with(
                  'fyzickaOsoba',
                  () => `Na overenie vami zadaných informácií nahrajte aspoň jednu z príloh, ktorá preukazuje váš vzťah k nehnuteľnosti, napríklad:
- list vlastníctva
- kúpna zmluva
- darovacia zmluva
- osvedčenie o dedičstve
- nájomná zmluva
- preberací protokol
- úmrtný list
- iná príloha, ktorá preukazuje vzťah k nehnuteľnosti

V prípade potreby ďalších informácií vás bude kontaktovať správca daní.`,
                )
                .with(
                  'spravcaSpolocenstvoVlastnikov',
                  () => `Na overenie vami zadaných informácií nahrajte aspoň jednu z príloh, ktorá preukazuje váš vzťah k nehnuteľnosti, napríklad:
- list vlastníctva
- zmluva o výkone správy
- zmluva o spoločenstve
- iná príloha, ktorá preukazuje vzťah k nehnuteľnosti

V prípade potreby ďalších informácií vás bude kontaktovať správca daní.`,
                )
                .with(
                  ['fyzickaOsobaPodnikatel', 'pravnickaOsoba'],
                  () => `Na overenie vami zadaných informácií nahrajte aspoň jednu z príloh, ktorá preukazuje váš vzťah k nehnuteľnosti, napríklad:
- list vlastníctva
- kúpna zmluva
- darovacia zmluva
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

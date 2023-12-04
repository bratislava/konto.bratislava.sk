import {
  conditionalFields,
  fileUpload,
  input,
  markdownText,
  radioGroup,
  schema,
  step,
} from '../generator/functions'
import { createCondition } from '../generator/helpers'

enum TypRegistracie {
  NEW,
  EXISTING,
}

const predzahradkaFields = (type: TypRegistracie) => [
  input(
    'adresa',
    {
      title:
        type === TypRegistracie.NEW
          ? 'Adresa pozemku, na ktorom si chcete vytvoriť novú predzáhradku'
          : 'Adresa pozemku, na ktorom sa nachádza vaša predzáhradka',
      required: true,
      type: 'text',
    },
    {},
  ),
  input(
    'parcelneCislo',
    { title: 'Číslo parcely', required: true, type: 'text' },
    {
      helptextHeader: markdownText(
        'Na vyhľadanie parcelného čísla môžete využiť portál [ZBGIS](https://zbgis.skgeodesy.sk/mkzbgis/sk/kataster)',
      ),
    },
  ),
  input(
    'rozlozenie',
    {
      title:
        type === TypRegistracie.NEW
          ? 'Popíšte nám plánované rozloženie predzáhradky'
          : 'Popíšte nám rozloženie predzáhradky',
      required: true,
      type: 'text',
    },
    {},
  ),
  fileUpload(
    'projekt',
    { title: 'Projekt predzáhradky' },
    {
      type: 'button',
      helptextHeader:
        'Ak máte projekt predzáhradky, napríklad aj vo forme jednoduchého nákresu rozloženia jednotlivých prvkov, môžete ho nahrať sem. ',
    },
  ),
]

export default schema(
  {
    title: 'Registrácia predzáhradky',
    pospID: '',
    pospVersion: '0.1',
  },
  {},
  [
    step('oVas', { title: 'O vás' }, [
      input('menoAPriezvisko', { title: 'Meno a priezvisko', required: true, type: 'text' }, {}),
      input('adresa', { title: 'Vaša Adresa', required: true, type: 'text' }, {}),
      input('email', { title: 'Email', required: true, type: 'email' }, {}),
      input(
        'telefon',
        { title: 'Telefónne číslo (v tvare +421...)', required: true, type: 'tel' },
        {},
      ),
    ]),

    step(
      'oPredzahradke',
      {
        title: 'O predzáhradke',
      },
      [
        radioGroup(
          'typRegistracie',
          {
            type: 'string',
            title: 'Máte záujem o:',
            required: true,
            options: [
              { value: 'nova', title: 'Vytvorenie novej predzáhradky', isDefault: true },
              { value: 'existujuca', title: 'Registrácia existujúcej predzáhradky' },
            ],
          },
          {
            variant: 'boxed',
            orientations: 'column',
          },
        ),
        conditionalFields(
          createCondition([[['typRegistracie'], { const: 'nova' }]]),
          predzahradkaFields(TypRegistracie.NEW),
          predzahradkaFields(TypRegistracie.EXISTING),
        ),
      ],
    ),
  ],
)

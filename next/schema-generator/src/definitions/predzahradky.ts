import {
  conditionalFields,
  fileUpload,
  input,
  markdownText,
  object,
  radioGroup,
  schema,
  select,
  step,
  textArea,
} from '../generator/functions'
import { createCondition, createStringOptions } from '../generator/helpers'

export default schema(
  {
    title: 'Predzáhradky',
    pospID: '00603481.predzahradky',
    pospVersion: '1.0',
  },
  {
    moreInformationUrl:
      'https://bratislava.sk/zivotne-prostredie-a-vystavba/zelen/udrzba-a-tvorba-zelene/predzahradky',
  },
  [
    step('ziadatel', { title: 'Žiadateľ' }, [
      object(
        'menoPriezvisko',
        { required: true },
        {
          columns: true,
          columnsRatio: '1/1',
        },
        [
          input('meno', { title: 'Meno', required: true, type: 'text' }, {}),
          input('priezvisko', { title: 'Priezvisko', required: true, type: 'text' }, {}),
        ],
      ),
      object(
        'adresa',
        { required: true },
        { objectDisplay: 'boxed', title: 'Adresa trvalého pobytu' },
        [
          input('ulicaACislo', { title: 'Ulica a číslo', required: true, type: 'text' }, {}),
          object(
            'mestoPsc',
            { required: true },
            {
              columns: true,
              columnsRatio: '3/1',
            },
            [
              input('mesto', { title: 'Mesto', required: true }, {}),
              input('psc', { title: 'PSČ', required: true, format: 'zip' }, {}),
            ],
          ),
        ],
      ),
      input('email', { title: 'E-mail', required: true, type: 'email' }, {}),
      input(
        'telefon',
        { title: 'Telefónne číslo', required: true, type: 'tel' },
        { placeholder: '+421', size: 'medium' },
      ),
    ]),

    step(
      'predzahradka',
      {
        title: 'Predzáhradka',
      },
      [
        radioGroup(
          'typRegistracie',
          {
            type: 'string',
            title: 'Mám záujem o',
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
        input(
          'adresa',
          {
            title: 'Ulica a číslo pozemku, na ktorom chcete vytvoriť predzáhradku',
            required: true,
            type: 'text',
          },
          { helptextHeader: 'Musí sa jednať o mestský pozemok.' },
        ),
        select(
          'mestskaCast',
          {
            title: 'Mestská časť, v ktorej sa pozemok nachádza',
            required: true,
            options: createStringOptions(
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
          { title: 'Číslo parcely', required: true, type: 'text' },
          {
            helptextHeader: markdownText(
              'Číslo parcely a bližšie informácie k pozemku a jeho vlastníkom nájdete na [katastrálnej mape ZBGIS](https://zbgis.skgeodesy.sk/mkzbgis/sk/kataster).',
            ),
            size: 'medium',
          },
        ),
        conditionalFields(createCondition([[['typRegistracie'], { const: 'nova' }]]), [
          textArea(
            'rozlozenieNova',
            {
              title: 'Plánované rozloženie predzáhradky',
              required: true,
            },
            {
              placeholder: 'Popíšte',
            },
          ),
        ]),
        conditionalFields(createCondition([[['typRegistracie'], { const: 'existujuca' }]]), [
          textArea(
            'rozlozenieExistujuca',
            {
              title: 'Rozloženie predzáhradky',
              required: true,
            },
            {
              placeholder: 'Popíšte',
              helptextHeader: 'Popíšte rozloženie jednotlivých prvkov predzáhradky.',
            },
          ),
          input(
            'dobaStarostlivosti',
            { title: 'Ako dlho sa o predzáhradku staráte?', required: true, type: 'text' },
            {},
          ),
        ]),
        textArea(
          'ine',
          { title: 'Iné', required: true },
          {
            placeholder: 'Popíšte',
            helptextHeader:
              'Ak by ste nám chceli ešte niečo v súvislosti s predzáhradkou napísať, tu je na to priestor.',
          },
        ),
      ],
    ),

    step('prilohy', { title: 'Prílohy' }, [
      fileUpload(
        'mapa',
        { title: 'Snímka z mapy so zakreslením miesta predzáhradky', required: true },
        { type: 'dragAndDrop' },
      ),
      fileUpload(
        'fotografie',
        {
          title: 'Fotografie predzáhradky alebo miesta, na ktorom si chcete vytvoriť predzáhradku',
          required: true,
        },
        { type: 'dragAndDrop' },
      ),
      fileUpload(
        'projekt',
        { title: 'Projekt predzáhradky' },
        {
          type: 'dragAndDrop',
          helptextHeader:
            'Napríklad, vo forme jednoduchého nákresu rozloženia jednotlivých prvkov.',
        },
      ),
      fileUpload('inePrilohy', { title: 'Iné' }, { type: 'dragAndDrop' }),
    ]),
  ],
)

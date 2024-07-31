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
import { sharedAddressField, sharedPhoneNumberField } from './shared/fields'

export default schema(
  {
    title: 'Predzáhradky',
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
      sharedAddressField('adresa', 'Adresa trvalého pobytu', true),
      input('email', { title: 'E-mail', required: true, type: 'email' }, {}),
      sharedPhoneNumberField('telefon', true),
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
            title: 'Adresa predzáhradky (ulica, číslo)',
            required: true,
            type: 'text',
          },
          {},
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
              'Číslo parcely a bližšie informácie k pozemku a jeho vlastníkom nájdete na [katastrálnej mape ZBGIS](https://zbgis.skgeodesy.sk/mkzbgis/sk/kataster?pos=48.155530,17.129713,13). Pre schválenie žiadosti sa musí jednať o mestský pozemok.',
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

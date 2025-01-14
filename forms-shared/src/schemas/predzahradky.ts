import { createCondition, createStringItems } from '../generator/helpers'
import { sharedAddressField, sharedPhoneNumberField } from './shared/fields'
import { select } from '../generator/functions/select'
import { input } from '../generator/functions/input'
import { radioGroup } from '../generator/functions/radioGroup'
import { textArea } from '../generator/functions/textArea'
import { fileUpload } from '../generator/functions/fileUpload'
import { object } from '../generator/object'
import { step } from '../generator/functions/step'
import { conditionalFields } from '../generator/functions/conditionalFields'
import { schema } from '../generator/functions/schema'

export default schema(
  {
    title: 'Predzáhradky',
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
            items: [
              { value: 'nova', label: 'Vytvorenie novej predzáhradky', isDefault: true },
              { value: 'existujuca', label: 'Registrácia existujúcej predzáhradky' },
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
          { title: 'Číslo parcely', required: true, type: 'text' },
          {
            helptext:
              'Číslo parcely a bližšie informácie k pozemku a jeho vlastníkom nájdete na [katastrálnej mape ZBGIS](https://zbgis.skgeodesy.sk/mkzbgis/sk/kataster?pos=48.155530,17.129713,13). Pre schválenie žiadosti sa musí jednať o mestský pozemok.',
            helptextMarkdown: true,

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
              helptext: 'Popíšte rozloženie jednotlivých prvkov predzáhradky.',
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
            helptext:
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
          helptext: 'Napríklad, vo forme jednoduchého nákresu rozloženia jednotlivých prvkov.',
        },
      ),
      fileUpload('inePrilohy', { title: 'Iné' }, { type: 'dragAndDrop' }),
    ]),
  ],
)

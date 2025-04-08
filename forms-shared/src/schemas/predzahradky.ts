import { createCondition } from '../generator/helpers'
import { select } from '../generator/functions/select'
import { input } from '../generator/functions/input'
import { radioGroup } from '../generator/functions/radioGroup'
import { textArea } from '../generator/functions/textArea'
import { fileUpload } from '../generator/functions/fileUpload'
import { step } from '../generator/functions/step'
import { conditionalFields } from '../generator/functions/conditionalFields'
import { schema } from '../generator/functions/schema'
import { esbsBratislavaMestskaCastNoPrefixCiselnik } from '../tax-form/mapping/shared/esbsCiselniky'
import { match } from 'ts-pattern'

export default schema(
  {
    title: 'Predzáhradky',
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
      input(
        'ulicaACislo',
        { title: 'Adresa trvalého pobytu', required: true, type: 'text' },
        { helptext: 'Vyplňte ulicu a číslo' },
      ),
      input('mesto', { type: 'text', title: 'Mesto', required: true }, { selfColumn: '3/4' }),
      input('psc', { type: 'ba-slovak-zip', title: 'PSČ', required: true }, { selfColumn: '1/4' }),
      input('email', { title: 'Email', required: true, type: 'email' }, {}),
      input(
        'telefon',
        { type: 'ba-phone-number', title: 'Telefónne číslo', required: true },
        { size: 'medium', helptext: 'Vyplňte vo formáte +421' },
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
            title: 'Adresa predzáhradky',
            required: true,
            type: 'text',
          },
          { helptext: 'Vyplňte ulicu a číslo' },
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
          { title: 'Číslo parcely', required: true, type: 'text' },
          {
            helptext:
              'Číslo parcely a bližšie informácie k pozemku a jeho vlastníkom nájdete na [katastrálnej mape ZBGIS](https://zbgis.skgeodesy.sk/mkzbgis/sk/kataster?pos=48.155530,17.129713,13). Pre schválenie žiadosti sa musí jednať o mestský pozemok.',
            helptextMarkdown: true,

            size: 'medium',
          },
        ),
        ...(['nova', 'existujuca'] as const).map((typRegistracie) =>
          conditionalFields(createCondition([[['typRegistracie'], { const: typRegistracie }]]), [
            textArea(
              'rozlozenie',
              {
                title: match(typRegistracie)
                  .with('nova', () => 'Plánované rozloženie predzáhradky')
                  .with('existujuca', () => 'Rozloženie predzáhradky')
                  .exhaustive(),
                required: true,
              },
              { helptext: 'Popíšte rozloženie jednotlivých prvkov predzáhradky.' },
            ),
          ]),
        ),
        conditionalFields(createCondition([[['typRegistracie'], { const: 'existujuca' }]]), [
          input(
            'dobaStarostlivosti',
            { title: 'Ako dlho sa o predzáhradku staráte?', required: true, type: 'text' },
            {},
          ),
        ]),
        textArea(
          'ine',
          { title: 'Iné' },
          {
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

import { createCondition, createStringItems } from '../../generator/helpers'
import { selectMultiple } from '../../generator/functions/selectMultiple'
import { input } from '../../generator/functions/input'
import { radioGroup } from '../../generator/functions/radioGroup'
import { fileUpload } from '../../generator/functions/fileUpload'
import { object } from '../../generator/object'
import { step } from '../../generator/functions/step'
import { conditionalFields } from '../../generator/functions/conditionalFields'
import { schema } from '../../generator/functions/schema'

export default schema(
  {
    title: 'TEST - Objednávka zákresu sietí',
  },
  {},
  [
    step('objednavatel', { title: 'Objednávateľ' }, [
      radioGroup(
        'objednavatelTyp',
        {
          type: 'string',
          title: 'Objednávate ako',
          required: true,
          items: createStringItems([
            'Fyzická osoba',
            'Fyzická osoba - podnikateľ',
            'Právnická osoba',
          ]),
        },
        { variant: 'boxed', orientations: 'column' },
      ),
      conditionalFields(
        createCondition([
          [
            ['objednavatelTyp'],
            {
              enum: ['Fyzická osoba', 'Fyzická osoba - podnikateľ'],
            },
          ],
        ]),
        [
          object('menoPriezvisko', { required: true }, {}, [
            input('meno', { title: 'Meno', required: true, type: 'text' }, { selfColumn: '2/4' }),
            input(
              'priezvisko',
              { title: 'Priezvisko', required: true, type: 'text' },
              { selfColumn: '2/4' },
            ),
          ]),
        ],
      ),
      conditionalFields(
        createCondition([
          [
            ['objednavatelTyp'],
            {
              enum: ['Fyzická osoba - podnikateľ', 'Právnická osoba'],
            },
          ],
        ]),
        [
          input('obchodneMeno', { title: 'Obchodné meno', required: true, type: 'text' }, {}),
          input('ico', { title: 'IČO', required: true, type: 'text' }, {}),
          input('dic', { title: 'DIČ', required: true, type: 'text' }, {}),
          input('icDph', { title: 'IČ DPH', required: true, type: 'text' }, {}),
        ],
      ),
      conditionalFields(
        createCondition([
          [
            ['objednavatelTyp'],
            {
              const: 'Fyzická osoba',
            },
          ],
        ]),
        [
          input(
            'adresaTrvalehoPobytu',
            { title: 'Adresa trvalého pobytu', required: true, type: 'text' },
            { helptext: 'Vyplňte vo formáte ulica a číslo' },
          ),
        ],
      ),
      conditionalFields(
        createCondition([
          [
            ['objednavatelTyp'],
            {
              const: 'Fyzická osoba - podnikateľ',
            },
          ],
        ]),
        [
          input(
            'adresaPodnikania',
            { title: 'Miesto podnikania', required: true, type: 'text' },
            { helptext: 'Vyplňte vo formáte ulica a číslo' },
          ),
        ],
      ),
      conditionalFields(
        createCondition([
          [
            ['objednavatelTyp'],
            {
              const: 'Právnická osoba',
            },
          ],
        ]),
        [
          input(
            'adresaSidla',
            { title: 'Adresa sídla', required: true, type: 'text' },
            { helptext: 'Vyplňte vo formáte ulica a číslo' },
          ),
        ],
      ),
      object('mestoPsc', { required: true }, {}, [
        input('mesto', { type: 'text', title: 'Mesto', required: true }, { selfColumn: '3/4' }),
        input(
          'psc',
          { type: 'ba-slovak-zip', title: 'PSČ', required: true },
          { selfColumn: '1/4' },
        ),
      ]),
      input('email', { title: 'E-mail', required: true, type: 'email' }, {}),
      input(
        'telefonneCislo',
        { title: 'Telefónne číslo', required: true, type: 'ba-phone-number' },
        { helptext: 'Vyplňte vo formáte +421' },
      ),
      conditionalFields(createCondition([[['objednavatelTyp'], { const: 'Právnická osoba' }]]), [
        object(
          'kontaktnaOsoba',
          { required: true },
          { objectDisplay: 'boxed', title: 'Kontaktná osoba' },
          [
            input('meno', { title: 'Meno', required: true, type: 'text' }, { helptext: 'Meno' }),
            input(
              'priezvisko',
              { title: 'Priezvisko', required: true, type: 'text' },
              { helptext: 'Priezvisko' },
            ),
            input('email', { title: 'E-mail', required: true, type: 'email' }, {}),
            input(
              'telefonneCislo',
              { title: 'Telefónne číslo', required: true, type: 'ba-phone-number' },
              { helptext: 'Vyplňte vo formáte +421' },
            ),
          ],
        ),
      ]),
    ]),
    step('udaje', { title: 'Údaje' }, [
      object(
        'fakturacneUdaje',
        { required: true },
        { objectDisplay: 'boxed', title: 'Fakturačné údaje' },
        [
          input(
            'fakturacnaAdresa',
            { title: 'Fakturačná adresa', required: true, type: 'text' },
            { helptext: 'Vyplňte vo formáte ulica a číslo' },
          ),
          input('mesto', { title: 'Mesto', required: true, type: 'text' }, {}),
          input('psc', { title: 'PSČ', required: true, type: 'text' }, {}),
          input(
            'email',
            { title: 'E-mail', required: true, type: 'email' },
            { helptext: 'Faktúra vám bude zaslaná prostredníctvom tohto emailu' },
          ),
        ],
      ),
      object(
        'udajeObjednavky',
        { required: true },
        { objectDisplay: 'boxed', title: 'Údaje objednávky' },
        [
          input(
            'adresaObjednavky',
            { title: 'Adresa objednávky', required: true, type: 'text' },
            { helptext: 'Vyplňte vo formáte ulica a číslo' },
          ),
          radioGroup(
            'viacKatastralneUzemia',
            {
              type: 'boolean',
              title: 'Nachádza sa adresa stavby v dvoch alebo viacerých katastrálnych územiach?',
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
          conditionalFields(createCondition([[['viacKatastralneUzemia'], { const: true }]]), [
            selectMultiple(
              'katastralneUzemiaMultiple',
              {
                title: 'Katastrálne územie',
                required: true,
                items: createStringItems([
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
                ]),
              },
              {
                helptext:
                  'Vyberte zo zoznamu katastrálnych území. Zobraziť ukážku katastrálnych území.',
              },
            ),
          ]),
          conditionalFields(createCondition([[['viacKatastralneUzemia'], { const: false }]]), [
            selectMultiple(
              'katastralneUzemieSingle',
              {
                title: 'Katastrálne územie',
                required: true,
                items: createStringItems([
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
                ]),
              },
              {
                helptext:
                  'Vyberte zo zoznamu katastrálnych území. Zobraziť ukážku katastrálnych území.',
              },
            ),
          ]),
        ],
      ),
    ]),
    step('prilohy', { title: 'Prílohy' }, [
      fileUpload(
        'snimkaKatastralnejMapy',
        {
          title: 'Snímka z katastrálnej mapy s vyznačeným záujmovým územím',
          required: true,
        },
        {
          type: 'dragAndDrop',
          helptext: `Využiť môžete katastrálnu mapu ZBGIS, kde nájdete požadované záujmové územie.

Ako vytvoriť snímku?
Prejdite do katastrálnej mapy ZBGIS. Otvorením menu v ľavom hornom rohu nájdete funkciu Meranie, ktorá Vám umožní zaznačiť Vaše záujmové územie na katastrálnej mape (zaznačenie Vám následne vypočíta výmeru plochy). Snímku vycentrujte a využite možnosť ZBGIS Tlačiť do PDF. Dokument uložte a následne nahrajte do Nahrať súbory.`,
        },
      ),
    ]),
  ],
)

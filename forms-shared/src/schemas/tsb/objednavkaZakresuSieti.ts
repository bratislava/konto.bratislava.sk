import {
  conditionalFields,
  fileUpload,
  input,
  object,
  radioGroup,
  schema,
  selectMultiple,
  step,
} from '../../generator/functions'
import { createCondition, createStringOptions } from '../../generator/helpers'

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
          options: createStringOptions([
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
          object('menoPriezvisko', { required: true }, { columns: true, columnsRatio: '1/1' }, [
            input('meno', { title: 'Meno', required: true, type: 'text' }, {}),
            input('priezvisko', { title: 'Priezvisko', required: true, type: 'text' }, {}),
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
            { helptextHeader: 'Vyplňte vo formáte ulica a číslo' },
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
            { helptextHeader: 'Vyplňte vo formáte ulica a číslo' },
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
            { helptextHeader: 'Vyplňte vo formáte ulica a číslo' },
          ),
        ],
      ),
      object(
        'mestoPsc',
        { required: true },
        {
          columns: true,
          columnsRatio: '3/1',
        },
        [
          input('mesto', { type: 'text', title: 'Mesto', required: true }, {}),
          input('psc', { type: 'ba-slovak-zip', title: 'PSČ', required: true }, {}),
        ],
      ),
      input('email', { title: 'E-mail', required: true, type: 'email' }, {}),
      input(
        'telefonneCislo',
        { title: 'Telefónne číslo', required: true, type: 'ba-phone-number' },
        { helptextHeader: 'Vyplňte vo formáte +421' },
      ),
      conditionalFields(createCondition([[['objednavatelTyp'], { const: 'Právnická osoba' }]]), [
        object(
          'kontaktnaOsoba',
          { required: true },
          { objectDisplay: 'boxed', title: 'Kontaktná osoba' },
          [
            input(
              'meno',
              { title: 'Meno', required: true, type: 'text' },
              { helptextHeader: 'Meno' },
            ),
            input(
              'priezvisko',
              { title: 'Priezvisko', required: true, type: 'text' },
              { helptextHeader: 'Priezvisko' },
            ),
            input('email', { title: 'E-mail', required: true, type: 'email' }, {}),
            input(
              'telefonneCislo',
              { title: 'Telefónne číslo', required: true, type: 'ba-phone-number' },
              { helptextHeader: 'Vyplňte vo formáte +421' },
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
            { helptextHeader: 'Vyplňte vo formáte ulica a číslo' },
          ),
          input('mesto', { title: 'Mesto', required: true, type: 'text' }, {}),
          input('psc', { title: 'PSČ', required: true, type: 'text' }, {}),
          input(
            'email',
            { title: 'E-mail', required: true, type: 'email' },
            { helptextHeader: 'Faktúra vám bude zaslaná prostredníctvom tohto emailu' },
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
            { helptextHeader: 'Vyplňte vo formáte ulica a číslo' },
          ),
          radioGroup(
            'viacKatastralneUzemia',
            {
              type: 'boolean',
              title: 'Nachádza sa adresa stavby v dvoch alebo viacerých katastrálnych územiach?',
              required: true,
              options: [
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
                options: createStringOptions([
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
                helptextHeader:
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
                options: createStringOptions([
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
                helptextHeader:
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
          helptextHeader: `Využiť môžete katastrálnu mapu ZBGIS, kde nájdete požadované záujmové územie.

Ako vytvoriť snímku?
Prejdite do katastrálnej mapy ZBGIS. Otvorením menu v ľavom hornom rohu nájdete funkciu Meranie, ktorá Vám umožní zaznačiť Vaše záujmové územie na katastrálnej mape (zaznačenie Vám následne vypočíta výmeru plochy). Snímku vycentrujte a využite možnosť ZBGIS Tlačiť do PDF. Dokument uložte a následne nahrajte do Nahrať súbory.`,
        },
      ),
    ]),
  ],
)

import {
  conditionalFields,
  datePicker,
  fileUpload,
  input,
  object,
  radioGroup,
  schema,
  selectMultiple,
  step,
} from '../../generator/functions'
import { createCondition, createStringItems } from '../../generator/helpers'

export default schema(
  {
    title: 'TEST - Žiadosť o stanovisko k projektovej dokumentácii',
  },
  {},
  [
    step('ziadatel', { title: 'Žiadateľ' }, [
      radioGroup(
        'objednavatelAko',
        {
          type: 'string',
          title: 'Objednávateľ ako',
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
    step('udajeOStavbe', { title: 'Údaje o stavbe' }, [
      input(
        'nazovStavby',
        { type: 'text', title: 'Názov stavby', required: true },
        {
          helptextHeader: 'Napríklad: Polyfunkčný objekt ABC',
        },
      ),
      input(
        'adresaStavby',
        { type: 'text', title: 'Adresa stavby', required: true },
        { helptextHeader: 'Vyplňte vo formáte ulica a číslo' },
      ),
      selectMultiple(
        'katastralneUzemie',
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
          helptextHeader:
            'Vyberte zo zoznamu katastrálnych území. Zobraziť ukážku katastrálnych území.',
        },
      ),
      datePicker(
        'predpokladanyTerminStavbyOd',
        { title: 'Predpokladaný termín stavby od', required: true },
        {},
      ),
      datePicker(
        'predpokladanyTerminStavbyDo',
        { title: 'Predpokladaný termín stavby do', required: true },
        {},
      ),
      input(
        'typProjektovejDokumentacie',
        { type: 'text', title: 'Typ projektovej dokumentácie', required: true },
        { helptextHeader: 'Napríklad: Ohlásenie stavby' },
      ),
      radioGroup(
        'stupenProjektovejDokumentacie',
        {
          type: 'string',
          title: 'Stupeň projektovej dokumentácie',
          required: true,
          items: createStringItems([
            'Dokumentácia pre územné rozhodnutie (DÚR)',
            'Dokumentácia pre stavebné povolenie (DSP)',
            'Dokumentácia pre realizáciu stavby (DRS)',
          ]),
        },
        { variant: 'boxed', orientations: 'column' },
      ),
    ]),
    step('prilohy', { title: 'Prílohy' }, [
      fileUpload(
        'technickaSpravaFile',
        {
          title: 'Technická správa',
          required: true,
          multiple: true,
        },
        {
          type: 'dragAndDrop',
          helptextHeader: 'Technická správa s popisom navrhovaného technického riešenia.',
        },
      ),
      fileUpload(
        'vyznaceneZaujmoveUzemieFile',
        {
          title: 'Vyznačené záujmové územie na katastrálnej mape',
          required: true,
          multiple: true,
        },
        {
          type: 'dragAndDrop',
          helptextHeader:
            'Využiť môžete katastrálnu mapu ZBGIS, kde nájdete požadované záujmové územie. V katastrálnej mape zvoľte funkciu Meranie v ľavom menu a vyznačte záujmové územie. Meranie uložte cez možnosť Tlačiť do PDF.',
        },
      ),
      fileUpload(
        'situacnyVykresFile',
        {
          title: 'Situačný výkres',
          required: true,
          multiple: true,
        },
        {
          type: 'dragAndDrop',
        },
      ),
      fileUpload(
        'svetelnoTechnickyVypocetFile',
        {
          title: 'Svetelno-technický výpočet',
          required: false,
          multiple: true,
        },
        {
          type: 'dragAndDrop',
          helptextHeader: 'Výpočet je nutné doložiť v prípade stavby verejného osvetlenia.',
        },
      ),
    ]),
  ],
)

import {
  schema,
  step,
  radioGroup,
  conditionalFields,
  object,
  input,
  selectMultiple,
  datePicker,
  fileUpload,
} from '../../generator/functions'
import { createStringOptions, createCondition } from '../../generator/helpers'
import { sharedAddressField } from '../shared/fields'

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
          options: createStringOptions([
            'Fyzická osoba',
            'Fyzická osoba - podnikateľ',
            'Právnická osoba',
          ]),
        },
        { variant: 'boxed', orientations: 'column' },
      ),
      conditionalFields(createCondition([[['objednavatelAko'], { const: 'Fyzická osoba' }]]), [
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
        sharedAddressField('adresaTrvalehoPobytu', 'Adresa trvalého pobytu', true),
        input('email', { title: 'E-mail', required: true, type: 'email' }, {}),
        input(
          'telefon',
          { type: 'ba-phone-number', title: 'Telefónne číslo', required: true },
          { helptextHeader: 'Vyplňte vo formáte +421' },
        ),
      ]),
      conditionalFields(
        createCondition([[['objednavatelAko'], { const: 'Fyzická osoba - podnikateľ' }]]),
        [
          object('menoPriezviskoPodnikatel', { required: true }, { columns: true, columnsRatio: '1/1' }, [
            input('meno', { title: 'Meno', required: true, type: 'text' }, {}),
            input('priezvisko', { title: 'Priezvisko', required: true, type: 'text' }, {}),
          ]),
          input('obchodneMenoPodnikatel', { title: 'Obchodné meno', required: true, type: 'text' }, {}),
          input('icoPodnikatel', { title: 'IČO', required: true, type: 'text' }, {}),
          input('dicPodnikatel', { title: 'DIČ', required: true, type: 'text' }, {}),
          input('icDphPodnikatel', { title: 'IČ DPH', required: true, type: 'text' }, {}),
          sharedAddressField('adresaPodnikatel', 'Miesto podnikania', true),
          input('emailPodnikatel', { title: 'E-mail', required: true, type: 'email' }, {}),
          input(
            'telefonneCisloPodnikatel',
            { title: 'Telefónne číslo', required: true, type: 'ba-phone-number' },
            { helptextHeader: 'Vyplňte vo formáte +421' },
          ),
        ],
      ),
      conditionalFields(createCondition([[['objednavatelAko'], { const: 'Právnická osoba' }]]), [
        input('obchodneMeno', { type: 'text', title: 'Obchodné meno', required: true }, {}),
        input('ico', { type: 'text', title: 'IČO', required: true }, {}),
        input(
          'adresaSidla',
          { type: 'text', title: 'Adresa sídla', required: true },
          { helptextHeader: 'Vyplňte vo formáte ulica a číslo' },
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
              'telefon',
              { type: 'ba-phone-number', title: 'Telefónne číslo', required: true },
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
          options: createStringOptions([
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

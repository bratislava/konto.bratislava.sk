import { createCondition, createStringItems } from '../../generator/helpers'
import { selectMultiple } from '../../generator/functions/selectMultiple'
import { input } from '../../generator/functions/input'
import { radioGroup } from '../../generator/functions/radioGroup'
import { datePicker } from '../../generator/functions/datePicker'
import { object } from '../../generator/object'
import { step } from '../../generator/functions/step'
import { conditionalFields } from '../../generator/functions/conditionalFields'
import { schema } from '../../generator/functions/schema'
import { fileUploadMultiple } from '../../generator/functions/fileUploadMultiple'
import { GenericObjectType } from '@rjsf/utils'
import { safeString } from '../../form-utils/safeData'

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
    step('udajeOStavbe', { title: 'Údaje o stavbe' }, [
      input(
        'nazovStavby',
        { type: 'text', title: 'Názov stavby', required: true },
        {
          helptext: 'Napríklad: Polyfunkčný objekt ABC',
        },
      ),
      input(
        'adresaStavby',
        { type: 'text', title: 'Adresa stavby', required: true },
        { helptext: 'Vyplňte vo formáte ulica a číslo' },
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
          helptext: 'Vyberte zo zoznamu katastrálnych území. Zobraziť ukážku katastrálnych území.',
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
        { helptext: 'Napríklad: Ohlásenie stavby' },
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
      fileUploadMultiple(
        'technickaSpravaFile',
        {
          title: 'Technická správa',
          required: true,
        },
        {
          type: 'dragAndDrop',
          helptext: 'Technická správa s popisom navrhovaného technického riešenia.',
        },
      ),
      fileUploadMultiple(
        'vyznaceneZaujmoveUzemieFile',
        {
          title: 'Vyznačené záujmové územie na katastrálnej mape',
          required: true,
        },
        {
          type: 'dragAndDrop',
          helptext:
            'Využiť môžete katastrálnu mapu ZBGIS, kde nájdete požadované záujmové územie. V katastrálnej mape zvoľte funkciu Meranie v ľavom menu a vyznačte záujmové územie. Meranie uložte cez možnosť Tlačiť do PDF.',
        },
      ),
      fileUploadMultiple(
        'situacnyVykresFile',
        {
          title: 'Situačný výkres',
          required: true,
        },
        {
          type: 'dragAndDrop',
        },
      ),
      fileUploadMultiple(
        'svetelnoTechnickyVypocetFile',
        {
          title: 'Svetelno-technický výpočet',
          required: false,
        },
        {
          type: 'dragAndDrop',
          helptext: 'Výpočet je nutné doložiť v prípade stavby verejného osvetlenia.',
        },
      ),
    ]),
  ],
)

export const ziadostOStanoviskoPDExtractEmail = (formData: GenericObjectType) => {
  return safeString(formData.ziadatel?.email)
}

export const ziadostOStanoviskoPDExtractName = (formData: GenericObjectType) => {
  if (
    formData.ziadatel?.objednavatelTyp === 'Fyzická osoba' ||
    formData.ziadatel?.objednavatelTyp === 'Fyzická osoba - podnikateľ'
  ) {
    return safeString(formData.ziadatel?.menoPriezvisko?.meno)
  }
  if (formData.ziadatel?.objednavatelTyp === 'Právnická osoba') {
    return safeString(formData.ziadatel?.obchodneMeno)
  }
}

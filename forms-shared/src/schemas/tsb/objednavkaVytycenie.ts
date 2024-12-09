import { createCondition, createStringItems } from '../../generator/helpers'
import { sharedAddressField } from '../shared/fields'
import { select } from '../../generator/functions/select'
import { selectMultiple } from '../../generator/functions/selectMultiple'
import { input } from '../../generator/functions/input'
import { radioGroup } from '../../generator/functions/radioGroup'
import { fileUpload } from '../../generator/functions/fileUpload'
import { datePicker } from '../../generator/functions/datePicker'
import { object } from '../../generator/object'
import { step } from '../../generator/functions/step'
import { conditionalFields } from '../../generator/functions/conditionalFields'
import { schema } from '../../generator/functions/schema'

export default schema(
  {
    title: 'TEST - Objednávka vytýčenia',
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
          sharedAddressField('adresaSidla', 'Adresa sídla', true),
          input(
            'email',
            { title: 'E-mail', required: true, type: 'email' },
            {
              helptext: 'Faktúra vám bude zaslaná prostredníctvom tohto emailu',
            },
          ),
        ],
      ),
      object(
        'udajeObjednavky',
        { required: true },
        { objectDisplay: 'boxed', title: 'Údaje objednávky' },
        [
          input(
            'dovodVytycenia',
            { title: 'Dôvod vytýčenia', required: true, type: 'text' },
            {
              helptext:
                'Napríklad: vytýčenie káblovej poruchy, za účelom rozkopávky, vybudovanie inžinierskych sietí...',
            },
          ),
          input(
            'pozadovaneMiestoPlnenia',
            { title: 'Požadované miesto plnenia', required: true, type: 'text' },
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
              'katastralneUzemia',
              {
                title: 'Katastrálne územia',
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
            select(
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
                helptext:
                  'Vyberte zo zoznamu katastrálnych území. Zobraziť ukážku katastrálnych území.',
              },
            ),
          ]),
          input(
            'druhStavby',
            { title: 'Druh stavby', required: false, type: 'text' },
            { helptext: 'Napríklad: telekomunikačná líniová stavba' },
          ),
          datePicker(
            'pozadovanyTerminPlnenia',
            { title: 'Požadovaný termín plnenia', required: true },
            { helptext: 'Štandardný termín na vybavenie objednávky je 30 dní' },
          ),
        ],
      ),
    ]),
    step('prilohy', { title: 'Prílohy' }, [
      fileUpload(
        'informativnyZakresSieti',
        {
          title: 'Informatívny zákres sietí vydaný Technickými sieťami Bratislava, a.s.',
          required: true,
          multiple: true,
        },
        {
          type: 'dragAndDrop',
          helptext:
            'Požiadať o informatívny zákres vydaný Technickými sieťami Bratislava, a.s. môžete formou spoplatnenej služby Objednávka informatívneho zákresu sietí',
          accept: '.pdf,.jpg,.jpeg,.png',
        },
      ),
    ]),
  ],
)

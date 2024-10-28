import {
  schema,
  step,
  radioGroup,
  input,
  object,
  checkbox,
  conditionalFields,
  select,
  datePicker,
  fileUpload,
  selectMultiple,
} from '../../generator/functions'
import { createStringOptions, createCondition } from '../../generator/helpers'
import { sharedAddressField } from '../shared/fields'

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
          options: createStringOptions([
            'Fyzická osoba',
            'Fyzická osoba - podnikateľ',
            'Právnická osoba',
          ]),
        },
        { variant: 'boxed', orientations: 'column' },
      ),
      conditionalFields(createCondition([[['objednavatelTyp'], { const: 'Fyzická osoba' }]]), [
        object('menoPriezviskoFyzickaOsoba', { required: true }, { columns: true, columnsRatio: '1/1' }, [
          input('meno', { title: 'Meno', required: true, type: 'text' }, {}),
          input('priezvisko', { title: 'Priezvisko', required: true, type: 'text' }, {}),
        ]),
        sharedAddressField('adresaTrvalehoPobytu', 'Adresa trvalého pobytu', true),
        input('email', { title: 'E-mail', required: true, type: 'email' }, {}),
        input(
          'telefonneCislo',
          { title: 'Telefónne číslo', required: true, type: 'ba-phone-number' },
          { helptextHeader: 'Vyplňte vo formáte +421' },
        ),
      ]),
      conditionalFields(
        createCondition([[['objednavatelTyp'], { const: 'Fyzická osoba - podnikateľ' }]]),
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
      conditionalFields(createCondition([[['objednavatelTyp'], { const: 'Právnická osoba' }]]), [
        input('obchodneMeno', { title: 'Obchodné meno', required: true, type: 'text' }, {}),
        input('ico', { title: 'IČO', required: true, type: 'text' }, {}),
        input('dic', { title: 'DIČ', required: true, type: 'text' }, {}),
        input('icDph', { title: 'IČ DPH', required: true, type: 'text' }, {}),
        sharedAddressField('adresaSidla', 'Adresa sídla', true),
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
          sharedAddressField('adresaSidla', 'Adresa sídla', true),
          input(
            'email',
            { title: 'E-mail', required: true, type: 'email' },
            {
              helptextHeader: 'Faktúra vám bude zaslaná prostredníctvom tohto emailu',
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
              helptextHeader:
                'Napríklad: vytýčenie káblovej poruchy, za účelom rozkopávky, vybudovanie inžinierskych sietí...',
            },
          ),
          input(
            'pozadovaneMiestoPlnenia',
            { title: 'Požadované miesto plnenia', required: true, type: 'text' },
            { helptextHeader: 'Vyplňte vo formáte ulica a číslo' },
          ),
          radioGroup(
            'viacKatastralneUzemia',
            {
              type: 'boolean',
              title: 'Nachádza sa adresa stavby v dvoch alebo viacerých katastrálnych územiach?',
              required: true,
              options: [
                { value: true, title: 'Áno' },
                { value: false, title: 'Nie', isDefault: true },
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
            select(
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
          ]),
          input(
            'druhStavby',
            { title: 'Druh stavby', required: false, type: 'text' },
            { helptextHeader: 'Napríklad: telekomunikačná líniová stavba' },
          ),
          datePicker(
            'pozadovanyTerminPlnenia',
            { title: 'Požadovaný termín plnenia', required: true },
            { helptextHeader: 'Štandardný termín na vybavenie objednávky je 30 dní' },
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
          helptextHeader:
            'Požiadať o informatívny zákres vydaný Technickými sieťami Bratislava, a.s. môžete formou spoplatnenej služby Objednávka informatívneho zákresu sietí',
          accept: '.pdf,.jpg,.jpeg,.png',
        },
      ),
    ]),
  ],
)

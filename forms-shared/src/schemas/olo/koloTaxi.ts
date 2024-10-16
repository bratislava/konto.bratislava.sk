import {
  checkbox,
  conditionalFields,
  fileUpload,
  input,
  object,
  radioGroup,
  schema,
  step,
  textArea,
} from '../../generator/functions'
import { createCondition, createStringOptions } from '../../generator/helpers'
import { sharedAddressField, sharedPhoneNumberField } from '../shared/fields'

export default schema({ title: 'KOLO Taxi' }, {}, [
  step('ziadatel', { title: 'Žiadateľ' }, [
    radioGroup(
      'ziadatelTyp',
      {
        type: 'string',
        title: 'Žiadam ako',
        required: true,
        options: createStringOptions(['Fyzická osoba', 'Právnická osoba']),
      },
      { variant: 'boxed', orientations: 'column' },
    ),
    conditionalFields(createCondition([[['ziadatelTyp'], { const: 'Fyzická osoba' }]]), [
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
      sharedPhoneNumberField('telefonPravnickaOsoba', true),
      input('emailFyzickaOsoba', { title: 'Email', required: false, type: 'email' }, {}),
    ]),
    conditionalFields(createCondition([[['ziadatelTyp'], { const: 'Právnická osoba' }]]), [
      input('nazovOrganizacie', { type: 'text', title: 'Názov organizácie', required: true }, {}),
      sharedAddressField('adresaSidlaOrganizacie', 'Adresa sídla organizácie', true),
      input('ico', { type: 'text', title: 'IČO', required: true }, {}),
      input('dic', { type: 'text', title: 'DIČ', required: true }, {}),
      checkbox(
        'platcaDph',
        { title: 'Som platca DPH?' },
        { checkboxLabel: 'Som platca DPH', variant: 'boxed' },
      ),
      conditionalFields(createCondition([[['platcaDph'], { const: true }]]), [
        input('icDph', { type: 'text', title: 'IČ DPH', required: true }, {}),
      ]),
      input('konatel', { type: 'text', title: 'Konateľ (meno, priezvisko)', required: true }, {}),
      input(
        'zastupeny',
        {
          type: 'text',
          title: 'Zastúpený - na základe splnomocnenia (meno, priezvisko)',
          required: true,
        },
        {},
      ),
      input(
        'menoKontaktnejOsoby',
        { type: 'text', title: 'Meno kontaktnej osoby', required: true },
        {},
      ),
      sharedPhoneNumberField('telefonPravnickaOsoba', true),
      input('emailPravnickaOsoba', { title: 'Email', required: true, type: 'email' }, {}),
      object('fakturacia', { required: true }, { objectDisplay: 'boxed', title: 'Fakturácia' }, [
        input('iban', { type: 'ba-iban', title: 'IBAN', required: true }, {}),
        checkbox(
          'elektronickaFaktura',
          {
            title: 'Súhlasím so zaslaním elektronickej faktúry',
          },
          {
            helptextHeader:
              'V prípade vyjadrenia nesúhlasu bude zákazníkovi za zasielanie faktúry poštou účtovaný poplatok 10 € bez DPH.',
            checkboxLabel: 'Súhlasím so zaslaním elektronickej faktúry',
            variant: 'boxed',
          },
        ),
        conditionalFields(createCondition([[['elektronickaFaktura'], { const: true }]]), [
          input(
            'emailPreFaktury',
            {
              type: 'text',
              title: 'E-mail pre zasielanie elektronických faktúr',
              required: true,
            },
            {},
          ),
        ]),
      ]),
    ]),
  ]),
  step('sluzba', { title: 'Služba' }, [
    input(
      'miestoDodania',
      {
        type: 'text',
        title: 'Miesto dodania / výkonu služby',
        required: true,
      },
      {
        helptextHeader: 'Vyplňte vo formáte ulica a číslo',
      },
    ),
    textArea(
      'popisDarovanychVeci',
      {
        title: 'Popis darovaných vecí',
        required: true,
      },
      {
        helptextHeader: 'Okrem čalúneného nábytku a elektrospotrebičov',
      },
    ),
    fileUpload(
      'fotoDarovanychVeci',
      {
        title: 'Foto darovaných vecí',
        required: true,
        multiple: true,
      },
      {
        type: 'dragAndDrop',
        helptextHeader: 'Nahrajte fotografiu vecí, ktoré chcete darovať (jpg, jpeg, png, max. 5MB)',
      },
    ),
    checkbox(
      'suhlasSDarom',
      {
        title: 'Vyjadrenie súhlasu s platbou',
        required: true,
        constValue: true,
      },
      {
        checkboxLabel: 'Súhlasím s platbou za službu KOLO Taxi',
        variant: 'boxed',
      },
    ),
  ]),
])

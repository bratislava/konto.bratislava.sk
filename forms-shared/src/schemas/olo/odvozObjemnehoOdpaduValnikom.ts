import {
  checkbox,
  conditionalFields,
  customComponentsField,
  datePicker,
  input,
  object,
  radioGroup,
  schema,
  step,
} from '../../generator/functions'
import { createCondition, createStringOptions } from '../../generator/helpers'
import { sharedAddressField, sharedPhoneNumberField } from '../shared/fields'

export default schema({ title: 'Odvoz objemného odpadu valníkom' }, {}, [
  step('ziadatel', { title: 'Žiadateľ' }, [
    radioGroup(
      'ziadatelTyp',
      {
        type: 'string',
        title: 'Žiadam ako',
        required: true,
        options: createStringOptions(['Právnická osoba', 'Správcovská spoločnosť']),
      },
      { variant: 'boxed', orientations: 'column' },
    ),
    input('nazov', { type: 'text', title: 'Názov organizácie', required: true }, {}),
    sharedAddressField('adresaSidla', 'Adresa sídla organizácie', true),
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
    conditionalFields(createCondition([[['ziadatelTyp'], { const: 'Právnická osoba' }]]), [
      input(
        'konatel',
        { type: 'text', title: 'Konateľ (meno, priezvisko)', required: true },
        { helptextHeader: 'Uveďte meno a priezvisko konateľa' },
      ),
      input(
        'zastupeny',
        {
          type: 'text',
          title: 'Zastúpený - na základe splnomocnenia (meno, priezvisko)',
          required: true,
        },
        { helptextHeader: 'Uveďte meno a priezvisko osoby zastupujúcej na základe splnomocnenia' },
      ),
    ]),
    input('kontaktnaOsoba', { type: 'text', title: 'Meno kontaktnej osoby', required: true }, {}),
    sharedPhoneNumberField('telefon', true),
    input('email', { title: 'E-mail', required: true, type: 'email' }, {}),
    object('fakturacia', { required: true }, { objectDisplay: 'boxed', title: 'Fakturácia' }, [
      input('iban', { type: 'ba-iban', title: 'IBAN', required: true }, {}),
      checkbox(
        'elektronickaFaktura',
        {
          title: 'Súhlasím so zaslaním elektronickej faktúry',
        },
        {
          helptextHeader:
            'V prípade vyjadrenia nesúhlasu bude zákazníkovi za zasielanie faktúry poštou účtovaný poplatok 10 € bez DPH. Osobitné ustanovenia o zasielaní faktúry v elektronickej podobe v zmysle bodu 5.9 VOP.',
          checkboxLabel: 'Súhlasím so zaslaním elektronickej faktúry',
          variant: 'boxed',
        },
      ),
      conditionalFields(createCondition([[['elektronickaFaktura'], { const: true }]]), [
        input(
          'emailPreFaktury',
          {
            type: 'email',
            title: 'E-mail pre zasielanie elektronických faktúr',
            required: true,
          },
          {},
        ),
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
    datePicker(
      'preferovanyDatumPristavenia',
      {
        title: 'Preferovaný dátum pristavenia vozidla',
        required: true,
      },
      { size: 'medium' },
    ),
  ]),
  step('suhlasy', { title: 'Súhlasy' }, [
    checkbox(
      'suhlas',
      {
        title: 'Súhlas s TODO',
        required: true,
        constValue: true,
      },
      {
        checkboxLabel: 'Súhlasím s TODO',
        variant: 'boxed',
      },
    ),
    customComponentsField(
      {
        type: 'additionalLinks',
        props: {
          links: [
            {
              title: 'TODO',
              href: 'https://olo.sk',
            },
          ],
        },
      },
      {},
    ),
  ]),
])

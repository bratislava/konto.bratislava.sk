import {
  checkbox,
  conditionalFields,
  customComponentsField,
  datePicker,
  input,
  object,
  radioGroup,
  schema,
  select,
  step,
  textArea,
} from '../../generator/functions'
import { createCondition, createStringOptions } from '../../generator/helpers'
import { sharedAddressField, sharedPhoneNumberField } from '../shared/fields'

export default schema({ title: 'Dočistenie stanovišťa zberných nádob' }, {}, [
  step('ziadatel', { title: 'Žiadateľ' }, [
    radioGroup(
      'ziadatelTyp',
      {
        type: 'string',
        title: 'Žiadam ako',
        required: true,
        options: createStringOptions([
          'Fyzická osoba',
          'Právnická osoba',
          'Správcovská spoločnosť',
        ]),
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
      sharedAddressField('adresaObyvatel', 'Adresa trvalého pobytu', true),
    ]),
    conditionalFields(
      createCondition([[['ziadatelTyp'], { enum: ['Právnická osoba', 'Správcovská spoločnosť'] }]]),
      [
        input('nazov', { type: 'text', title: 'Názov organizácie', required: true }, {}),
        sharedAddressField('adresaPravnickaOsoba', 'Adresa sídla organizácie', true),
        input('ico', { type: 'text', title: 'IČO', required: true }, {}),
        input('dic', { type: 'text', title: 'DIČ', required: true }, {}),
        checkbox(
          'platcaDph',
          { title: 'Som platca DPH?' },
          { checkboxLabel: 'Som platca DPH?', variant: 'boxed' },
        ),
        conditionalFields(createCondition([[['platcaDph'], { const: true }]]), [
          input('icDph', { type: 'text', title: 'IČ DPH', required: true }, {}),
        ]),
      ],
    ),
    conditionalFields(createCondition([[['ziadatelTyp'], { const: 'Právnická osoba' }]]), [
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
    ]),
    conditionalFields(
      createCondition([[['ziadatelTyp'], { enum: ['Právnická osoba', 'Správcovská spoločnosť'] }]]),
      [
        input(
          'kontaktnaOsoba',
          { type: 'text', title: 'Meno kontaktnej osoby', required: true },
          {},
        ),
      ],
    ),
    sharedPhoneNumberField('telefon', true),
    input('email', { title: 'E-mail', required: true, type: 'email' }, {}),
    object('fakturacia', { required: true }, { objectDisplay: 'boxed', title: 'Fakturácia' }, [
      input('iban', { type: 'ba-iban', title: 'IBAN', required: true }, {}),
      checkbox(
        'elektronickaFaktura',
        {
          title: 'Zasielanie faktúry elektronicky',
          required: true,
        },
        {
          helptextHeader:
            'V prípade vyjadrenia nesúhlasu bude zákazníkovi za zasielanie faktúry poštou účtovaný poplatok 10 € bez DPH. Osobitné ustanovenia o zasielaní faktúry v elektronickej podobe v zmysle bodu 5.9 VOP.',
          checkboxLabel: 'Súhlasím so zaslaním elektronickej fakúry',
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
    select(
      'komodita',
      {
        title: 'Vyberte komoditu',
        required: true,
        options: createStringOptions(
          [
            'Papier',
            'Plast',
            'Zmesový komunálny odpad',
            'Kuchynský biologicky rozložiteľný odpad',
            'Biologicky rozložiteľný odpad',
          ],
          false,
        ),
      },
      {
        helptextHeader: 'Poplatok je účtovaný za množstvo naložených a vysypaných nádob',
      },
    ),
    datePicker(
      'preferovanyDatum',
      {
        title: 'Preferovaný dátum vykonania služby',
        required: true,
      },
      {
        helptextHeader:
          'Vami zvolený dátum má iba informačný charakter. Objednávku je potrebné podať minimálne 2 pracovné dni pred zvoleným termínom. V prípade, ak vami zvolený termín nebude voľný, budeme vás kontaktovať.',
        size: 'medium',
      },
    ),
    textArea(
      'doplnujuceInfo',
      {
        title: 'Doplňujúce info',
        required: true,
      },
      {
        helptextHeader: 'Špecifikujte individuálne požiadavky.',
      },
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

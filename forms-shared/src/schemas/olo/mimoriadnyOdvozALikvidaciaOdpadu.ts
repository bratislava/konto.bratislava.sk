import {
  checkbox,
  conditionalFields,
  datePicker,
  input,
  object,
  radioGroup,
  schema,
  select,
  step,
  textArea,
} from '../../generator/functions'
import { sharedAddressField, sharedPhoneNumberField } from '../shared/fields'
import { createCondition, createStringOptions } from '../../generator/helpers'

const infoOOdpadeFields = [
  input(
    'miestoDodania',
    { title: 'Miesto dodania / výkonu služby', required: true },
    { helptext: 'Presná adresa' },
  ),
  radioGroup(
    'druhOdpadu',
    {
      title: 'Vyberte druh odpadu',
      required: true,
      type: 'string',
      options: createStringOptions([
        'Zmesový komunálny odpad',
        'Jedlé oleje a tuky',
        'Kuchynský biologicky rozložiteľný odpad',
        'Biologicky rozložiteľný odpad',
        'Papier',
        'Plasty/kovové obaly a VKM',
        'Sklo',
      ]).map((option) => ({
        ...option,
        description:
          option.title === 'Jedlé oleje a tuky'
            ? 'Dostupné iba pre právnické osoby a správcovské spoločnosti'
            : undefined,
      })),
    },
    { variant: 'boxed', orientations: 'column' },
  ),
  conditionalFields(createCondition([[['druhOdpadu'], { const: 'Zmesový komunálny odpad' }]]), [
    select(
      'objemNadobyZmesovyKomunalnyOdpad',
      {
        title: 'Vyberte objem nádoby',
        required: true,
        options: createStringOptions(
          [
            '120 l zberná nádoba',
            '240 l zberná nádoba',
            '1100 l zberná nádoba',
            '3000 l polopodzemný kontajner',
            '5000 l polopodzemný kontajner',
          ],
          false,
        ),
      },
      {},
    ),
  ]),
  conditionalFields(
    createCondition([[['druhOdpadu'], { const: 'Kuchynský biologicky rozložiteľný odpad' }]]),
    [
      select(
        'objemNadobyKuchynskyBiologicky',
        {
          title: 'Vyberte objem nádoby',
          required: true,
          options: createStringOptions(
            ['23 l zberná nádoba', '120 l zberná nádoba', '240 l zberná nádoba'],
            false,
          ),
        },
        { helptext: '23 l zberná nádoba sa poskytuje iba pre odvoz z rodinných domov.' },
      ),
    ],
  ),
  conditionalFields(
    createCondition([
      [['ziadatelTyp'], { enum: ['PravnickaOsoba', 'SpravcovskaSpolocnost'] }],
      [
        ['druhOdpadu'],
        { const: 'Jedlé oleje a tuky (iba pre právnické osoby a správcovské spoločnosti)' },
      ],
    ]),
    [
      select(
        'objemNadobyJedleOlejeATuky',
        {
          title: 'Vyberte objem nádoby',
          required: true,
          options: createStringOptions(['120 l zberná nádoba'], false),
        },
        {
          helptext:
            'Služba sa poskytuje iba pre bytové doby a firmy. Pre rodinné domy sú určené nádoby na zberné hniezda (prelink).',
        },
      ),
    ],
  ),
  conditionalFields(createCondition([[['druhOdpadu'], { const: 'Papier' }]]), [
    select(
      'objemNadobyPapier',
      {
        title: 'Vyberte objem nádoby',
        required: true,
        options: createStringOptions(
          [
            '120 l zberná nádoba',
            '240 l zberná nádoba',
            '1100 l zberná nádoba',
            '3000 l polopodzemný kontajner',
            '5000 l polopodzemný kontajner',
          ],
          false,
        ),
      },
      {},
    ),
  ]),
  conditionalFields(createCondition([[['druhOdpadu'], { const: 'Plasty/kovové obaly a VKM' }]]), [
    select(
      'objemNadobyPlastyKovoveObaly',
      {
        title: 'Vyberte objem nádoby',
        required: true,
        options: createStringOptions(
          [
            '120 l zberná nádoba',
            '240 l zberná nádoba',
            '1100 l zberná nádoba',
            '3000 l polopodzemný kontajner',
            '5000 l polopodzemný kontajner',
          ],
          false,
        ),
      },
      {},
    ),
  ]),
  conditionalFields(createCondition([[['druhOdpadu'], { const: 'Sklo' }]]), [
    select(
      'objemNadobySklo',
      {
        title: 'Vyberte objem nádoby',
        required: true,
        options: createStringOptions(
          [
            '120 l zberná nádoba',
            '240 l zberná nádoba',
            '1100 l zberná nádoba',
            '1800 l zvon na sklo',
            '3000 l polopodzemný kontajner',
            '5000 l polopodzemný kontajner',
          ],
          false,
        ),
      },
      {},
    ),
  ]),
]

export default schema(
  {
    title: 'Mimoriadny odvoz a likvidácia odpadu',
  },
  {},
  [
    step('ziadatel', { title: 'Žiadateľ' }, [
      radioGroup(
        'ziadatelTyp',
        {
          type: 'string',
          title: 'Žiadateľ',
          required: true,
          options: createStringOptions(['Obyvateľ', 'Právnická osoba', 'Správcovská spoločnosť']),
        },
        { variant: 'boxed', orientations: 'column' },
      ),
      conditionalFields(createCondition([[['ziadatelTyp'], { const: 'Obyvateľ' }]]), [
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
        createCondition([
          [['ziadatelTyp'], { enum: ['Právnická osoba', 'Správcovská spoločnosť'] }],
        ]),
        [
          input('nazov', { title: 'Názov organizácie', required: true }, {}),
          sharedAddressField('adresaPravnickaOsoba', 'Adresa sídla', true),
          input('ico', { title: 'IČO', required: true }, {}),
          input('dic', { title: 'DIČ', required: true }, {}),
          checkbox(
            'platcaDph',
            { title: 'Som platca DPH?', required: true },
            { checkboxLabel: 'Som platca DPH?', variant: 'boxed' },
          ),
          conditionalFields(createCondition([[['platcaDph'], { const: true }]]), [
            input('icDph', { title: 'IČ DPH', required: true }, {}),
          ]),
        ],
      ),
      conditionalFields(createCondition([[['ziadatelTyp'], { const: 'Právnická osoba' }]]), [
        input('konatel', { title: 'Konateľ (meno, priezvisko)', required: true }, {}),
        input(
          'zastupeny',
          { title: 'Zastúpený - na základe splnomocnenia (meno, priezvisko)' },
          {},
        ),
      ]),
      conditionalFields(
        createCondition([
          [['ziadatelTyp'], { enum: ['Právnická osoba', 'Správcovská spoločnosť'] }],
        ]),
        [input('kontaktnaOsoba', { title: 'Meno kontaktnej osoby', required: true }, {})],
      ),
      sharedPhoneNumberField('telefon', true),
      input('email', { title: 'E-mail', required: true, type: 'email' }, {}),
      conditionalFields(
        createCondition([
          [['ziadatelTyp'], { enum: ['Právnická osoba', 'Správcovská spoločnosť'] }],
        ]),
        [
          object(
            'fakturacia',
            { required: true },
            { objectDisplay: 'boxed', title: 'Fakturácia' },
            [
              input('iban', { title: 'IBAN', required: true, format: 'ba-iban' }, {}),
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
                  { title: 'E-mail pre zasielanie elektronických faktúr', required: true },
                  {},
                ),
              ]),
            ],
          ),
        ],
      ),
    ]),
    step('sluzba', { title: 'Služba' }, [
      object('infoOOdpade', { required: true }, {}, infoOOdpadeFields),
      datePicker(
        'datumVykonania',
        { title: 'Preferovaný dátum vykonania služby', required: true },
        { size: 'medium' },
      ),
      textArea(
        'doplnujuceInformacie',
        { title: 'Doplňujúce informácie' },
        { helptext: 'Špecifikujte individuálne požiadavky.' },
      ),
    ]),
  ],
)

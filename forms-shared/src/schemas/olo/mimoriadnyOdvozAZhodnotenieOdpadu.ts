import {
  arrayField,
  checkbox,
  conditionalFields,
  customComponentsField,
  datePicker,
  input,
  markdownText,
  object,
  radioGroup,
  schema,
  select,
  step,
  textArea,
} from '../../generator/functions'
import { sharedAddressField, sharedPhoneNumberField } from '../shared/fields'
import { createCondition, createStringOptions } from '../../generator/helpers'

export default schema(
  {
    title: 'Mimoriadny odvoz a zhodnotenie odpadu',
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
          input('nazov', { type: 'text', title: 'Názov organizácie', required: true }, {}),
          sharedAddressField('adresaPravnickaOsoba', 'Adresa sídla', true),
          input('ico', { type: 'text', title: 'IČO', required: true }, {}),
          input('dic', { type: 'text', title: 'DIČ', required: true }, {}),
          checkbox(
            'platcaDph',
            { title: 'Som platca DPH?', required: true },
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
          { type: 'text', title: 'Zastúpený - na základe splnomocnenia (meno, priezvisko)' },
          {},
        ),
      ]),
      conditionalFields(
        createCondition([
          [['ziadatelTyp'], { enum: ['Právnická osoba', 'Správcovská spoločnosť'] }],
        ]),
        [
          input(
            'kontaktnaOsoba',
            { type: 'text', title: 'Meno kontaktnej osoby', required: true },
            {},
          ),
        ],
      ),
      sharedPhoneNumberField('telefon', true),
      conditionalFields(
        createCondition([
          [['ziadatelTyp'], { enum: ['Právnická osoba', 'Správcovská spoločnosť'] }],
        ]),
        [input('email', { title: 'E-mail', required: true, type: 'email' }, {})],
      ),
      conditionalFields(createCondition([[['ziadatelTyp'], { enum: ['Obyvateľ'] }]]), [
        input('emailObyvatel', { title: 'E-mail', type: 'email' }, {}),
      ]),
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
            ],
          ),
        ],
      ),
    ]),
    step('sluzba', { title: 'Služba' }, [
      arrayField(
        'infoOOdpade',
        { title: 'Info o odpade', required: true },
        {
          variant: 'topLevel',
          addButtonLabel: 'Pridať ďalší odpad',
          itemTitle: 'Odpad č. {index}',
        },
        [
          input(
            'miestoDodania',
            { type: 'text', title: 'Miesto dodania / výkonu služby', required: true },
            { helptextHeader: 'Presná adresa' },
          ),
          select(
            'druhOdpadu',
            {
              title: 'Vyberte druh odpadu',
              required: true,
              options: createStringOptions([
                'Zmesový komunálny odpad',
                'Kuchynský biologicky rozložiteľný odpad',
                'Biologicky rozložiteľný odpad',
                'Jedlé oleje a tuky',
                'Papier',
                'Plasty/kovové obaly a nápojové kartóny',
                'Sklo',
              ]),
            },
            {},
          ),
          conditionalFields(
            createCondition([[['druhOdpadu'], { const: 'Zmesový komunálny odpad' }]]),
            [
              select(
                'objemNadobyZmesovyKomunalnyOdpad',
                {
                  title: 'Vyberte objem nádoby',
                  required: true,
                  options: createStringOptions([
                    '120 l zberná nádoba',
                    '240 l zberná nádoba',
                    '1100 l zberná nádoba',
                    '3000 l polopodzemný kontajner',
                    '5000 l polopodzemný kontajner',
                  ]),
                },
                {},
              ),
            ],
          ),
          conditionalFields(
            createCondition([
              [['druhOdpadu'], { const: 'Kuchynský biologicky rozložiteľný odpad' }],
            ]),
            [
              select(
                'objemNadobyKuchynskyBiologicky',
                {
                  title: 'Vyberte objem nádoby',
                  required: true,
                  options: createStringOptions([
                    '23 l zberná nádoba',
                    '120 l zberná nádoba',
                    '240 l zberná nádoba',
                  ]),
                },
                {
                  helptextHeader:
                    '23 l zberná nádoba sa poskytuje iba pre odvoz z rodinných domov.',
                },
              ),
            ],
          ),
          conditionalFields(createCondition([[['druhOdpadu'], { const: 'Jedlé oleje a tuky' }]]), [
            select(
              'objemNadobyJedleOlejeATuky',
              {
                title: 'Vyberte objem nádoby',
                required: true,
                options: createStringOptions(['120 l zberná nádoba']),
              },
              {
                helptextHeader: markdownText(
                  'Služba sa poskytuje iba pre bytové doby a firmy. Pre rodinné domy sú určené nádoby na [zberné hniezda](https://www.olo.sk/zberne-hniezda/).',
                ),
              },
            ),
          ]),
          conditionalFields(createCondition([[['druhOdpadu'], { const: 'Papier' }]]), [
            select(
              'objemNadobyPapier',
              {
                title: 'Vyberte objem nádoby',
                required: true,
                options: createStringOptions([
                  '120 l zberná nádoba',
                  '240 l zberná nádoba',
                  '1100 l zberná nádoba',
                  '3000 l polopodzemný kontajner',
                  '5000 l polopodzemný kontajner',
                ]),
              },
              {},
            ),
          ]),
          conditionalFields(
            createCondition([
              [['druhOdpadu'], { const: 'Plasty/kovové obaly a nápojové kartóny' }],
            ]),
            [
              select(
                'objemNadobyPlastyKovoveObaly',
                {
                  title: 'Vyberte objem nádoby',
                  required: true,
                  options: createStringOptions([
                    '120 l zberná nádoba',
                    '240 l zberná nádoba',
                    '1100 l zberná nádoba',
                    '3000 l polopodzemný kontajner',
                    '5000 l polopodzemný kontajner',
                  ]),
                },
                {},
              ),
            ],
          ),
          conditionalFields(createCondition([[['druhOdpadu'], { const: 'Sklo' }]]), [
            select(
              'objemNadobySklo',
              {
                title: 'Vyberte objem nádoby',
                required: true,
                options: createStringOptions([
                  '120 l zberná nádoba',
                  '240 l zberná nádoba',
                  '1100 l zberná nádoba',
                  '1800 l zvon na sklo',
                  '3000 l polopodzemný kontajner',
                  '5000 l polopodzemný kontajner',
                ]),
              },
              {},
            ),
          ]),
          conditionalFields(
            createCondition([[['druhOdpadu'], { const: 'Biologicky rozložiteľný odpad' }]]),
            [
              select(
                'objemNadobyBiologickyRozlozitelny',
                {
                  title: 'Vyberte objem nádoby',
                  required: true,
                  options: createStringOptions(['120 l zberná nádoba', '240 l zberná nádoba']),
                },
                {},
              ),
            ],
          ),
        ],
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
        },
      ),
      textArea(
        'doplnujuceInfo',
        {
          title: 'Doplňujúce info',
          required: false,
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
  ],
)

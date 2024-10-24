import {
  arrayField,
  checkbox,
  conditionalFields,
  customComponentsField,
  datePicker,
  input,
  number,
  object,
  radioGroup,
  schema,
  select,
  step,
} from '../../generator/functions'
import { createCondition, createStringOptions } from '../../generator/helpers'
import { sharedAddressField, sharedPhoneNumberField } from '../shared/fields'

export default schema(
  {
    title: 'Triedený zber papiera, plastov a skla pre právnické osoby',
  },
  {},
  [
    step('ziadatel', { title: 'Žiadateľ' }, [
      radioGroup(
        'typOdberatela',
        {
          type: 'string',
          title: 'Typ odberateľa',
          required: true,
          options: createStringOptions([
            'Nový',
            'Existujúci',
            'Zmena poplatkovej povinnosti pre existujúceho zákazníka',
            'Zmena odberateľa',
          ]),
        },
        {
          variant: 'boxed',
          orientations: 'column',
          helptextHeader:
            'Nový (nemám uzavretú zmluvu), Existujúci (mám uzavretú zmluvu), Zmena poplatkovej povinnosti (spoplatnenie služby), Zmena odberateľa (napr. preberám prevádzku alebo správu nehnuteľnosti)',
        },
      ),
      input('nazovOrganizacie', { type: 'text', title: 'Názov organizácie', required: true }, {}),
      sharedAddressField('adresaSidla', 'Adresa sídla organizácie', true),
      conditionalFields(createCondition([[['typOdberatela'], { const: 'Existujúci' }]]), [
        input('cisloZmluvy', { type: 'text', title: 'Číslo zmluvy', required: true }, {}),
      ]),
      conditionalFields(
        createCondition([
          [
            ['typOdberatela'],
            {
              enum: [
                'Nový',
                'Existujúci',
                'Zmena poplatkovej povinnosti pre existujúceho zákazníka',
              ],
            },
          ],
        ]),
        [input('ico', { type: 'text', title: 'IČO', required: true }, {})],
      ),
      conditionalFields(createCondition([[['typOdberatela'], { const: 'Zmena odberateľa' }]]), [
        input(
          'icoPovodnehOdberatela',
          { type: 'text', title: 'IČO pôvodného odberateľa', required: true },
          {},
        ),
        input('noveIco', { type: 'text', title: 'Nové IČO', required: true }, {}),
        datePicker(
          'datumZmeny',
          { title: 'Dátum zmeny', required: true },
          { helptextHeader: 'Uveďte dátum predpokladanej zmeny odberateľa' },
        ),
      ]),
      conditionalFields(
        createCondition([
          [
            ['typOdberatela'],
            {
              enum: ['Zmena odberateľa'],
            },
          ],
        ]),
        [
          input(
            'dicNovehoOdberatela',
            { type: 'text', title: 'DIČ nového odberateľa', required: true },
            {},
          ),
        ],
        [input('dic', { type: 'text', title: 'DIČ', required: true }, {})],
      ),
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
      sharedPhoneNumberField('telefon', true),
      input('email', { title: 'Email', required: true, type: 'email' }, {}),
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
            { type: 'text', title: 'E-mail pre zasielanie elektronických faktúr', required: true },
            {},
          ),
        ]),
      ]),
      conditionalFields(
        createCondition([
          [
            ['typOdberatela'],
            {
              enum: ['Zmena poplatkovej povinnosti pre existujúceho zákazníka', 'Zmena odberateľa'],
            },
          ],
        ]),
        [
          radioGroup(
            'zmenyVPocteNadob',
            {
              type: 'boolean',
              title: 'Chcem vykonať zmeny v počte nádob alebo ohľadom frekvencie odvozu',
              required: true,
              options: [
                { value: true, title: 'Áno' },
                { value: false, title: 'Nie' },
              ],
            },
            { variant: 'boxed', orientations: 'row' },
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
          itemTitle: 'Odpad {index}',
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
                'Papier (Pravidelný odvoz odpadových obalov kat. číslo 15)',
                'Papier (Pravidelný odvoz vytriedených zložiek komunálneho odpadu kat. číslo 20)',
                'Plasty (Pravidelný odvoz odpadových obalov kat. číslo 15)',
                'Plasty (Pravidelný odvoz vytriedených zložiek komunálneho odpadu kat. číslo 20)',
                'Sklo (Pravidelný odvoz odpadových obalov kat. číslo 15)',
                'Sklo (Pravidelný odvoz vytriedených zložiek komunálneho odpadu kat. číslo 20)',
                'Kuchynský biologicky rozložiteľný odpad (Pravidelný odvoz vytriedených zložiek komunálneho odpadu kat. číslo 20)',
              ]),
            },
            { helptextHeader: 'Vyberte len 1 komoditu' },
          ),
          conditionalFields(
            createCondition([
              [
                ['druhOdpadu'],
                {
                  enum: [
                    'Papier (Pravidelný odvoz odpadových obalov kat. číslo 15)',
                    'Papier (Pravidelný odvoz vytriedených zložiek komunálneho odpadu kat. číslo 20)',
                  ],
                },
              ],
            ]),
            [
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
              select(
                'frekvenciaOdvozov',
                {
                  title: 'Frekvencia odvozov',
                  required: true,
                  options: createStringOptions(['1 x do týždňa', '2 x do týždňa']),
                },
                {},
              ),
            ],
          ),
          conditionalFields(
            createCondition([
              [
                ['druhOdpadu'],
                {
                  enum: [
                    'Plasty (Pravidelný odvoz odpadových obalov kat. číslo 15)',
                    'Plasty (Pravidelný odvoz vytriedených zložiek komunálneho odpadu kat. číslo 20)',
                  ],
                },
              ],
            ]),
            [
              select(
                'objemNadobyPlasty',
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
              select(
                'frekvenciaOdvozovPlasty',
                {
                  title: 'Frekvencia odvozov',
                  required: true,
                  options: createStringOptions(['1 x do týždňa', '2 x do týždňa']),
                },
                {},
              ),
            ],
          ),
          conditionalFields(
            createCondition([
              [
                ['druhOdpadu'],
                {
                  enum: [
                    'Sklo (Pravidelný odvoz odpadových obalov kat. číslo 15)',
                    'Sklo (Pravidelný odvoz vytriedených zložiek komunálneho odpadu kat. číslo 20)',
                  ],
                },
              ],
            ]),
            [
              select(
                'objemNadobySklo',
                {
                  title: 'Vyberte objem nádoby',
                  required: true,
                  options: createStringOptions([
                    '120 l zberná nádoba',
                    '240 l zberná nádoba',
                    '1800 l zvon na sklo',
                    '3000 l polopodzemný kontajner',
                  ]),
                },
                {},
              ),
              conditionalFields(
                createCondition([
                  [['objemNadobySklo'], { enum: ['120 l zberná nádoba', '240 l zberná nádoba'] }],
                ]),
                [
                  select(
                    'frekvenciaOdvozovSklo1',
                    {
                      title: 'Frekvencia odvozov',
                      required: true,
                      options: [{ value: '1x_do_tyzdna', title: '1 x do týždňa' }],
                    },
                    {},
                  ),
                ],
              ),
              conditionalFields(
                createCondition([[['objemNadobySklo'], { const: '1800 l zvon na sklo' }]]),
                [
                  select(
                    'frekvenciaOdvozovSklo2',
                    {
                      title: 'Frekvencia odvozov',
                      required: true,
                      options: [{ value: '1x_za_4_tyzdne', title: '1 x za 4 týždne' }],
                    },
                    {},
                  ),
                ],
              ),
            ],
          ),
          conditionalFields(
            createCondition([
              [
                ['druhOdpadu'],
                {
                  const:
                    'Kuchynský biologicky rozložiteľný odpad (Pravidelný odvoz vytriedených zložiek komunálneho odpadu kat. číslo 20)',
                },
              ],
            ]),
            [
              select(
                'objemNadobyKuchynskyOdpad',
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
                    '23 l zberná nádoba je možná vybrať iba pre právnické osoby, ktoré majú sídlo v rodinných domoch',
                },
              ),
              select(
                'frekvenciaOdvozovKuchynskyOdpad',
                {
                  title: 'Frekvencia odvozov',
                  required: true,
                  options: createStringOptions(['1 x do týždňa', '2 x do týždňa']),
                },
                {
                  helptextHeader:
                    'Kuchynský biologicky rozložiteľný odpad sa v Bratislave zbiera celoročne. Interval odvozov sa mení sezónne, a to dvakrát ročne. Od začiatku marca do konca novembra je zber realizovaný 2x za 7 dní. Od začiatku decembra do konca februára bude zber 1x do týždňa.',
                },
              ),
            ],
          ),
          number(
            'pocetNadob',
            { type: 'number', title: 'Počet nádob', required: true },
            { helptextHeader: 'Uveďte počet nádob' },
          ),
        ],
      ),
      input(
        'emailPotvrdenie',
        { type: 'email', title: 'E-mail (potvrdenie o prevzatí odpadov/obalov)', required: true },
        {},
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

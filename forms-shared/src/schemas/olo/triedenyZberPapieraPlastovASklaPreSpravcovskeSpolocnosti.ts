import {
  arrayField,
  checkbox,
  conditionalFields,
  customComponentsField,
  datePicker,
  input,
  number,
  radioGroup,
  schema,
  select,
  step,
} from '../../generator/functions'
import { createCondition, createStringOptions } from '../../generator/helpers'
import { sharedAddressField, sharedPhoneNumberField } from '../shared/fields'

export default schema(
  {
    title: 'Triedený zber papiera, plastov a skla pre správcovské spoločnosti',
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
          options: createStringOptions(['Nový', 'Existujúci', 'Zmena odberateľa']),
        },
        {
          variant: 'boxed',
          orientations: 'column',
          helptextHeader:
            'Nový (nemám uzavretú zmluvu), Existujúci (mám uzavretú zmluvu), Zmena odberateľa (napr. preberám prevádzku alebo správu nehnuteľnosti)',
        },
      ),
      input('nazovOrganizacie', { type: 'text', title: 'Názov organizácie', required: true }, {}),
      sharedAddressField('adresaSidla', 'Adresa sídla organizácie', true),
      conditionalFields(createCondition([[['typOdberatela'], { const: 'Existujúci' }]]), [
        input('cisloZmluvy', { type: 'text', title: 'Číslo zmluvy', required: true }, {}),
      ]),
      conditionalFields(createCondition([[['typOdberatela'], { enum: ['Nový', 'Existujúci'] }]]), [
        input('ico', { type: 'text', title: 'IČO', required: true }, {}),
      ]),
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
      input('dic', { type: 'text', title: 'DIČ', required: true }, {}),
      checkbox(
        'platcaDph',
        { title: 'Som platca DPH?', required: true },
        { checkboxLabel: 'Som platca DPH', variant: 'boxed' },
      ),
      conditionalFields(createCondition([[['platcaDph'], { const: true }]]), [
        input('icDph', { type: 'text', title: 'IČ DPH', required: true }, {}),
      ]),
      input(
        'menoKontaktnejOsoby',
        { type: 'text', title: 'Meno kontaktnej osoby', required: true },
        {},
      ),
      sharedPhoneNumberField('telefon', true),
      input('email', { title: 'Email', required: true, type: 'email' }, {}),
      input('iban', { type: 'ba-iban', title: 'IBAN', required: true }, {}),
      checkbox(
        'elektronickaFaktura',
        {
          title: 'Súhlasím so zaslaním elektronickej faktúry',
          required: true,
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
      conditionalFields(
        createCondition([[['typOdberatela'], { enum: ['Existujúci', 'Zmena odberateľa'] }]]),
        [
          checkbox(
            'zmenyVPocteNadob',
            {
              title: 'Chcem vykonať zmeny v počte nádob alebo ohľadom frekvencie odvozu',
              required: true,
            },
            {
              checkboxLabel: 'Áno, chcem vykonať zmeny',
              variant: 'boxed',
            },
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
                'Papier (Pravidelný odvoz vytriedených zložiek komunálneho odpadu kat. číslo 20)',
                'Plasty (Pravidelný odvoz vytriedených zložiek komunálneho odpadu kat. číslo 20)',
                'Sklo (Pravidelný odvoz vytriedených zložiek komunálneho odpadu kat. číslo 20)',
              ]),
            },
            {
              helptextHeader:
                'Vyberte len 1 komoditu. Správcovia nehnuteľností v prípade Kuchynského biologicky rozložiteľného odpadu riešia zapojenie a zmeny v systéme zapojenia na Magistráte hlavného mesta. Zmesový komunálny odpad sa rieši na Magistráte hlavného mesta (https://bratislava.sk/mesto-bratislava/dane-a-poplatky/poplatok-za-komunalne-odpady-a-drobne-stavebne-odpady).',
            },
          ),
          conditionalFields(
            createCondition([
              [
                ['druhOdpadu'],
                {
                  enum: [
                    'Papier (Pravidelný odvoz vytriedených zložiek komunálneho odpadu kat. číslo 20)',
                    'Plasty (Pravidelný odvoz vytriedených zložiek komunálneho odpadu kat. číslo 20)',
                  ],
                },
              ],
            ]),
            [
              select(
                'objemNadobyPapierPlasty',
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
                'frekvenciaOdvozovPapierPlasty',
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
                  const:
                    'Sklo (Pravidelný odvoz vytriedených zložiek komunálneho odpadu kat. číslo 20)',
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
                      options: createStringOptions(['1 x do týždňa']),
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

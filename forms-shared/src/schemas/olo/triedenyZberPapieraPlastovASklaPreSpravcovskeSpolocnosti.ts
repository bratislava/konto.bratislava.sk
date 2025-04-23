import { createCondition, createStringItems, createStringItemsV2 } from '../../generator/helpers'
import { sharedAddressField, sharedPhoneNumberField } from '../shared/fields'
import { select } from '../../generator/functions/select'
import { input } from '../../generator/functions/input'
import { number } from '../../generator/functions/number'
import { radioGroup } from '../../generator/functions/radioGroup'
import { checkbox } from '../../generator/functions/checkbox'
import { datePicker } from '../../generator/functions/datePicker'
import { customComponentsField } from '../../generator/functions/customComponentsField'
import { object } from '../../generator/object'
import { arrayField } from '../../generator/functions/arrayField'
import { step } from '../../generator/functions/step'
import { conditionalFields } from '../../generator/functions/conditionalFields'
import { schema } from '../../generator/functions/schema'
import { SchemalessFormDataExtractor } from '../../form-utils/evaluateFormDataExtractor'

const getFakturacia = (novyOdberatel: boolean) =>
  object(
    novyOdberatel ? 'fakturaciaNovehoOdoberatela' : 'fakturacia',
    { objectDisplay: 'boxed', title: 'Fakturácia' },
    [
      input(
        'iban',
        { type: 'ba-iban', title: novyOdberatel ? 'Nový IBAN' : 'IBAN', required: true },
        {},
      ),
      checkbox(
        'elektronickaFaktura',
        {
          title: 'Súhlasím so zaslaním elektronickej faktúry',
        },
        {
          helptext:
            'V prípade vyjadrenia nesúhlasu bude zákazníkovi za zasielanie faktúry poštou účtovaný poplatok 10 € bez DPH. Osobitné ustanovenia o zasielaní faktúry v elektronickej podobe v zmysle bodu 5.9 VOP.',
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
    ],
  )

export default schema(
  {
    title: 'Triedený zber papiera, plastov a skla pre správcovské spoločnosti',
  },
  [
    step('ziadatel', { title: 'Žiadateľ' }, [
      radioGroup(
        'typOdberatela',
        {
          type: 'string',
          title: 'Typ odberateľa',
          required: true,
          items: createStringItemsV2([
            {
              label: 'Nový',
              description: 'Nemám uzavretú zmluvu',
            },
            {
              label: 'Existujúci',
              description: 'Mám uzavretú zmluvu',
            },
            {
              label: 'Zmena odberateľa',
              description: 'Napr. preberám prevádzku alebo správu nehnuteľnosti',
            },
          ]),
        },
        {
          variant: 'boxed',
          orientations: 'column',
        },
      ),
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
            'nazovOrganizaciePovodnehoOdberatela',
            { type: 'text', title: 'Názov organizácie pôvodného odberateľa', required: true },
            {},
          ),
          input(
            'nazovOrganizacieNovehoOdberatela',
            { type: 'text', title: 'Názov organizácie nového odberateľa', required: true },
            {},
          ),
          sharedAddressField('novaAdresaSidla', 'Nová adresa sídla organizácie', true),
        ],
        [
          input(
            'nazovOrganizacie',
            { type: 'text', title: 'Názov organizácie', required: true },
            {},
          ),
          sharedAddressField('adresaSidla', 'Adresa sídla organizácie', true),
        ],
      ),
      conditionalFields(createCondition([[['typOdberatela'], { const: 'Existujúci' }]]), [
        input('cisloZmluvy', { type: 'text', title: 'Číslo zmluvy', required: true }, {}),
      ]),
      conditionalFields(createCondition([[['typOdberatela'], { enum: ['Nový', 'Existujúci'] }]]), [
        input('ico', { type: 'text', title: 'IČO', required: true }, {}),
      ]),
      conditionalFields(
        createCondition([[['typOdberatela'], { const: 'Zmena odberateľa' }]]),
        [
          input(
            'icoPovodnehoOdberatela',
            { type: 'text', title: 'IČO pôvodného odberateľa', required: true },
            {},
          ),
          input('noveIco', { type: 'text', title: 'Nové IČO', required: true }, {}),
          input(
            'dicNovehoOdberatela',
            { type: 'text', title: 'DIČ nového odberateľa', required: true },
            {},
          ),
          datePicker(
            'datumZmeny',
            { title: 'Dátum zmeny', required: true },
            { helptext: 'Uveďte dátum predpokladanej zmeny odberateľa' },
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
      input(
        'menoKontaktnejOsoby',
        { type: 'text', title: 'Meno kontaktnej osoby', required: true },
        {},
      ),
      conditionalFields(
        createCondition([[['typOdberatela'], { const: 'Zmena odberateľa' }]]),
        [
          input(
            'noveTelefonneCislo',
            { type: 'ba-phone-number', title: 'Nové telefónne číslo', required: true },
            { size: 'medium', placeholder: '+421' },
          ),
          input('novyEmail', { title: 'Nový email', required: true, type: 'email' }, {}),
        ],
        [
          sharedPhoneNumberField('telefon', true),
          input('email', { title: 'Email', required: true, type: 'email' }, {}),
        ],
      ),
      conditionalFields(
        createCondition([[['typOdberatela'], { enum: ['Zmena odberateľa'] }]]),
        [getFakturacia(true)],
        [getFakturacia(false)],
      ),
      conditionalFields(createCondition([[['typOdberatela'], { enum: ['Zmena odberateľa'] }]]), [
        radioGroup(
          'zmenyVPocteNadob',
          {
            type: 'boolean',
            title: 'Chcem vykonať zmeny v počte nádob alebo ohľadom frekvencie odvozu',
            required: true,
            items: [
              { value: true, label: 'Áno' },
              { value: false, label: 'Nie' },
            ],
          },
          { variant: 'boxed', orientations: 'row' },
        ),
      ]),
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
            { helptext: 'Vyplňte vo formáte ulica a číslo' },
          ),
          select(
            'druhOdpadu',
            {
              title: 'Vyberte druh odpadu',
              required: true,
              items: createStringItems([
                'Papier (Pravidelný odvoz vytriedených zložiek komunálneho odpadu kat. číslo 20)',
                'Plasty (Pravidelný odvoz vytriedených zložiek komunálneho odpadu kat. číslo 20)',
                'Sklo (Pravidelný odvoz vytriedených zložiek komunálneho odpadu kat. číslo 20)',
              ]),
            },
            {
              helptext:
                'Vyberte len 1 komoditu. Správcovia nehnuteľností v prípade Kuchynského biologicky rozložiteľného odpadu riešia zapojenie a zmeny v systéme zapojenia na Magistráte hlavného mesta. **Zmesový komunálny odpad sa rieši na** [Magistráte hlavného mesta](https://bratislava.sk/mesto-bratislava/dane-a-poplatky/poplatok-za-komunalne-odpady-a-drobne-stavebne-odpady).',
              helptextMarkdown: true,
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
                  items: createStringItems([
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
                  items: createStringItems(['1 x do týždňa', '2 x do týždňa']),
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
                  items: createStringItems([
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
                      items: createStringItems(['1 x do týždňa']),
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
                      items: [{ value: '1x_za_4_tyzdne', label: '1 x za 4 týždne' }],
                    },
                    {},
                  ),
                ],
              ),
            ],
          ),
          number(
            'pocetNadob',
            { title: 'Počet nádob', type: 'integer', required: true, minimum: 1 },
            { helptext: 'Uveďte počet nádob' },
          ),
        ],
      ),
      radioGroup(
        'emailPotvrdeniePouzitIny',
        {
          type: 'boolean',
          title:
            'Chcete dostať potvrdenie o prevzatí odpadov/obalov aj na iný email ako uvedený v kroku žiadateľ?',
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
      conditionalFields(createCondition([[['emailPotvrdeniePouzitIny'], { const: true }]]), [
        input(
          'emailPotvrdenie',
          { type: 'text', title: 'Email', required: true },
          {
            helptext: 'V prípade viacerých emailov ich oddeľte čiarkou',
          },
        ),
      ]),
    ]),
    step('suhlasy', { title: 'Súhlasy' }, [
      checkbox(
        'suhlasSVop',
        {
          title: 'Súhlas so Všeobecnými obchodnými podmienkami OLO',
          required: true,
          constValue: true,
        },
        {
          checkboxLabel: 'Súhlasím s Všeobecnými obchodnými podmienkami OLO',
          variant: 'boxed',
        },
      ),
      customComponentsField(
        'suhlasSVopLink',
        {
          type: 'additionalLinks',
          props: {
            links: [
              {
                title: 'Všeobecné obchodné podmienky OLO',
                href: 'https://olo.sk/vseobecne-obchodne-podmienky',
              },
            ],
          },
        },
        {},
      ),
    ]),
  ],
)

type ExtractFormData = {
  ziadatel:
    | {
        typOdberatela: 'Nový' | 'Existujúci'
        email: string
        nazovOrganizacie: string
      }
    | {
        typOdberatela: 'Zmena odberateľa'
        novyEmail: string
        nazovOrganizacieNovehoOdberatela: string
      }
}

export const triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnostiExtractEmail: SchemalessFormDataExtractor<ExtractFormData> =
  {
    type: 'schemaless',
    extractFn: (formData) => {
      if (formData.ziadatel.typOdberatela === 'Zmena odberateľa') {
        return formData.ziadatel.novyEmail
      }

      return formData.ziadatel.email
    },
  }

export const triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnostiExtractName: SchemalessFormDataExtractor<ExtractFormData> =
  {
    type: 'schemaless',
    extractFn: (formData) => {
      if (formData.ziadatel.typOdberatela === 'Zmena odberateľa') {
        return formData.ziadatel.nazovOrganizacieNovehoOdberatela
      }
      return formData.ziadatel.nazovOrganizacie
    },
  }

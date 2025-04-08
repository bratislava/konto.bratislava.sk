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
import { SchemalessFormDataExtractor } from 'src/form-utils/evaluateFormDataExtractor'

const getFakturacia = (novyOdberatel: boolean) =>
  object(
    novyOdberatel ? 'fakturaciaNovehoOdoberatela' : 'fakturacia',
    { required: true },
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
              label: 'Zmena poplatkovej povinnosti pre existujúceho zákazníka',
              description: 'Spoplatnenie služby',
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
      input('nazovOrganizacie', { type: 'text', title: 'Názov organizácie', required: true }, {}),
      sharedAddressField('adresaSidla', 'Adresa sídla organizácie', true),
      conditionalFields(createCondition([[['typOdberatela'], { const: 'Existujúci' }]]), [
        input('cisloZmluvy', { type: 'text', title: 'Číslo zmluvy', required: true }, {}),
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
        [
          input('ico', { type: 'text', title: 'IČO', required: true }, {}),
          input('dic', { type: 'text', title: 'DIČ', required: true }, {}),
        ],
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
        'konatel',
        { type: 'text', title: 'Konateľ', required: true },
        { helptext: 'Uveďte meno a priezvisko konateľa' },
      ),
      input(
        'zastupeny',
        {
          type: 'text',
          title: 'Zastúpený - na základe splnomocnenia',
          required: true,
        },
        { helptext: 'Uveďte meno a priezvisko osoby zastupujúcej na základe splnomocnenia' },
      ),
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
              items: [
                { value: true, label: 'Áno' },
                { value: false, label: 'Nie' },
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
                'Papier (Pravidelný odvoz odpadových obalov kat. číslo 15)',
                'Papier (Pravidelný odvoz vytriedených zložiek komunálneho odpadu kat. číslo 20)',
                'Plasty (Pravidelný odvoz odpadových obalov kat. číslo 15)',
                'Plasty (Pravidelný odvoz vytriedených zložiek komunálneho odpadu kat. číslo 20)',
                'Sklo (Pravidelný odvoz odpadových obalov kat. číslo 15)',
                'Sklo (Pravidelný odvoz vytriedených zložiek komunálneho odpadu kat. číslo 20)',
                'Kuchynský biologicky rozložiteľný odpad (Pravidelný odvoz vytriedených zložiek komunálneho odpadu kat. číslo 20)',
              ]),
            },
            { helptext: 'Vyberte len 1 komoditu' },
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
                'frekvenciaOdvozov',
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
                'frekvenciaOdvozovPlasty',
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
                      items: [{ value: '1x_do_tyzdna', label: '1 x do týždňa' }],
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
                  items: createStringItems(['120 l zberná nádoba', '240 l zberná nádoba']),
                },
                {},
              ),
              select(
                'frekvenciaOdvozovKuchynskyOdpad',
                {
                  title: 'Frekvencia odvozov',
                  required: true,
                  items: createStringItems(['1 x do týždňa', '2 x do týždňa']),
                },
                {
                  helptext:
                    'Kuchynský biologicky rozložiteľný odpad sa v Bratislave zbiera celoročne. Interval odvozov sa mení sezónne, a to dvakrát ročne. Od začiatku marca do konca novembra je zber realizovaný 2x za 7 dní. Od začiatku decembra do konca februára bude zber 1x do týždňa.',
                },
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
  ziadatel: (
    | {
        typOdberatela:
          | 'Nový'
          | 'Existujúci'
          | 'Zmena poplatkovej povinnosti pre existujúceho zákazníka'
        email: string
      }
    | {
        typOdberatela: 'Zmena odberateľa'
        novyEmail: string
      }
  ) & {
    nazovOrganizacie: string
  }
}

export const triedenyZberPapieraPlastovASklaPrePravnickeOsobyExtractEmail: SchemalessFormDataExtractor<ExtractFormData> =
  {
    type: 'schemaless',
    extractFn: (formData) => {
      if (formData.ziadatel.typOdberatela === 'Zmena odberateľa') {
        return formData.ziadatel.novyEmail
      }

      return formData.ziadatel.email
    },
  }

export const triedenyZberPapieraPlastovASklaPrePravnickeOsobyExtractName: SchemalessFormDataExtractor<ExtractFormData> =
  {
    type: 'schemaless',
    extractFn: (formData) => formData.ziadatel.nazovOrganizacie,
  }

import {
  arrayField,
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
import { sharedAddressField, sharedPhoneNumberField } from '../shared/fields'
import { createCondition, createStringItems } from '../../generator/helpers'
import { GenericObjectType } from '@rjsf/utils'
import { safeString } from '../../form-utils/safeData'

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
          title: 'Žiadam ako',
          required: true,
          items: createStringItems(['Fyzická osoba', 'Právnická osoba', 'Správcovská spoločnosť']),
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
        createCondition([
          [['ziadatelTyp'], { enum: ['Právnická osoba', 'Správcovská spoločnosť'] }],
        ]),
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
          {
            helptext: 'Uveďte meno a priezvisko osoby zastupujúcej na základe splnomocnenia',
          },
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
              input('iban', { type: 'ba-iban', title: 'IBAN', required: true }, {}),
              checkbox(
                'elektronickaFaktura',
                {
                  title: 'Zasielanie faktúry elektronicky',
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
            { helptext: 'Vyplňte vo formáte ulica a číslo' },
          ),
          select(
            'druhOdpadu',
            {
              title: 'Vyberte druh odpadu',
              required: true,
              items: createStringItems([
                'Zmesový komunálny odpad',
                'Kuchynský biologicky rozložiteľný odpad',
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
                  items: createStringItems([
                    '23 l zberná nádoba',
                    '120 l zberná nádoba',
                    '240 l zberná nádoba',
                  ]),
                },
                {
                  helptext: '23 l zberná nádoba sa poskytuje iba pre odvoz z rodinných domov.',
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
                items: createStringItems(['120 l zberná nádoba']),
              },
              {
                helptext:
                  'Služba sa poskytuje iba pre bytové doby a firmy. Pre rodinné domy sú určené nádoby na [zberné hniezda](https://www.olo.sk/zberne-hniezda/).',
                helptextMarkdown: true,
              },
            ),
          ]),
          conditionalFields(createCondition([[['druhOdpadu'], { const: 'Papier' }]]), [
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
            ],
          ),
          conditionalFields(createCondition([[['druhOdpadu'], { const: 'Sklo' }]]), [
            select(
              'objemNadobySklo',
              {
                title: 'Vyberte objem nádoby',
                required: true,
                items: createStringItems([
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
                  items: createStringItems(['120 l zberná nádoba', '240 l zberná nádoba']),
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
          helptext:
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
          helptext: 'Špecifikujte individuálne požiadavky.',
        },
      ),
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

export const mimoriadnyOdvozAZhodnotenieOdpaduExtractEmail = (formData: GenericObjectType) =>
  safeString(formData.ziadatel?.email)

export const mimoriadnyOdvozAZhodnotenieOdpaduExtractName = (formData: GenericObjectType) => {
  if (formData.ziadatel?.ziadatelTyp === 'Fyzická osoba') {
    return safeString(formData.ziadatel?.menoPriezvisko?.meno)
  }
  if (
    formData.ziadatel?.ziadatelTyp === 'Právnická osoba' ||
    formData.ziadatel?.ziadatelTyp === 'Správcovská spoločnosť'
  ) {
    return safeString(formData.ziadatel?.nazov)
  }
}

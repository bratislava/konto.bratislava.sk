import { createCondition, createStringItems } from '../../generator/helpers'
import { sharedAddressField, sharedPhoneNumberField } from '../shared/fields'
import { select } from '../../generator/functions/select'
import { input } from '../../generator/functions/input'
import { radioGroup } from '../../generator/functions/radioGroup'
import { textArea } from '../../generator/functions/textArea'
import { checkbox } from '../../generator/functions/checkbox'
import { datePicker } from '../../generator/functions/datePicker'
import { timePicker } from '../../generator/functions/timePicker'
import { customComponentsField } from '../../generator/functions/customComponentsField'
import { object } from '../../generator/object'
import { step } from '../../generator/functions/step'
import { conditionalFields } from '../../generator/functions/conditionalFields'
import { schema } from '../../generator/functions/schema'
import { SchemalessFormDataExtractor } from '../../form-utils/evaluateFormDataExtractor'

export default schema({ title: 'Odvoz odpadu veľkokapacitným alebo lisovacím kontajnerom' }, [
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
      object('menoPriezvisko', {}, [
        input('meno', { title: 'Meno', required: true, type: 'text' }, { selfColumn: '2/4' }),
        input(
          'priezvisko',
          { title: 'Priezvisko', required: true, type: 'text' },
          { selfColumn: '2/4' },
        ),
      ]),
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
    object('fakturacia', { objectDisplay: 'boxed', title: 'Fakturácia' }, [
      input('iban', { type: 'ba-iban', title: 'IBAN', required: true }, {}),
      checkbox(
        'elektronickaFaktura',
        {
          title: 'Zasielanie faktúry elektronicky',
          required: true,
        },
        {
          helptext:
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
      { type: 'text', title: 'Miesto dodania / výkonu služby', required: true },
      { helptext: 'Vyplňte vo formáte ulica a číslo' },
    ),
    select(
      'druhOdpadu',
      {
        title: 'Druh odpadu',
        required: true,
        items: createStringItems(['Objemný', 'Záhradný', 'Iné'], false),
      },
      {},
    ),
    conditionalFields(createCondition([[['druhOdpadu'], { const: 'Iné' }]]), [
      textArea(
        'druhOdpaduIne',
        {
          title: 'Druh odpadu iné',
          required: true,
        },
        {
          placeholder: 'Špecifikujte, prosím, druh odpadu',
        },
      ),
    ]),
    select(
      'objemKontajnera',
      {
        title: 'Objem kontajnera',
        required: true,
        items: [
          { value: '7m3_3t', label: 'objem: 7 m³ / nosnosť: do 3 t' },
          { value: '10m3_3t', label: 'objem: 10 m³ / nosnosť: do 3 t' },
          { value: '11m3_8t', label: 'objem: 11 m³ / nosnosť: do 8 t' },
          { value: '16m3_8t', label: 'objem: 16 m³ / nosnosť: do 8 t' },
          { value: '27m3_8t', label: 'objem: 27 m³ / nosnosť: do 8 t' },
          { value: '30m3_8t', label: 'objem: 30 m³ / nosnosť: do 8 t' },
        ],
      },
      {},
    ),
    datePicker(
      'preferovanyDatumPristavenia',
      {
        title: 'Preferovaný dátum pristavenia kontajnera',
        required: true,
      },
      { size: 'medium' },
    ),
    timePicker(
      'casPristavenia',
      {
        title: 'Čas pristavenia kontajnera',
        required: true,
      },
      {
        helptext: 'V pracovné dni od 7.00 - 12.30',
        size: 'medium',
      },
    ),
    datePicker(
      'datumOdvozu',
      {
        title: 'Presný dátum odvozu kontajnera',
        required: true,
      },
      { size: 'medium' },
    ),
    timePicker(
      'casOdvozu',
      {
        title: 'Čas odvozu kontajnera',
        required: true,
      },
      {
        helptext: 'V pracovné dni od 7.00 - 12.30',
        size: 'medium',
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
])

type ExtractFormData = {
  ziadatel: {
    email: string
  } & (
    | {
        ziadatelTyp: 'Fyzická osoba'
        menoPriezvisko: {
          meno: string
        }
      }
    | {
        ziadatelTyp: 'Právnická osoba' | 'Správcovská spoločnosť'
        nazov: string
      }
  )
}

export const odvozOdpaduVelkokapacitnymAleboLisovacimKontajneromExtractEmail: SchemalessFormDataExtractor<ExtractFormData> =
  {
    type: 'schemaless',
    extractFn: (formData) => formData.ziadatel.email,
  }

export const odvozOdpaduVelkokapacitnymAleboLisovacimKontajneromExtractName: SchemalessFormDataExtractor<ExtractFormData> =
  {
    type: 'schemaless',
    extractFn: (formData) => {
      const ziadatel = formData.ziadatel
      if (ziadatel.ziadatelTyp === 'Fyzická osoba') {
        return ziadatel.menoPriezvisko.meno
      } else if (
        ziadatel.ziadatelTyp === 'Právnická osoba' ||
        ziadatel.ziadatelTyp === 'Správcovská spoločnosť'
      ) {
        return ziadatel.nazov
      }

      // Unreachable code, provided for type-safety to return `string` as required.
      throw new Error('Failed to extract the name.')
    },
  }

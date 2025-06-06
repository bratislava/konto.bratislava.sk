import { createCondition, createStringItems } from '../../generator/helpers'
import { sharedAddressField, sharedPhoneNumberField } from '../shared/fields'
import { input } from '../../generator/functions/input'
import { radioGroup } from '../../generator/functions/radioGroup'
import { textArea } from '../../generator/functions/textArea'
import { checkbox } from '../../generator/functions/checkbox'
import { customComponentsField } from '../../generator/functions/customComponentsField'
import { object } from '../../generator/object'
import { step } from '../../generator/functions/step'
import { conditionalFields } from '../../generator/functions/conditionalFields'
import { schema } from '../../generator/functions/schema'
import { fileUploadMultiple } from '../../generator/functions/fileUploadMultiple'
import { SchemalessFormDataExtractor } from '../../form-utils/evaluateFormDataExtractor'

export default schema({ title: 'KOLO Taxi' }, [
  step('ziadatel', { title: 'Žiadateľ' }, [
    radioGroup(
      'ziadatelTyp',
      {
        type: 'string',
        title: 'Žiadam ako',
        required: true,
        items: createStringItems(['Fyzická osoba', 'Právnická osoba']),
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
      sharedAddressField('adresaTrvalehoPobytu', 'Adresa trvalého pobytu', true),
    ]),
    conditionalFields(createCondition([[['ziadatelTyp'], { const: 'Právnická osoba' }]]), [
      input('nazovOrganizacie', { type: 'text', title: 'Názov organizácie', required: true }, {}),
      sharedAddressField('adresaSidlaOrganizacie', 'Adresa sídla organizácie', true),
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
    ]),
    sharedPhoneNumberField('telefon', true),
    input('email', { title: 'Email', required: true, type: 'email' }, {}),
    conditionalFields(createCondition([[['ziadatelTyp'], { const: 'Právnická osoba' }]]), [
      object('fakturacia', { objectDisplay: 'boxed', title: 'Fakturácia' }, [
        input('iban', { type: 'ba-iban', title: 'IBAN', required: true }, {}),
        checkbox(
          'elektronickaFaktura',
          {
            title: 'Súhlasím so zaslaním elektronickej faktúry',
          },
          {
            helptext:
              'V prípade vyjadrenia nesúhlasu bude zákazníkovi za zasielanie faktúry poštou účtovaný poplatok 10 € bez DPH.',
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
        helptext: 'Vyplňte vo formáte ulica a číslo',
      },
    ),
    textArea(
      'popisDarovanychVeci',
      {
        title: 'Popis darovaných vecí',
        required: true,
      },
      {
        helptext: 'Okrem čalúneného nábytku a elektrospotrebičov',
      },
    ),
    fileUploadMultiple(
      'fotoDarovanychVeci',
      {
        title: 'Foto darovaných vecí',
        required: true,
      },
      {
        type: 'dragAndDrop',
        helptext: 'Nahrajte fotografiu vecí, ktoré chcete darovať (jpg, jpeg, png, max. 5MB)',
      },
    ),
    checkbox(
      'suhlasSPlatbou',
      {
        title: 'Vyjadrenie súhlasu s platbou',
        required: true,
        constValue: true,
      },
      {
        checkboxLabel: 'Súhlasím s platbou za službu KOLO Taxi',
        variant: 'boxed',
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

type ExtractFormData =
  | {
      ziadatel: {
        ziadatelTyp: 'Fyzická osoba'
        menoPriezvisko: {
          meno: string
        }
        email: string
      }
    }
  | {
      ziadatel: {
        ziadatelTyp: 'Právnická osoba'
        nazovOrganizacie: string
        email: string
      }
    }

export const koloTaxiExtractEmail: SchemalessFormDataExtractor<ExtractFormData> = {
  type: 'schemaless',
  extractFn: (formData) => formData.ziadatel.email,
}

export const koloTaxiExtractName: SchemalessFormDataExtractor<ExtractFormData> = {
  type: 'schemaless',
  extractFn: (formData) => {
    if (formData.ziadatel.ziadatelTyp === 'Fyzická osoba') {
      return formData.ziadatel.menoPriezvisko.meno
    } else if (formData.ziadatel.ziadatelTyp === 'Právnická osoba') {
      return formData.ziadatel.nazovOrganizacie
    }

    // Unreachable code, provided for type-safety to return `string` as required.
    throw new Error('Failed to extract the name.')
  },
}

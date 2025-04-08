import { createCondition, createStringItems } from '../../generator/helpers'
import { sharedAddressField, sharedPhoneNumberField } from '../shared/fields'
import { input } from '../../generator/functions/input'
import { radioGroup } from '../../generator/functions/radioGroup'
import { checkbox } from '../../generator/functions/checkbox'
import { datePicker } from '../../generator/functions/datePicker'
import { customComponentsField } from '../../generator/functions/customComponentsField'
import { object } from '../../generator/object'
import { step } from '../../generator/functions/step'
import { conditionalFields } from '../../generator/functions/conditionalFields'
import { schema } from '../../generator/functions/schema'
import { SchemalessFormDataExtractor } from '../../form-utils/evaluateFormDataExtractor'

export default schema({ title: 'Odvoz objemného odpadu valníkom' }, {}, [
  step('ziadatel', { title: 'Žiadateľ' }, [
    radioGroup(
      'ziadatelTyp',
      {
        type: 'string',
        title: 'Žiadam ako',
        required: true,
        items: createStringItems(['Právnická osoba', 'Správcovská spoločnosť']),
      },
      { variant: 'boxed', orientations: 'column' },
    ),
    input('nazov', { type: 'text', title: 'Názov organizácie', required: true }, {}),
    sharedAddressField('adresaSidla', 'Adresa sídla organizácie', true),
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
    input('kontaktnaOsoba', { type: 'text', title: 'Meno kontaktnej osoby', required: true }, {}),
    sharedPhoneNumberField('telefon', true),
    input('email', { title: 'E-mail', required: true, type: 'email' }, {}),
    object('fakturacia', { required: true }, { objectDisplay: 'boxed', title: 'Fakturácia' }, [
      input('iban', { type: 'ba-iban', title: 'IBAN', required: true }, {}),
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
        helptext: 'Vyplňte vo formáte ulica a číslo',
      },
    ),
    datePicker(
      'preferovanyDatumPristavenia',
      {
        title: 'Preferovaný dátum pristavenia vozidla',
        required: true,
      },
      { size: 'medium' },
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
    nazov: string
  }
}

export const odvozObjemnehoOdpaduValnikomExtractEmail: SchemalessFormDataExtractor<ExtractFormData> =
  {
    type: 'schemaless',
    extractFn: (formData) => formData.ziadatel.email,
  }

export const odvozObjemnehoOdpaduValnikomExtractName: SchemalessFormDataExtractor<ExtractFormData> =
  {
    type: 'schemaless',
    extractFn: (formData) => formData.ziadatel.nazov,
  }

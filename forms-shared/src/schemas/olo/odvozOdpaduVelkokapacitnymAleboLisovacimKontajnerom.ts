import {
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
  timePicker,
} from '../../generator/functions'
import { createCondition, createStringOptions } from '../../generator/helpers'
import { sharedAddressField, sharedPhoneNumberField } from '../shared/fields'
import { GenericObjectType } from '@rjsf/utils'
import { safeString } from '../../form-utils/safeData'

export default schema({ title: 'Odvoz odpadu veľkokapacitným alebo lisovacím kontajnerom' }, {}, [
  step('ziadatel', { title: 'Žiadateľ' }, [
    radioGroup(
      'ziadatelTyp',
      {
        type: 'string',
        title: 'Žiadam ako',
        required: true,
        options: createStringOptions([
          'Fyzická osoba',
          'Právnická osoba',
          'Správcovská spoločnosť',
        ]),
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
    object('fakturacia', { required: true }, { objectDisplay: 'boxed', title: 'Fakturácia' }, [
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
    ]),
  ]),
  step('sluzba', { title: 'Služba' }, [
    input(
      'miestoDodania',
      { type: 'text', title: 'Miesto dodania / výkonu služby', required: true },
      { helptextHeader: 'Presná adresa' },
    ),
    select(
      'druhOdpadu',
      {
        title: 'Druh odpadu',
        required: true,
        options: createStringOptions(['Objemný', 'Záhradný', 'Iné'], false),
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
        options: [
          { value: '7m3_3t', title: 'objem: 7 m³ / nosnosť: do 3 t' },
          { value: '10m3_3t', title: 'objem: 10 m³ / nosnosť: do 3 t' },
          { value: '11m3_8t', title: 'objem: 11 m³ / nosnosť: do 8 t' },
          { value: '16m3_8t', title: 'objem: 16 m³ / nosnosť: do 8 t' },
          { value: '27m3_8t', title: 'objem: 27 m³ / nosnosť: do 8 t' },
          { value: '30m3_8t', title: 'objem: 30 m³ / nosnosť: do 8 t' },
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
        helptextHeader: 'V pracovné dni od 7.00 - 12.30',
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
        helptextHeader: 'V pracovné dni od 7.00 - 12.30',
        size: 'medium',
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
])

export const odvozOdpaduVelkokapacitnymAleboLisovacimKontajneromExtractEmail = (
  formData: GenericObjectType,
) => safeString(formData.ziadatel?.email)

export const odvozOdpaduVelkokapacitnymAleboLisovacimKontajneromExtractName = (
  formData: GenericObjectType,
) => {
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

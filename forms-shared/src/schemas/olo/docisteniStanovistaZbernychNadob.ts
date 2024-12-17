import { createCondition, createStringItems } from '../../generator/helpers'
import { sharedAddressField, sharedPhoneNumberField } from '../shared/fields'
import { GenericObjectType } from '@rjsf/utils'
import { safeString } from '../../form-utils/safeData'
import { select } from '../../generator/functions/select'
import { input } from '../../generator/functions/input'
import { radioGroup } from '../../generator/functions/radioGroup'
import { textArea } from '../../generator/functions/textArea'
import { checkbox } from '../../generator/functions/checkbox'
import { datePicker } from '../../generator/functions/datePicker'
import { customComponentsField } from '../../generator/functions/customComponentsField'
import { object } from '../../generator/object'
import { step } from '../../generator/functions/step'
import { conditionalFields } from '../../generator/functions/conditionalFields'
import { schema } from '../../generator/functions/schema'

export default schema({ title: 'Dočistenie stanovišťa zberných nádob' }, {}, [
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
    object('fakturacia', { required: true }, { objectDisplay: 'boxed', title: 'Fakturácia' }, [
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
      {
        type: 'text',
        title: 'Miesto dodania / výkonu služby',
        required: true,
      },
      {
        helptext: 'Vyplňte vo formáte ulica a číslo',
      },
    ),
    select(
      'komodita',
      {
        title: 'Vyberte komoditu',
        required: true,
        items: createStringItems(
          [
            'Papier',
            'Plast',
            'Zmesový komunálny odpad',
            'Kuchynský biologicky rozložiteľný odpad',
            'Biologicky rozložiteľný odpad',
          ],
          false,
        ),
      },
      {
        helptext: 'Poplatok je účtovaný za množstvo naložených a vysypaných nádob',
      },
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
        size: 'medium',
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
])

export const docisteniStanovistaZbernychNadobExtractEmail = (formData: GenericObjectType) =>
  safeString(formData.ziadatel?.email)

export const docisteniStanovistaZbernychNadobExtractName = (formData: GenericObjectType) => {
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

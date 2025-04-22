import { createCondition } from '../generator/helpers'
import { selectMultiple } from '../generator/functions/selectMultiple'
import { input } from '../generator/functions/input'
import { radioGroup } from '../generator/functions/radioGroup'
import { fileUpload } from '../generator/functions/fileUpload'
import { datePicker } from '../generator/functions/datePicker'
import { step } from '../generator/functions/step'
import { conditionalFields } from '../generator/functions/conditionalFields'
import { schema } from '../generator/functions/schema'
import { fileUploadMultiple } from '../generator/functions/fileUploadMultiple'
import { esbsKatastralneUzemiaCiselnik } from '../tax-form/mapping/shared/esbsCiselniky'
import { object } from '../generator/object'
import { textArea } from '../generator/functions/textArea'
import {
  SchemaFormDataExtractor,
  SchemalessFormDataExtractor,
} from '../form-utils/evaluateFormDataExtractor'
import { BAJSONSchema7 } from '../form-utils/ajvKeywords'

const addressFields = (title: string) => [
  input(
    'ulicaACislo',
    { title, required: true, type: 'text' },
    { helptext: 'Vyplňte ulicu a číslo' },
  ),
  input('mesto', { type: 'text', title: 'Mesto', required: true }, { selfColumn: '3/4' }),
  input('psc', { type: 'ba-slovak-zip', title: 'PSČ', required: true }, { selfColumn: '1/4' }),
]

const ziadatelStavebnikFields = [
  radioGroup(
    'ziadatelTyp',
    {
      type: 'string',
      title: 'Žiadate ako',
      required: true,
      items: [
        { value: 'fyzickaOsoba', label: 'Fyzická osoba', isDefault: true },
        { value: 'fyzickaOsobaPodnikatel', label: 'Fyzická osoba – podnikateľ' },
        { value: 'pravnickaOsoba', label: 'Právnická osoba' },
      ],
    },
    { variant: 'boxed' },
  ),
  conditionalFields(createCondition([[['ziadatelTyp'], { const: 'fyzickaOsoba' }]]), [
    input('meno', { title: 'Meno', required: true, type: 'text' }, { selfColumn: '2/4' }),
    input(
      'priezvisko',
      { title: 'Priezvisko', required: true, type: 'text' },
      { selfColumn: '2/4' },
    ),
    ...addressFields('Korešpondenčná adresa'),
  ]),
  conditionalFields(
    createCondition([[['ziadatelTyp'], { enum: ['fyzickaOsobaPodnikatel', 'pravnickaOsoba'] }]]),
    [input('obchodneMeno', { type: 'text', title: 'Obchodné meno', required: true }, {})],
  ),
  conditionalFields(
    createCondition([[['ziadatelTyp'], { const: 'fyzickaOsobaPodnikatel' }]]),
    addressFields('Miesto podnikania'),
  ),
  conditionalFields(createCondition([[['ziadatelTyp'], { const: 'pravnickaOsoba' }]]), [
    input('ico', { type: 'text', title: 'IČO', required: true }, {}),
    ...addressFields('Adresa sídla'),
    input('kontaktnaOsoba', { type: 'text', title: 'Kontaktná osoba', required: true }, {}),
  ]),
  input('email', { title: 'Email', required: true, type: 'email' }, {}),
  input(
    'telefon',
    { type: 'ba-phone-number', title: 'Telefónne číslo', required: true },
    { size: 'medium', helptext: 'Vyplňte vo formáte +421' },
  ),
]

export default schema(
  {
    title: 'Žiadosť o stanovisko k investičnému zámeru',
  },
  [
    step('ziadatel', { title: 'Žiadateľ' }, ziadatelStavebnikFields),
    step('stavebnik', { title: 'Stavebník' }, [
      radioGroup(
        'stavebnikZiadatelom',
        {
          type: 'boolean',
          title: 'Je stavebník rovnaká osoba ako žiadateľ?',
          required: true,
          items: [
            { value: true, label: 'Áno', isDefault: true },
            { value: false, label: 'Nie' },
          ],
        },
        {
          variant: 'boxed',
          orientations: 'row',
        },
      ),
      conditionalFields(createCondition([[['stavebnikZiadatelom'], { const: false }]]), [
        fileUpload(
          'splnomocnenie',
          {
            title: 'Splnomocnenie na zastupovanie',
            required: true,
          },
          {
            type: 'button',
            helptext: 'nahrajte splnomocnenie od stavebníka',
          },
        ),
        ...ziadatelStavebnikFields,
      ]),
    ]),
    step('zodpovednyProjektant', { title: 'Zodpovedný projektant' }, [
      input('meno', { title: 'Meno', required: true, type: 'text' }, { selfColumn: '2/4' }),
      input(
        'priezvisko',
        { title: 'Priezvisko', required: true, type: 'text' },
        { selfColumn: '2/4' },
      ),
      input('email', { title: 'Email', required: true, type: 'email' }, {}),
      input(
        'telefon',
        { type: 'ba-phone-number', title: 'Telefónne číslo', required: true },
        { size: 'medium', helptext: 'Vyplňte vo formáte +421' },
      ),
      input(
        'autorizacneOsvedcenie',
        { type: 'text', title: 'Číslo autorizačného osvedčenia', required: true },
        {
          helptext:
            'Autorizačné osvedčenie dokazuje, že projektant je oprávnený na výkon vybraných činností vo výstavbe v zmysle stavebného zákona.',
          size: 'medium',
        },
      ),
      datePicker(
        'datumSpracovania',
        { title: 'Dátum spracovania projektovej dokumentácie', required: true },
        { size: 'medium' },
      ),
    ]),
    step('stavba', { title: 'Informácie o stavbe' }, [
      input('nazov', { type: 'text', title: 'Názov stavby/projektu', required: true }, {}),
      input('ulica', { type: 'text', title: 'Ulica', required: true }, {}),
      input('supisneCislo', { type: 'text', title: 'Súpisné číslo' }, {}),
      input(
        'parcelneCisla',
        { type: 'text', title: 'Parcelné čísla', required: true },
        { helptext: 'Jedno alebo viacero parcelných čísel' },
      ),
      selectMultiple(
        'katastralneUzemia',
        {
          title: 'Katastrálne územie',
          required: true,
          items: esbsKatastralneUzemiaCiselnik.map(({ Name, Code }) => ({
            value: Code,
            label: Name,
          })),
        },
        {
          helptext:
            'Vyberte jedno alebo viacero katastrálnych území, v ktorých sa pozemok nachádza.',
        },
      ),
      object('clenenieStavby', { required: true }, { title: 'Členenie stavby' }, [
        input(
          'hlavnaStavba',
          { type: 'text', title: 'Hlavná stavba', required: true },
          {
            helptext: 'Napríklad: Stavba 01 - Názov hlavnej stavby.',
          },
        ),
        input('clenenieHlavnejStavby', { type: 'text', title: 'Členenie hlavnej stavby' }, {}),
        input(
          'hlavnaStavbaPodlaUcelu',
          { type: 'text', title: 'Hlavná stavba podľa účelu', required: true },
          {
            helptext:
              'Kód hlavnej stavby podľa vyhlášky Úradu pre územné plánovanie a výstavbu Slovenskej republiky o členení stavieb. Napríklad: 1120 - VIACBYTOVÉ BUDOVY.',
          },
        ),
        textArea(
          'ostatneStavby',
          { title: 'Ostatné stavby' },
          {
            helptext:
              'Čísla a názvy všetkých ostatných stavieb (ak sa jedná o súbor stavieb) vo formáte stavba 02 - Názov stavby - stavebné objekty',
          },
        ),
      ]),
    ]),
    step('prilohy', { title: 'Prílohy' }, [
      fileUploadMultiple(
        'architektonickaStudia',
        {
          title: 'Architektonická štúdia',
          required: true,
        },
        {
          type: 'dragAndDrop',
          helptext: 'Jednotlivé časti štúdie môžete nahrať samostatne alebo ako jeden súbor.',
          belowComponents: [
            {
              type: 'additionalLinks',
              props: {
                links: [
                  {
                    href: 'https://bratislava.sk/zivotne-prostredie-a-vystavba/rozvoj-mesta/usmernovanie-vystavby/stanovisko-k-investicnemu-zameru',
                    title: 'Čo všetko má obsahovať architektonická štúdia',
                  },
                ],
              },
            },
          ],
        },
      ),
    ]),
  ],
)

type ExtractGinisSubjectFormData = {
  stavba: {
    ulica: string
    nazov: string
    parcelneCisla: string
    katastralneUzemia: (typeof esbsKatastralneUzemiaCiselnik)[number]['Code'][]
  }
}

export const stanoviskoKInvesticnemuZameruExtractGinisSubject: SchemalessFormDataExtractor<ExtractGinisSubjectFormData> =
  {
    type: 'schemaless',
    extractFn: (formData) => {
      const katastralneUzemiaNames = formData.stavba.katastralneUzemia.map(
        (item) => esbsKatastralneUzemiaCiselnik.find(({ Code }) => Code === item)!.Name,
      )

      return `e-SIZ ${formData.stavba.ulica} ${formData.stavba.nazov}, p.č. ${formData.stavba.parcelneCisla} kú ${katastralneUzemiaNames.join(', ')}`
    },
  }

type ExtractSubjectFormData = {
  stavba: {
    nazov: string
  }
}

const extractSubjectSchema = {
  type: 'object',
  required: ['stavba'],
  properties: {
    stavba: {
      type: 'object',
      required: ['nazov'],
      properties: {
        nazov: { type: 'string' },
      },
    },
  },
} as BAJSONSchema7

export const stanoviskoKInvesticnemuZameruExtractSubject: SchemaFormDataExtractor<ExtractSubjectFormData> =
  {
    type: 'schema',
    schema: extractSubjectSchema,
    extractFn: (formData) => formData.stavba.nazov,
  }

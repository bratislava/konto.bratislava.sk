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
  {
    titlePath: 'stavba.nazov',
    titleFallback: 'Názov stavby/projektu',
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
      radioGroup(
        'druhStavby',
        {
          type: 'string',
          title: 'Druh stavby',
          items: [
            { value: 'bytovyDom', label: 'Bytový dom' },
            { value: 'rodinnyDom', label: 'Rodinný dom' },
            { value: 'inaBudovaNaByvanie', label: 'Iná budova na bývanie' },
            { value: 'nebytovaBudova', label: 'Nebytová budova' },
            { value: 'inzinierskaStavba', label: 'Inžinierska stavba' },
            { value: 'ine', label: 'Iné' },
          ],
          required: true,
        },
        { variant: 'boxed' },
      ),
      input('ulica', { type: 'text', title: 'Ulica', required: true }, { size: 'medium' }),
      input('supisneCislo', { type: 'text', title: 'Súpisné číslo' }, { size: 'medium' }),
      input(
        'parcelneCislo',
        { type: 'text', title: 'Parcelné číslo', required: true },
        { size: 'medium' },
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

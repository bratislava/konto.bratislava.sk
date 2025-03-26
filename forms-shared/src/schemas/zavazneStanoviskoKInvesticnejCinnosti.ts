import { createCondition, createStringItems } from '../generator/helpers'
import { sharedAddressField, sharedPhoneNumberField } from './shared/fields'
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

const ziadatelStavebnikInvestorFields = [
  radioGroup(
    'typ',
    {
      type: 'string',
      title: 'Žiadate ako',
      required: true,
      items: [
        { value: 'fyzickaOsoba', label: 'Fyzická osoba' },
        { value: 'fyzickaOsobaPodnikatel', label: 'Fyzická osoba – podnikateľ' },
        { value: 'pravnickaOsoba', label: 'Právnická osoba' },
      ],
    },
    { variant: 'boxed' },
  ),
  conditionalFields(
    createCondition([[['typ'], { const: 'fyzickaOsoba' }]]),
    [
      input('menoPriezvisko', { type: 'text', title: 'Meno a priezvisko', required: true }, {}),
      sharedAddressField('adresa', 'Korešpondenčná adresa', true),
    ],
    [input('obchodneMeno', { type: 'text', title: 'Obchodné meno', required: true }, {})],
  ),
  conditionalFields(createCondition([[['typ'], { const: 'fyzickaOsobaPodnikatel' }]]), [
    sharedAddressField('miestoPodnikania', 'Miesto podnikania', true),
  ]),
  conditionalFields(createCondition([[['typ'], { const: 'pravnickaOsoba' }]]), [
    input('ico', { type: 'text', title: 'IČO', required: true }, {}),
    sharedAddressField('adresaSidla', 'Adresa sídla', true),
  ]),
  conditionalFields(createCondition([[['typ'], { const: 'pravnickaOsoba' }]]), [
    input('kontaktnaOsoba', { type: 'text', title: 'Kontaktná osoba', required: true }, {}),
  ]),
  input('email', { title: 'E-mail', required: true, type: 'email' }, {}),
  sharedPhoneNumberField('telefon', true),
]

export default schema(
  {
    title: 'Žiadosť o záväzné stanovisko k investičnej činnosti',
  },
  {
    titlePath: 'stavba.nazov',
    titleFallback: 'Názov stavby/projektu',
  },
  [
    step('ziadatel', { title: 'Žiadateľ' }, ziadatelStavebnikInvestorFields),
    step('investor', { title: 'Investor' }, [
      radioGroup(
        'investorZiadatelom',
        {
          type: 'boolean',
          title: 'Je investor rovnaká osoba ako žiadateľ?',
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
      conditionalFields(createCondition([[['investorZiadatelom'], { const: false }]]), [
        fileUpload(
          'splnomocnenie',
          {
            title: 'Splnomocnenie na zastupovanie',
            required: true,
          },
          {
            type: 'button',
            helptext: 'nahrajte splnomocnenie od investora',
          },
        ),
        ...ziadatelStavebnikInvestorFields,
      ]),
    ]),
    step('zodpovednyProjektant', { title: 'Zodpovedný projektant' }, [
      input('menoPriezvisko', { type: 'text', title: 'Meno a priezvisko', required: true }, {}),
      input('email', { title: 'E-mail', required: true, type: 'email' }, {}),
      sharedPhoneNumberField('projektantTelefon', true),
      input(
        'autorizacneOsvedcenie',
        { type: 'text', title: 'Číslo autorizačného osvedčenia', required: true },
        {
          helptext:
            'Autorizačné osvedčenie dokazuje, že projektant je oprávnený na výkon svojej činnosti. Nie je potrebné pri vypracovaní dokumentácie k jednoduchým / drobným stavbám, kde postačuje osoba s odborným vzdelaním.',
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
            { value: 'bytowyDom', label: 'Bytový dom' },
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
        'kataster',
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
          size: 'medium',
        },
      ),
    ]),
    step('konanieTyp', { title: 'Typ konania na stavebnom úrade' }, [
      radioGroup(
        'typ',
        {
          type: 'string',
          title: 'Typ konania',
          items: [
            { value: 'uzemneKonanie', label: 'Územné konanie' },
            {
              value: 'uzemneKonanieSoStavebnymKonanim',
              label: 'Územné konanie spojené so stavebným konaním',
            },
            { value: 'zmenaStavbyPredDokoncenim', label: 'Zmena stavby pred dokončením' },
            { value: 'zmenaVUzivaniStavby', label: 'Zmena v užívaní stavby' },
            {
              value: 'konanieODodatocnomPovoleniStavby',
              label: 'Konanie o dodatočnom povolení stavby',
            },
          ],
          required: true,
        },
        { variant: 'boxed' },
      ),
      conditionalFields(
        createCondition([[['typ'], { const: 'konanieODodatocnomPovoleniStavby' }]]),
        [
          radioGroup(
            'ziadostOdovodnenie',
            {
              type: 'string',
              title: 'Upresnenie konania',
              items: [
                {
                  value: 'realizaciaBezPovolenia',
                  label: 'Realizácia stavby, resp. jej úprav bez akéhokoľvek povolenia',
                },
                {
                  value: 'dodatocnePovolenie',
                  label: 'Dodatočné povolenie zmeny stavby pred dokončením',
                },
              ],
              required: true,
            },
            { variant: 'boxed' },
          ),
        ],
      ),
      conditionalFields(
        createCondition([[['ziadostOdovodnenie'], { const: 'dodatocnePovolenie' }]]),
        [
          fileUploadMultiple(
            'stavbaPisomnosti',
            {
              title: 'Relevantné písomnosti súvisiace so stavbou',
              required: true,
            },
            {
              type: 'button',
              helptext: 'napr. vydané stavebné povolenie, stanoviská hlavného mesta',
            },
          ),
          fileUploadMultiple(
            'stavbaFotodokumentacia',
            { title: 'Fotodokumentácia stavby', required: true },
            {
              type: 'button',
            },
          ),
        ],
      ),
    ]),
    step('prilohy', { title: 'Prílohy' }, [
      fileUploadMultiple(
        'projektovaDokumentacia',
        {
          title: 'Projektová dokumentácia',
          required: true,
        },
        {
          type: 'dragAndDrop',
          helptext: 'Jednotlivé časti dokumentácie môžete nahrať samostatne alebo ako jeden súbor.',
          belowComponents: [
            {
              type: 'additionalLinks',
              props: {
                links: [
                  {
                    href: 'https://bratislava.sk/zivotne-prostredie-a-vystavba/rozvoj-mesta/usmernovanie-vystavby/zavazne-stanovisko-k-investicnej-cinnosti',
                    title: 'Čo všetko má obsahovať projektová dokumentácia',
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

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
import { textArea } from '../generator/functions/textArea'
import { object } from '../generator/object'
import { number } from '../generator/functions/number'

const addressFields = (title: string) => [
  input(
    'ulicaACislo',
    { title, required: true, type: 'text' },
    { helptext: 'Vyplňte ulicu a číslo' },
  ),
  input('mesto', { type: 'text', title: 'Mesto', required: true }, { selfColumn: '3/4' }),
  input('psc', { type: 'ba-slovak-zip', title: 'PSČ', required: true }, { selfColumn: '1/4' }),
]

const ziadatelStavebnikInvestorFields = [
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
    [
      input('obchodneMeno', { type: 'text', title: 'Obchodné meno', required: true }, {}),
      input('ico', { type: 'text', title: 'IČO', required: true }, {}),
    ],
  ),
  conditionalFields(
    createCondition([[['ziadatelTyp'], { const: 'fyzickaOsobaPodnikatel' }]]),
    addressFields('Miesto podnikania'),
  ),
  conditionalFields(createCondition([[['ziadatelTyp'], { const: 'pravnickaOsoba' }]]), [
    ...addressFields('Adresa sídla'),
    input('opravnenaOsoba', { type: 'text', title: 'Oprávnená osoba', required: true }, {}),
    input('typOpravnenia', { type: 'text', title: 'Typ oprávnenia', required: true }, {}),
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
      input(
        'idStavby',
        { type: 'text', title: 'ID stavby' },
        {
          helptext: 'ID stavby/súboru stavieb, ak bolo pridelené informačným systémom.',
        },
      ),
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
        radioGroup(
          'obsahujeByty',
          {
            type: 'boolean',
            title: 'Nachádzajú sa v navrhovanej stavbe byty?',
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
        conditionalFields(createCondition([[['obsahujeByty'], { const: true }]]), [
          number(
            'pocetBytovCelkovo',
            {
              type: 'integer',
              title: 'Počet bytov celkovo',
              required: true,
              minimum: 1,
            },
            {},
          ),
          number(
            'pocet1IzbovychBytov',
            {
              type: 'integer',
              title: 'Počet 1-izbových bytov',
              required: true,
              minimum: 0,
            },
            {
              helptext:
                'Ak sa v navrhovanej stavbe nenachádzajú byty daného typu, uveďte v kolónke „0“.',
            },
          ),
          number(
            'pocet2IzbovychBytov',
            {
              type: 'integer',
              title: 'Počet 2-izbových bytov',
              required: true,
              minimum: 0,
            },
            {
              helptext:
                'Ak sa v navrhovanej stavbe nenachádzajú byty daného typu, uveďte v kolónke „0“.',
            },
          ),
          number(
            'pocet3IzbovychBytov',
            {
              type: 'integer',
              title: 'Počet 3-izbových bytov',
              required: true,
              minimum: 0,
            },
            {
              helptext:
                'Ak sa v navrhovanej stavbe nenachádzajú byty daného typu, uveďte v kolónke „0“.',
            },
          ),
          number(
            'pocet4IzbovychBytov',
            {
              type: 'integer',
              title: 'Počet 4-izbových bytov',
              required: true,
              minimum: 0,
            },
            {
              helptext:
                'Ak sa v navrhovanej stavbe nenachádzajú byty daného typu, uveďte v kolónke „0“.',
            },
          ),
          number(
            'pocetViacAko4IzbovychBytov',
            {
              type: 'integer',
              title: 'Počet viac ako 4-izbových bytov',
              required: true,
              minimum: 0,
            },
            {
              helptext:
                'Ak sa v navrhovanej stavbe nenachádzajú byty daného typu, uveďte v kolónke „0“.',
            },
          ),
        ]),
      ]),
    ]),
    step('typZiadosti', { title: 'Typ žiadosti' }, [
      radioGroup(
        'typ',
        {
          type: 'string',
          title: 'Typ žiadosti',
          items: [
            {
              value: 'stavebnyZamerNavrhovanaStavba',
              label: 'o záväzné stanovisko k stavebnému zámeru - navrhovaná stavba',
            },
            {
              value: 'stavebnyZamerZmenyExistujucejStavby',
              label: 'o záväzné stanovisko k stavebnému zámeru - zmeny existujúcej stavby',
            },
            {
              value: 'stavebnyZamerOdstranenieStavby',
              label: 'o záväzné stanovisko k stavebnému zámeru - odstránenia stavby',
            },
            {
              value: 'zmenaVUzivaniStavby',
              label: 'o záväzné stanovisko o zmene v užívaní stavby',
            },
            {
              value: 'preskumanieSposobilostiStavbyNaUzivanie',
              label: 'o záväzné stanovisko o preskúmaní spôsobilosti stavby na užívanie',
            },
            {
              value: 'dodatocnePovolenieStavby',
              label: 'o záväzné stanovisko ku konaniu o dodatočnom povolení stavby',
            },
            {
              value: 'ohlasenieStavbyAUprav',
              label: 'o záväzné stanovisko k ohláseniu stavby a k ohláseniu stavebných úprav',
            },
            {
              value: 'dolozkaSuladuKProjektuStavby',
              label: 'o doložku súladu k projektu stavby',
            },
          ],
          required: true,
        },
        { variant: 'boxed' },
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

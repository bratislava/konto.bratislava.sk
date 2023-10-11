import {
  checkboxes,
  conditionalFields,
  conditionalStep,
  datePicker,
  inputField,
  numberField,
  object,
  radioButton,
  schema,
  selectField,
  step,
  timePicker,
  upload,
} from '../generator/functions'
import { createCamelCaseOptionsV2, createCondition } from '../generator/helpers'

const danovnikBase = [
  object(
    'ulicaCislo',
    { required: true },
    {
      objectDisplay: 'columns',
      objectColumnRatio: '3/1',
    },
    [
      inputField('ulica', { title: 'Ulica', required: true }, { size: 'large' }),
      inputField('cislo', { title: 'Čislo', required: true }, { size: 'large' }),
    ],
  ),
  object(
    'obecPsc',
    { required: true },
    {
      objectDisplay: 'columns',
      objectColumnRatio: '3/1',
    },
    [
      inputField('obec', { title: 'Obec', required: true }, { size: 'large' }),
      inputField('psc', { title: 'PSČ', required: true, format: 'zip' }, { size: 'large' }),
    ],
  ),
  // TODO Select ciselnik
  inputField('stat', { title: 'Štát', required: true }, { size: 'large' }),
  inputField(
    'email',
    { title: 'E-mail', type: 'email' },
    { size: 'large', helptext: 'E-mailová adresa nám pomôže komunikovať s vami rýchlejšie.' },
  ),
  inputField(
    'telefon',
    { title: 'Telefónne číslo (v tvare +421...)', type: 'tel' },
    { helptext: 'Telefónne číslo nám pomôže komunikovať s vami rýchlejšie.', size: 'default' },
  ),
]

const fyzickaOsoba = (splnomocnenie: boolean) => [
  ...(splnomocnenie
    ? []
    : [
        inputField(
          'rodneCislo',
          { title: 'Rodné číslo', required: true },
          {
            size: 'large',
            helptext:
              'Rodné číslo zadávajte s lomítkom. V prípade, že nemáte rodné číslo, uveďte dátum narodenia.',
          },
        ),
      ]),
  inputField(
    'priezvisko',
    { title: 'Priezvisko', required: true },
    {
      size: 'large',
    },
  ),
  object(
    'menoTitul',
    { required: true },
    {
      objectDisplay: 'columns',
      objectColumnRatio: '3/1',
    },
    [
      inputField('meno', { title: 'Meno', required: true }, { size: 'large' }),
      inputField('titul', { title: 'Titul', required: true }, { size: 'large' }),
    ],
  ),
  ...danovnikBase,
]

const fyzickaOsobaPodnikatel = [
  inputField(
    'ico',
    { title: 'IČO', required: true },
    {
      size: 'large',
    },
  ),
  inputField(
    'obchodneMenoAleboNazov',
    { title: 'Obchodné meno alebo názov', required: true },
    {
      size: 'large',
    },
  ),
  ...danovnikBase,
]

const pravnickaOsoba = (splnomocnenie: boolean) => [
  ...(splnomocnenie
    ? []
    : [
        inputField(
          'ico',
          { title: 'IČO', required: true },
          {
            size: 'large',
          },
        ),
        selectField(
          'pravnaForma',
          {
            title: 'Právna forma',
            required: true,
            options: [
              { value: 'male', title: 'Male', tooltip: 'Male' },
              { value: 'female', title: 'Female', tooltip: 'Female' },
            ],
          },
          { dropdownDivider: true },
        ),
      ]),
  inputField(
    'obchodneMenoAleboNazov',
    { title: 'Obchodné meno alebo názov', required: true },
    {
      size: 'large',
    },
  ),
  ...danovnikBase,
]

export default schema(
  {
    title: 'Priznanie k dani z nehnuteľností',
    pospID: '',
    pospVersion: '0.1',
  },
  {},
  [
    step('druhPriznania', { title: 'Druh priznania' }, [
      radioButton(
        'druh',
        {
          type: 'string',
          title: 'Vyberte druh priznania',
          required: true,
          // TODO description instead of tooltip
          options: createCamelCaseOptionsV2([
            {
              title: 'Priznanie',
              tooltip: 'Označte, ak ste sa stali v Bratislave vlastníkom prvej nehnuteľnosti',
            },
            {
              title: 'Čiastkové priznanie',
              tooltip: 'Označte, ak ste v Bratislave už daňovníkom za inú nehnuteľnosť',
            },
            {
              title: 'Čiastkové priznanie na zánik daňovej povinnosti',
              tooltip:
                'Označte, ak ste predali/darovali nehnuteľnosť v Bratislave (zaniklo vlastníctvo)',
            },
            {
              title: 'Opravné priznanie',
              tooltip:
                'Označte v prípade, ak opravujete údaje v už podanom priznaní v lehote do 31. januára.',
            },
            {
              title: 'Dodatočné priznanie',
              tooltip:
                'Označte, ak ste si v minulosti zabudli/neuviedli správne údaje v priznaní k dani z nehnuteľností najneskôr do štyroch rokov od konca roka, v ktorom vznikla povinnosť podať priznanie k dani z nehnuteľností.',
            },
          ]),
        },
        { variant: 'boxed', orientations: 'column' },
      ),
      numberField(
        'rok',
        {
          type: 'integer',
          title: 'Za aký rok podávate priznanie?',
          required: true,
          minimum: 2000,
          maximum: 2099,
        },
        // TODO make dynamic
        {
          placeholder: String(new Date().getFullYear() + 1),
          helptext: `Kúpili ste alebo predali nehnuteľnosť v roku ${new Date().getFullYear()}? Zadajte rok ${
            new Date().getFullYear() + 1
          }`,
          size: 'large',
        },
      ),
    ]),
    step('udajeODanovnikovi', { title: 'Údaje o daňovníkovi' }, [
      radioButton(
        'voSvojomMene',
        {
          type: 'boolean',
          title: 'Podávate priznanie k dani z nehnuteľností vo svojom mene?',
          required: true,
          options: [
            { value: true, title: 'Áno', isDefault: true },
            { value: false, title: 'Nie', tooltip: 'TODO' },
          ],
        },
        { variant: 'boxed', orientations: 'row' },
      ),
      conditionalFields(createCondition([[['voSvojomMene'], { const: false }]]), [
        object('opravnenaOsoba', { required: true }, { objectDisplay: 'boxed' }, [
          upload(
            'splnomocnenie',
            { title: 'Nahrajte splnomocnenie ', required: true },
            {
              type: 'dragAndDrop',
              helptext:
                'Keďže ste v predošlom kroku zvolili, že priznanie nepodávate vo svojom mene, je nutné nahratie skanu plnej moci. Následne, po odoslaní formulára je potrebné doručiť originál plnej moci v listinnej podobe na oddelenie miestnych daní, poplatkov a licencií. Splnomocnenie sa neprikladá v prípade zákonného zástupcu neplnoletej osoby. ',
            },
          ),
          radioButton(
            'splnomocnenecTyp',
            {
              type: 'string',
              title: 'Podávate ako oprávnená osoba (splnomocnenec)',
              required: true,
              options: createCamelCaseOptionsV2([
                { title: 'Fyzická osoba', tooltip: 'Občan SR alebo cudzinec' },
                {
                  title: 'Právnicka osoba',
                  tooltip:
                    'Organizácia osôb alebo majetku vytvorená na nejaký účel (napr. podnikanie)',
                },
              ]),
            },
            { variant: 'boxed' },
          ),
          conditionalFields(createCondition([[['splnomocnenecTyp'], { const: 'fyzickaOsoba' }]]), [
            object('fyzickaOsoba', { required: true }, {}, fyzickaOsoba(true)),
          ]),
          conditionalFields(
            createCondition([[['splnomocnenecTyp'], { const: 'pravnickaOsoba' }]]),
            [object('pravnickaOsoba', { required: true }, {}, pravnickaOsoba(true))],
          ),
        ]),
      ]),
      radioButton(
        'priznanieAko',
        {
          type: 'string',
          title: 'Podávate priznanie ako',
          required: true,
          options: createCamelCaseOptionsV2([
            { title: 'Fyzická osoba', tooltip: 'Občan SR alebo cudzinec' },
            { title: 'Fyzická osoba podnikateľ', tooltip: 'SZČO alebo “živnostník”' },
            {
              title: 'Právnicka osoba',
              tooltip: 'Organizácia osôb alebo majetku vytvorená na nejaký účel (napr. podnikanie)',
            },
          ]),
        },
        { variant: 'boxed' },
      ),
      conditionalFields(createCondition([[['priznanieAko'], { const: 'fyzickaOsoba' }]]), [
        object('fyzickaOsoba', { required: true }, {}, fyzickaOsoba(false)),
      ]),
      conditionalFields(
        createCondition([[['priznanieAko'], { const: 'fyzickaOsobaPodnikatel' }]]),
        [object('fyzickaOsobaPodnikatel', { required: true }, {}, fyzickaOsobaPodnikatel)],
      ),
      conditionalFields(createCondition([[['priznanieAko'], { const: 'pravnickaOsoba' }]]), [
        object('pravnickaOsoba', { required: true }, {}, pravnickaOsoba(false)),
      ]),
    ]),
    step('dateAndTimeStep', { title: 'Date and Time Step' }, [
      datePicker('birthDate', { title: 'Birth Date', required: true }, {}),
      timePicker('meetingTime', { title: 'Meeting Time' }, {}),
    ]),
    step('uploadStep', { title: 'Upload Step' }, [
      upload('profilePicture', { title: 'Profile Picture', required: true }, { type: 'button' }),
      upload(
        'documents',
        { title: 'Documents', required: true, multiple: true },
        { type: 'dragAndDrop' },
      ),
      upload(
        'multipleDocuments',
        { title: 'Multiple Documents', required: true, multiple: true },
        { type: 'button' },
      ),
    ]),
    step('checkboxesStep', { title: 'Checkboxes Step' }, [
      checkboxes(
        'preferences',
        {
          title: 'Preferences',
          required: true,
          options: [
            {
              value: 'newsletters',
              title: 'Receive Newsletters',
              tooltip: 'Newsletters',
              isDefault: true,
            },
            { value: 'updates', title: 'Receive Updates', tooltip: 'Updates' },
            { value: 'offers', title: 'Receive Offers', tooltip: 'Offers' },
          ],
        },
        { variant: 'boxed' },
      ),
      checkboxes(
        'preferencesBasic',
        {
          title: 'Preferences Basic',
          options: [
            {
              value: 'newsletters',
              title: 'Receive Newsletters',
              tooltip: 'Newsletters',
              isDefault: true,
            },
            { value: 'updates', title: 'Receive Updates', tooltip: 'Updates' },
            { value: 'offers', title: 'Receive Offers', tooltip: 'Offers' },
          ],
        },
        { variant: 'basic' },
      ),
    ]),
    step('radioButtonStep', { title: 'Radio Button Step' }, [
      radioButton(
        'subscription',
        {
          type: 'string',
          title: 'Subscription',
          required: true,
          options: [
            { value: 'free', title: 'Free', tooltip: 'Free', isDefault: true },
            { value: 'premium', title: 'Premium', tooltip: 'Premium' },
          ],
        },
        { variant: 'boxed', orientations: 'column' },
      ),
      radioButton(
        'subscriptionType',
        {
          type: 'string',
          title: 'Subscription Type',
          options: [
            { value: 'monthly', title: 'Monthly', tooltip: 'Monthly' },
            { value: 'yearly', title: 'Yearly', tooltip: 'Yearly' },
          ],
        },
        { variant: 'basic', orientations: 'row' },
      ),
      radioButton(
        'xxx',
        {
          type: 'boolean',
          title: 'Subscription Type',
          options: [
            { value: true, title: 'Monthly', tooltip: 'Monthly' },
            { value: false, title: 'Yearly', tooltip: 'Yearly' },
          ],
        },
        { variant: 'basic', orientations: 'row' },
      ),
    ]),
    conditionalStep(
      'conditionalStep',
      createCondition([[['firstName'], { const: 'John' }]]),
      { title: 'Conditional Step' },
      [inputField('secretQuestion', { title: 'Secret Question' }, { size: 'large' })],
    ),
  ],
)

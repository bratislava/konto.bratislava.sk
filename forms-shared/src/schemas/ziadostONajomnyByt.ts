import {
  arrayField,
  checkboxGroup,
  conditionalFields,
  customComponentsField,
  datePicker,
  FieldType,
  input,
  markdownText,
  number,
  object,
  radioGroup,
  schema,
  select,
  selectMultiple,
  step,
  textArea,
} from '../generator/functions'
import { createCondition, createStringOptions } from '../generator/helpers'

enum StepType {
  Ziadatel,
  ManzelManzelka,
  DruhDruzka,
  Dieta,
  InyClen,
}

const getOsobneUdajeFields = (stepType: StepType) => {
  const menoPriezviskoField = object(
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
  )
  const rodnePriezviskoField =
    stepType !== StepType.Dieta
      ? input(
          'rodnePriezvisko',
          { title: 'Rodné priezvisko', type: 'text' },
          {
            helptextHeader:
              stepType === StepType.Ziadatel
                ? 'Vyplňte iba v prípade, ak je vaše priezvisko iné, ako to, čo ste uviedli v predchádzajúcej odpovedi.'
                : 'Vyplňte iba v prípade, ak je priezvisko iné, ako to, čo ste uviedli v predchádzajúcej odpovedi.',
          },
        )
      : null

  const datumNarodeniaField = datePicker(
    'datumNarodenia',
    { title: 'Dátum narodenia', required: true },
    {
      size: 'medium',
      belowComponents: [
        {
          type: 'alert',
          props: {
            type: 'info',
            message: {
              [StepType.Ziadatel]:
                'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte váš občiansky preukaz.',
              [StepType.ManzelManzelka]:
                'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte kópiu občianskeho preukazu manžela/manželky.',
              [StepType.DruhDruzka]:
                'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte kópiu občianskeho preukazu druha/družky.',
              [StepType.Dieta]:
                'V prípade, že by vám bolo pridelené nájomné bývanie, k podpisu zmluvy si na nahliadnutie pripravte kópiu rodného listu dieťaťa, resp. kópiu občianskeho preukazu, ak už dieťa dovŕšilo vek 15 rokov.',
              [StepType.InyClen]:
                'V prípade, že by vám bolo pridelené nájomné bývanie, k podpisu zmluvy si na nahliadnutie pripravte kópiu občianskeho preukazu člena/členky domácnosti.',
            }[stepType],
          },
        },
      ],
    },
  )
  const statnaPrislusnostField = radioGroup(
    'statnaPrislusnost',
    {
      type: 'string',
      title: 'Štátna príslušnosť',
      required: true,
      options: createStringOptions(['Slovenská', 'Iná']),
    },
    { variant: 'boxed', orientations: 'row' },
  )

  const rodinnyStavField = select(
    'rodinnyStav',
    {
      title: 'Rodinný stav',
      required: true,
      options: createStringOptions(
        ['Slobodný/slobodná', 'Ženatý/vydatá', 'Rozvedený/rozvedená', 'Vdovec/vdova', 'Iné'],
        false,
      ),
    },
    {
      belowComponents: [
        {
          type: 'alert',
          props: {
            type: 'info',
            message: {
              [StepType.Ziadatel]:
                'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte rozsudok o rozvode, sobášny list, prípadne iný doklad dokazujúci váš rodinný stav.',
              [StepType.ManzelManzelka]:
                'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte rozsudok o rozvode, sobášny list, prípadne iný doklad dokazujúci rodinný stav manžela/manželky.',
              [StepType.DruhDruzka]:
                'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte rozsudok o rozvode, sobášny list, prípadne iný doklad dokazujúci rodinný stav druha/družky.',
              [StepType.Dieta]:
                'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte doklad dokazujúci rodinný stav dieťaťa.',
              [StepType.InyClen]:
                'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte doklad dokazujúci rodinný stav člena/členky domácnosti.',
            }[stepType],
          },
        },
      ],
    },
  )

  const emailField =
    stepType === StepType.Ziadatel
      ? input('email', { title: 'Email', required: true, type: 'email' }, {})
      : null

  const telefonneCisloField =
    stepType === StepType.Ziadatel
      ? input(
          'telefonneCislo',
          { title: 'Telefónne číslo', required: true, type: 'tel' },
          {
            size: 'medium',
            placeholder: '+421',
            belowComponents: [
              {
                type: 'alert',
                props: {
                  type: 'info',
                  message:
                    'V prípade, že nemáte email alebo telefonický kontakt, uveďte kontaktné údaje na inú osobu resp. organizáciu, cez ktorú sa s vami vieme spojiť.',
                },
              },
            ],
          },
        )
      : null

  return [
    menoPriezviskoField,
    rodnePriezviskoField,
    datumNarodeniaField,
    statnaPrislusnostField,
    rodinnyStavField,
    emailField,
    telefonneCisloField,
  ]
}

const adresaSharedFields = [
  input('ulicaACislo', { title: 'Ulica a číslo', required: true, type: 'text' }, {}),
  object(
    'mestoPsc',
    { required: true },
    {
      columns: true,
      columnsRatio: '3/1',
    },
    [
      input('mesto', { title: 'Mesto', required: true }, {}),
      input('psc', { title: 'PSČ', required: true, format: 'ba-slovak-zip' }, {}),
    ],
  ),
]

const getAdresaTrvalehoPobytuFields = (stepType: StepType) => {
  const adresaFields = [
    ...adresaSharedFields,
    customComponentsField(
      {
        type: 'alert',
        props: {
          type: 'info',
          message: {
            [StepType.Ziadatel]:
              'V prípade, že máte v občianskom preukaze uvedenú mestskú časť, uveďte adresu príslušného mestského úradu.',
            [StepType.ManzelManzelka]:
              'V prípade, že má váš manžel/manželka v občianskom preukaze uvedenú mestskú časť, uveďte adresu príslušného mestského úradu.',
            [StepType.DruhDruzka]:
              'V prípade, že má váš druh/družka v občianskom preukaze uvedenú mestskú časť, uveďte adresu príslušného mestského úradu.',
            [StepType.Dieta]:
              'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte doklad dokazujúci trvalý pobyt dieťaťa.',
            [StepType.InyClen]:
              'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte doklad dokazujúci trvalý pobyt člena/členky domácnosti.',
          }[stepType],
        },
      },
      {},
    ),
  ]

  const adresaWrappedFields =
    stepType === StepType.Ziadatel
      ? adresaFields
      : [
          radioGroup(
            'adresaTrvalehoPobytuRovnaka',
            {
              type: 'boolean',
              title: {
                [StepType.ManzelManzelka]:
                  'Je adresa trvalého pobytu manžela/manželky rovnaká ako adresa vášho trvalého pobytu?',
                [StepType.DruhDruzka]:
                  'Je adresa trvalého pobytu druha/družky rovnaká ako adresa vášho trvalého pobytu?',
                [StepType.Dieta]: 'Je adresa trvalého pobytu dieťaťa rovnaká ako vaša?',
                [StepType.InyClen]:
                  'Je adresa trvalého pobytu člena/členky domácnosti rovnaká ako vaša?',
              }[stepType],
              required: true,
              options: [
                {
                  value: true,
                  title: 'Áno',
                  isDefault: true,
                },
                {
                  value: false,
                  title: 'Nie',
                },
              ],
            },
            { variant: 'boxed', orientations: 'row' },
          ),
          conditionalFields(
            createCondition([[['adresaTrvalehoPobytuRovnaka'], { const: false }]]),
            adresaFields,
          ),
        ]

  const vlastnikNehnutelnostiFields =
    stepType === StepType.Ziadatel ||
    stepType === StepType.ManzelManzelka ||
    stepType === StepType.DruhDruzka
      ? [
          radioGroup(
            'vlastnikNehnutelnosti',
            {
              type: 'boolean',
              title: {
                [StepType.Ziadatel]:
                  'Ste vlastníkom/vlastníčkou alebo spoluvlastníkom/spoluvlastníčkou nehnuteľnosti určenej na bývanie?',
                [StepType.ManzelManzelka]:
                  'Je váš manžel/manželka vlastníkom/vlastníčkou alebo spoluvlastníkom/spoluvlastníčkou nehnuteľnosti určenej na bývanie?',
                [StepType.DruhDruzka]:
                  'Je váš druh/družka vlastníkom/vlastníčkou alebo spoluvlastníkom/spoluvlastníčkou nehnuteľnosti určenej na bývanie?',
              }[stepType],
              required: true,
              options: [
                { value: true, title: 'Áno' },
                { value: false, title: 'Nie', isDefault: true },
              ],
            },
            {
              variant: 'boxed',
              orientations: 'row',
            },
          ),
          conditionalFields(createCondition([[['vlastnikNehnutelnosti'], { const: true }]]), [
            customComponentsField(
              {
                type: 'alert',
                props: {
                  type: 'info',
                  message: {
                    [StepType.Ziadatel]:
                      'Ak ste vlastníkom/vlastníčkou nehnuteľnosti, ale nemôžete v nej bývať, napr. kvôli stavebným a hygienickým nedostatkom alebo právnym prekážkam brániacim riadnemu užívaniu nehnuteľnosti, uveďte túto skutočnosť v časti formulára Iné okolnosti a k nahliadnutiu si pripravte List vlastníctva.',
                    [StepType.ManzelManzelka]:
                      'Ak je vlastníkom/vlastníčkou nehnuteľnosti, ale nemôže v nej bývať, napr. kvôli stavebným a hygienickým nedostatkom alebo právnym prekážkam brániacim riadnemu užívaniu nehnuteľnosti, uveďte túto skutočnosť v časti formulára Iné okolnosti a k nahliadnutiu si pripravte List vlastníctva.',
                    [StepType.DruhDruzka]:
                      'Ak je vlastníkom/vlastníčkou nehnuteľnosti, ale nemôžete v nej bývať, napr. kvôli stavebným a hygienickým nedostatkom alebo právnym prekážkam brániacim riadnemu užívaniu nehnuteľnosti, uveďte túto skutočnosť v časti formulára Iné okolnosti a \n' +
                      'k nahliadnutiu si pripravte List vlastníctva.',
                  }[stepType],
                },
              },
              {},
            ),
          ]),
        ]
      : []

  const pobytMenejAkoRokField =
    stepType === StepType.Ziadatel
      ? radioGroup(
          'pobytMenejAkoRok',
          {
            type: 'boolean',
            title:
              'Žijete na území Bratislavy menej ako 1 rok? (vrátane trvalého a skutočného pobytu)',
            required: true,
            options: [
              { value: true, title: 'Áno' },
              { value: false, title: 'Nie', isDefault: true },
            ],
          },
          {
            variant: 'boxed',
            orientations: 'row',
          },
        )
      : null

  const adresaSkutcnehoPobytuRovnakaFields = [
    radioGroup(
      'adresaSkutcnehoPobytuRovnaka',
      {
        type: 'boolean',
        title: 'Je adresa skutočného pobytu rovnaká ako adresa trvalého pobytu?',
        required: true,
        options: [
          { value: true, title: 'Áno', isDefault: true },
          { value: false, title: 'Nie' },
        ],
      },
      { variant: 'boxed', orientations: 'row' },
    ),
    conditionalFields(createCondition([[['adresaSkutcnehoPobytuRovnaka'], { const: false }]]), [
      object(
        'adresaSkutocnehoPobytu',
        { required: true },
        {
          title: 'Adresa skutočného pobytu',
        },
        adresaSharedFields,
      ),
    ]),
  ]

  const pobytVBratislaveAlertField =
    stepType === StepType.Ziadatel
      ? customComponentsField(
          {
            type: 'alert',
            props: {
              type: 'info',
              message:
                'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte dokumenty potvrdzujúce vaše pôsobenie v Bratislave resp. skutočný pobyt. Napríklad pracovnú zmluvu, nájomnú zmluvu, potvrdenie o návšteve školy, potvrdenie z ubytovne, nocľahárne, potvrdenie sociálneho pracovníka o kontakte s klientom.',
            },
          },
          {},
        )
      : null

  return object(
    'adresaTrvalehoPobytu',
    { required: true },
    { objectDisplay: 'boxed', title: 'Adresa trvalého pobytu' },
    [
      ...adresaWrappedFields,
      ...vlastnikNehnutelnostiFields,
      pobytMenejAkoRokField,
      ...adresaSkutcnehoPobytuRovnakaFields,
      pobytVBratislaveAlertField,
    ],
  )
}

const getPrijemFields = (stepType: StepType) => {
  const wrapper = (fields: (FieldType | null)[]) =>
    object(
      'prijem',
      { required: true },
      {
        objectDisplay: 'boxed',
        title: 'Príjem',
      },
      fields,
    )

  if (stepType === StepType.Dieta) {
    return wrapper([
      radioGroup(
        'student',
        {
          type: 'boolean',
          title: 'Je dieťa študent základnej, strednej alebo vysokej školy na dennom štúdiu?',
          required: true,
          options: [
            { value: true, title: 'Áno', isDefault: true },
            { value: false, title: 'Nie' },
          ],
        },
        {
          variant: 'boxed',
          orientations: 'row',
        },
      ),
      conditionalFields(createCondition([[['student'], { const: true }]]), [
        customComponentsField(
          {
            type: 'alert',
            props: {
              type: 'info',
              message:
                'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte potvrdenie o návšteve školy.',
            },
          },
          {},
        ),
      ]),
      radioGroup(
        'prijem',
        {
          type: 'boolean',
          title:
            'Má dieťa staršie ako 15 rokov príjem, ktorý by sa mohol zarátavať do celkového príjmu domácnosti?',
          required: true,
          options: [
            { value: true, title: 'Áno' },
            { value: false, title: 'Nie', isDefault: true },
          ],
        },
        {
          variant: 'boxed',
          orientations: 'row',
        },
      ),
      conditionalFields(createCondition([[['prijem'], { const: true }]]), [
        number(
          'prijemVyska',
          { title: 'Čistý mesačný príjem dieťaťa', required: true, minimum: 0 },
          { size: 'medium' },
        ),
      ]),
    ])
  }

  const prijemAlertField =
    // TODO why
    stepType !== StepType.InyClen
      ? customComponentsField(
          {
            type: 'alert',
            props: {
              type: 'info',
              message: {
                [StepType.Ziadatel]:
                  'Ak máte nepravidelný príjem, uveďte prosím Váš priemerný čistý mesačný príjem za celý minulý rok a za súčasný rok. Priemerný mesačný príjem počítajte ako podiel príjmu za kalendárny rok a príslušného počtu mesiacov, počas ktorých sa príjem poberali.',
                [StepType.ManzelManzelka]:
                  'Ak má váš manžel/manželka nepravidelný príjem, uveďte priemerný čistý mesačný príjem za posledných 12 mesiacov.',
                [StepType.DruhDruzka]:
                  'Ak má váš druh/družka nepravidelný príjem, uveďte priemerný čistý mesačný príjem za posledných 12 mesiacov.',
              }[stepType],
            },
          },
          {},
        )
      : null

  const all = [
    radioGroup(
      'zamestnanie',
      {
        type: 'boolean',
        title: {
          [StepType.Ziadatel]: 'Ste zamestnaný/á?',
          [StepType.ManzelManzelka]: 'Je váš manžel/manželka zamestnaný/á?',
          [StepType.DruhDruzka]: 'Je váš druh/družka zamestnaný/á?',
          [StepType.InyClen]: 'Je člen/členka domácnosti zamestnaný/á?',
        }[stepType],
        required: true,
        options: [
          { value: true, title: 'Áno' },
          { value: false, title: 'Nie', isDefault: true },
        ],
      },
      {
        variant: 'boxed',
        orientations: 'row',
        helptextHeader: {
          [StepType.Ziadatel]:
            'Pri príjme zo zamestnania ide o čistú mzdu, t. j. príjem očistený od dane z príjmu a odvodov na zdravotné a sociálne poistenie, príp. dôchodkového sporenia. Váš zamestnávateľ vám na základe žiadosti vystaví potvrdenie o výške príjmu. Je potrebné uviesť váš priemerný mesačný čistý príjem.',
          [StepType.ManzelManzelka]:
            'Pri príjme zo zamestnania ide o čistú mzdu, t. j. príjem očistený od dane z príjmu a odvodov na zdravotné a sociálne poistenie, príp. dôchodkového sporenia. Zamestnávateľ vášmu manželovi/manželke na základe žiadosti vystaví potvrdenie o výške príjmu. Je potrebné uviesť priemerný mesačný čistý príjem.',
          [StepType.DruhDruzka]:
            'Pri príjme zo zamestnania ide o čistú mzdu, t. j. príjem očistený od dane z príjmu a odvodov na zdravotné a sociálne poistenie, príp. dôchodkového sporenia. Zamestnávateľ vášmu druhovi/družke na základe žiadosti vystaví potvrdenie o výške príjmu. Je potrebné uviesť priemerný mesačný čistý príjem.',
          [StepType.InyClen]:
            'Pri príjme zo zamestnania ide o čistú mzdu, t. j. príjem očistený od dane z príjmu a odvodov na zdravotné a sociálne poistenie, príp. dôchodkového sporenia. Zamestnávateľ člena/členky domácnosti na základe žiadosti vystaví potvrdenie o výške príjmu. Je potrebné uviesť priemerný mesačný čistý príjem.',
        }[stepType],
      },
    ),
    conditionalFields(createCondition([[['zamestnanie'], { const: true }]]), [
      number(
        'zamestnaniePrijem',
        { title: 'Čistý mesačný príjem zo zamestnania', required: true, minimum: 0 },
        { size: 'medium' },
      ),
    ]),
    radioGroup(
      'samostatnaZarobkovaCinnost',
      {
        type: 'boolean',
        title:
          stepType === StepType.Ziadatel
            ? 'Máte príjem zo samostatnej zárobkovej činnosti?'
            : 'Má príjem zo samostatnej zárobkovej činnosti?',
        required: true,
        options: [
          { value: true, title: 'Áno' },
          { value: false, title: 'Nie', isDefault: true },
        ],
      },
      {
        variant: 'boxed',
        orientations: 'row',
        helptextHeader: {
          [StepType.Ziadatel]:
            'V prípade príjmu z podnikania, resp. zo samostatnej zárobkovej činnosti (vrátane živnosti) je potrebné uviesť čistý príjem SZČO po odpočítaní výdavkov, odvodov poistného na sociálne poistenie a zdravotné poistenie a zaplatenej dane z príjmu. V tomto prípade prosím uveďte sumu Vášho čistého príjmu podľa potvrdenia, ktoré vám vydá daňový úrad. Ak v čase podávania tejto žiadosti ešte nemáte podané daňové priznanie, resp. nepoznáte sumu vášho príjmu, vyplňte prosím váš čistý príjem za posledný známy rok.',
          [StepType.ManzelManzelka]:
            'V prípade príjmu z podnikania, resp. zo samostatnej zárobkovej činnosti (vrátane živnosti) je potrebné uviesť čistý príjem SZČO po odpočítaní výdavkov, odvodov poistného na sociálne poistenie a zdravotné poistenie a zaplatenej dane z príjmu. V tomto prípade prosím uveďte sumu čistého príjmu manžela/manželky podľa potvrdenia, ktoré mu/jej vydá daňový úrad. Ak v čase podávania tejto žiadosti ešte nemá podané daňové priznanie, resp. nepozná sumu jeho/jej príjmu, vyplňte prosím čistý príjem za posledný známy rok.',
          [StepType.DruhDruzka]:
            'V prípade príjmu z podnikania, resp. zo samostatnej zárobkovej činnosti (vrátane živnosti) je potrebné uviesť čistý príjem SZČO po odpočítaní výdavkov, odvodov poistného na sociálne poistenie a zdravotné poistenie a zaplatenej dane z príjmu. V tomto prípade prosím uveďte sumu čistého príjmu druha/družky podľa potvrdenia, ktoré mu/jej vydá daňový úrad. Ak v čase podávania tejto žiadosti ešte nemá podané daňové priznanie, resp. nepozná sumu jeho/jej príjmu, vyplňte prosím čistý príjem za posledný známy rok.',
          [StepType.InyClen]:
            'V prípade príjmu z podnikania, resp. zo samostatnej zárobkovej činnosti (vrátane živnosti) je potrebné uviesť čistý príjem SZČO po odpočítaní výdavkov, odvodov poistného na sociálne poistenie a zdravotné poistenie a zaplatenej dane z príjmu. V tomto prípade prosím uveďte sumu čistého príjmu člena/členky domácnosti podľa potvrdenia, ktoré mu/jej vydá daňový úrad. Ak v čase podávania tejto žiadosti ešte nemá podané daňové priznanie, resp. nepozná sumu jeho/jej príjmu, vyplňte prosím čistý príjem za posledný známy rok.',
        }[stepType],
      },
    ),
    conditionalFields(createCondition([[['samostatnaZarobkovaCinnost'], { const: true }]]), [
      number(
        'samostatnaZarobkovaCinnostPrijem',
        { title: 'Mesačný príjem z podnikania', required: true, minimum: 0 },
        { size: 'medium' },
      ),
    ]),
    radioGroup(
      'dochodok',
      {
        type: 'boolean',
        title: stepType === StepType.Ziadatel ? 'Poberáte dôchodok?' : 'Poberá dôchodok?',
        required: true,
        options: [
          { value: true, title: 'Áno' },
          { value: false, title: 'Nie', isDefault: true },
        ],
      },
      {
        variant: 'boxed',
        orientations: 'row',
        helptextHeader:
          stepType === StepType.Ziadatel
            ? 'Označte áno, ak poberáte niektorý z dôchodkov, resp. dôchodkových dávok v rámci systému sociálneho zabezpečenia, napr. invalidný dôchodok, starobný / predčasný starobný dôchodok, vdovský / vdovecký dôchodok, sirotský dôchodok, výsluhový dôchodok.'
            : 'Označte áno, ak poberá niektorý z dôchodkov, resp. dôchodkových dávok v rámci systému sociálneho zabezpečenia, napr. invalidný dôchodok, starobný / predčasný starobný dôchodok, vdovský / vdovecký dôchodok, sirotský dôchodok, výsluhový dôchodok.',
      },
    ),
    conditionalFields(createCondition([[['dochodok'], { const: true }]]), [
      number(
        'dochodokVyska',
        { title: 'Výška mesačného dôchodku', required: true, minimum: 0 },
        { size: 'medium' },
      ),
    ]),
    radioGroup(
      'vyzivne',
      {
        type: 'boolean',
        title:
          stepType === StepType.Ziadatel
            ? 'Poberáte výživné alebo náhradné výživné na dieťa/deti?'
            : 'Poberá výživné alebo náhradné výživné na dieťa/deti?',
        required: true,
        options: [
          { value: true, title: 'Áno' },
          { value: false, title: 'Nie', isDefault: true },
        ],
      },
      { variant: 'boxed', orientations: 'row' },
    ),
    conditionalFields(createCondition([[['vyzivne'], { const: true }]]), [
      number(
        'vyzivneVyska',
        { title: 'Celková výška výživného na deti', required: true, minimum: 0 },
        { size: 'medium' },
      ),
    ]),
    radioGroup(
      'davkaVNezamestnanosti',
      {
        type: 'boolean',
        title:
          stepType === StepType.Ziadatel
            ? 'Poberáte dávku v nezamestnanosti?'
            : 'Poberá dávku v nezamestnanosti?',
        required: true,
        options: [
          { value: true, title: 'Áno' },
          { value: false, title: 'Nie', isDefault: true },
        ],
      },
      { variant: 'boxed', orientations: 'row' },
    ),
    conditionalFields(createCondition([[['davkaVNezamestnanosti'], { const: true }]]), [
      number(
        'davkaVNezamestnanostiVyska',
        { title: 'Výška príspevku z úradu práce', required: true, minimum: 0 },
        { size: 'medium' },
      ),
    ]),
    radioGroup(
      'inePrijmy',
      {
        type: 'boolean',
        title: stepType === StepType.Ziadatel ? 'Poberáte iné príjmy?' : 'Poberá iné príjmy?',
        required: true,
        options: [
          { value: true, title: 'Áno' },
          { value: false, title: 'Nie', isDefault: true },
        ],
      },
      {
        variant: 'boxed',
        orientations: 'row',
        helptextHeader:
          'Materskú, tehotenský príspevok, rodičovský príspevok, prídavky na deti, dávka v hmotnej núdzi, ochranný príspevok, opatrovateľský príspevok, kompenzačný príspevok alebo iné príspevky z Úradu práce.',
      },
    ),
    conditionalFields(createCondition([[['inePrijmy'], { const: true }]]), [
      number(
        'inePrijmyVyska',
        { title: 'Iné pravidelné príjmy', required: true, minimum: 0 },
        { size: 'medium' },
      ),
    ]),
    customComponentsField(
      {
        type: 'alert',
        props: {
          type: 'info',
          message: {
            [StepType.Ziadatel]:
              'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte  dokumenty dokazujúce všetky spomínané príjmy. (napríklad doklad od zamestnávateľa, potvrdenie z daňového úradu, potvrdenie o výške dôchodku, doklad o poberaní prídavkov na dieťa/deti, o poberaní materského, rodičovský príspevok, doklad o určení výšky výživného a pod.)',
            [StepType.ManzelManzelka]:
              'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte  dokumenty dokazujúce všetky spomínané príjmy manžela/manželky. (napríklad doklad od zamestnávateľa, potvrdenie z daňového úradu, potvrdenie o výške dôchodku, doklad o poberaní prídavkov na dieťa/deti, o poberaní materského, rodičovský príspevok, doklad o určení výšky výživného a pod.)',
            [StepType.DruhDruzka]:
              'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte  dokumenty dokazujúce všetky spomínané príjmy druha/družky. (napríklad doklad od zamestnávateľa, potvrdenie z daňového úradu, potvrdenie o výške dôchodku, doklad o poberaní prídavkov na dieťa/deti, o poberaní materského, rodičovský príspevok, doklad o určení výšky výživného a pod.)',
            [StepType.InyClen]:
              'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte  dokumenty dokazujúce všetky spomínané príjmy člena/členky domácnosti. (napríklad doklad od zamestnávateľa, potvrdenie z daňového úradu, potvrdenie o výške dôchodku, doklad o poberaní prídavkov na dieťa/deti, o poberaní materského, rodičovský príspevok, doklad o určení výšky výživného a pod.)',
          }[stepType],
        },
      },
      {},
    ),
  ]

  return wrapper([prijemAlertField, ...all])
}

const getZdravotnyStavFields = (stepType: StepType) => {
  const wrapper = (fields: FieldType[]) =>
    object(
      'zdravotnyStav',
      { required: true },
      { objectDisplay: 'boxed', title: 'Zdravotný stav' },
      fields,
    )

  const textHelper = ({
    ziadatel,
    dieta,
    other,
  }: {
    ziadatel: string
    dieta?: string
    other: string
  }) => {
    if (stepType === StepType.Ziadatel) {
      return ziadatel
    }
    if (stepType === StepType.Dieta && dieta) {
      return dieta
    }
    return other
  }

  const all = [
    object('funkcnaPoruchaWrapper', { required: true }, { objectDisplay: 'boxed' }, [
      radioGroup(
        'funkcnaPorucha',
        {
          type: 'boolean',
          title: textHelper({
            ziadatel: 'Máte určenú mieru funkčnej poruchy posudkovým lekárom?',
            dieta: 'Má dieťa funkčnú poruchu, stupeň odkázanosti alebo mu bola uznaná invalidita?',
            other: 'Má určenú mieru funkčnej poruchy posudkovým lekárom?',
          }),
          required: true,
          options: [
            { value: true, title: 'Áno' },
            { value: false, title: 'Nie', isDefault: true },
          ],
        },
        {
          variant: 'boxed',
          orientations: 'row',
          helptextHeader: markdownText(
            'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte dokumenty dokazujúce uvedený zdravotný stav (napríklad potvrdenie o chronickom ochorení od ošetrujúceho lekára).',
          ),
          labelSize: 'h4',
        },
      ),
      conditionalFields(createCondition([[['funkcnaPorucha'], { const: true }]]), [
        number(
          'mieraFunkcnejPoruchy',
          { title: 'Uveďte mieru od 10 do 100', required: true, minimum: 10, maximum: 100 },
          {},
        ),
        input(
          'diagnozy',
          {
            title: textHelper({
              ziadatel: 'Uveďte diagnózy, ktoré sa vás týkajú',
              dieta: 'Má dieťa niektorú z týchto diagnóz?',
              other: 'Uveďte diagnózy, ktoré sa jeho/jej týkajú',
            }),
            required: true,
            type: 'text',
          },
          {},
        ),
        selectMultiple(
          'existujuceDiagnozy',
          {
            title: textHelper({
              ziadatel: 'Máte niektorú z týchto diagnóz?',
              dieta: 'Má dieťa niektorú z týchto diagnóz?',
              other: 'Má niektorú z týchto diagnóz?',
            }),
            required: true,
            options: createStringOptions(['todo']),
          },
          {},
        ),
      ]),
    ]),
    object('odkazanostWrapper', { required: true }, { objectDisplay: 'boxed' }, [
      radioGroup(
        'odkazanost',
        {
          type: 'boolean',
          title: textHelper({
            ziadatel: 'Bola vám uznaná odkázanosť?',
            other: 'Bola mu/jej uznaná odkázanosť?',
          }),
          required: true,
          options: [
            { value: true, title: 'Áno' },
            { value: false, title: 'Nie', isDefault: true },
          ],
        },
        { variant: 'boxed', orientations: 'row', labelSize: 'h4' },
      ),
      conditionalFields(createCondition([[['odkazanost'], { const: true }]]), [
        input(
          'stupenOdkazanosti',
          { title: 'Uveďte stupeň odkázanosti od I. do VI.', required: true, type: 'text' },
          {},
        ),
      ]),
    ]),
    object('bezbarierovyBytWrapper', { required: true }, { objectDisplay: 'boxed' }, [
      stepType !== StepType.Dieta
        ? radioGroup(
            'bezbarierovyByt',
            {
              type: 'boolean',
              title: textHelper({
                ziadatel: 'Uchádzate sa o pridelenie bezbariérového bytu?',
                other: 'Uchádza sa o pridelenie bezbariérového bytu?',
              }),
              required: true,
              options: [
                { value: true, title: 'Áno' },
                { value: false, title: 'Nie', isDefault: true },
              ],
            },
            { variant: 'boxed', orientations: 'row', labelSize: 'h4' },
          )
        : null,
      radioGroup(
        'invalidita',
        {
          type: 'boolean',
          title: textHelper({
            ziadatel: 'Bola vám uznaná invalidita (miera poklesu schopnosti pracovať)?',
            other: 'Bola mu/jej uznaná invalidita (miera poklesu schopnosti pracovať)?',
          }),
          required: true,
          options: [
            { value: true, title: 'Áno' },
            { value: false, title: 'Nie', isDefault: true },
          ],
        },
        {
          variant: 'boxed',
          orientations: 'row',
          labelSize: stepType === StepType.Dieta ? 'h4' : undefined,
        },
      ),
      conditionalFields(createCondition([[['invalidita'], { const: true }]]), [
        number(
          'mieraPoklesu',
          {
            title: 'Uveďte mieru poklesu od 10 do 100',
            type: 'integer',
            minimum: 10,
            maximum: 100,
          },
          {},
        ),
      ]),
    ]),
    customComponentsField(
      {
        type: 'alert',
        props: {
          type: 'info',
          message: {
            [StepType.Ziadatel]:
              'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte dokumenty dokazujúce uvedený zdravotný stav (napríklad potvrdenie o chronickom ochorení od ošetrujúceho lekára).',
            [StepType.ManzelManzelka]:
              'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte dokumenty dokazujúce uvedený zdravotný stav manžela/manželky (napríklad potvrdenie o chronickom ochorení od ošetrujúceho lekára).',
            [StepType.DruhDruzka]:
              'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte dokumenty dokazujúce uvedený zdravotný stav druha/družky (napríklad potvrdenie o chronickom ochorení od ošetrujúceho lekára).',
            [StepType.Dieta]:
              'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte dokumenty dokazujúce uvedený zdravotný stav dieťaťa (napríklad potvrdenie o chronickom ochorení od ošetrujúceho lekára).',
            [StepType.InyClen]:
              'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte dokumenty dokazujúce uvedený zdravotný stav člena/členky domácnosti (napríklad potvrdenie o chronickom ochorení od ošetrujúceho lekára).',
          }[stepType],
        },
      },
      {},
    ),
  ]

  return wrapper(all)
}

const getSucasneByvanieFields = (stepType: StepType) => {
  const wrapper = (fields: (FieldType | null)[]) =>
    object(
      'sucasneByvanie',
      { required: true },
      { objectDisplay: 'boxed', title: 'Súčasné bývanie' },
      fields,
    )

  const situaciaRovnakaAkoVasaField =
    stepType !== StepType.Ziadatel
      ? radioGroup(
          'situaciaRovnakaAkoVasa',
          {
            type: 'boolean',
            title: {
              [StepType.ManzelManzelka]:
                'Je situácia súčasného bývania vášho manžela/manželky rovnaká ako vaša?',
              [StepType.DruhDruzka]:
                'Je situácia súčasného bývania vášho druha/družky rovnaká ako vaša?',
              [StepType.Dieta]: 'Je situácia súčasného bývania vášho dieťaťa rovnaká ako vaša?',
              [StepType.InyClen]:
                'Je situácia súčasného bývania člena/členky domácnosti rovnaká ako vaša?',
            }[stepType],
            required: true,
            options: [
              { value: true, title: 'Áno', isDefault: true },
              { value: false, title: 'Nie' },
            ],
          },
          { variant: 'boxed', orientations: 'row' },
        )
      : null

  if (stepType === StepType.Dieta) {
    return wrapper([
      situaciaRovnakaAkoVasaField,
      conditionalFields(createCondition([[['situaciaRovnakaAkoVasa'], { const: false }]]), [
        input(
          'sucasneByvanieDietata',
          { title: 'Aké je súčasné bývanie vášho dieťaťa?', type: 'text', required: true },
          {},
        ),
      ]),
    ])
  }

  const innerFields = [
    radioGroup(
      'bytovaNudza',
      {
        type: 'boolean',
        title:
          stepType === StepType.Ziadatel
            ? 'Nachádzate sa v bytovej núdzi?'
            : 'Nachádza sa v bytovej núdzi?',
        required: true,
        options: [
          { value: true, title: 'Áno' },
          { value: false, title: 'Nie', isDefault: true },
        ],
      },
      { variant: 'boxed', orientations: 'row' },
    ),
    conditionalFields(createCondition([[['bytovaNudza'], { const: true }]]), [
      radioGroup(
        'typSkutocnehoByvania',
        {
          type: 'string',
          title: 'Typ skutočného bývania',
          required: true,
          options: createStringOptions([
            'Bývanie na ulici',
            'Bývanie v krízovom ubytovaní za účelom prenocovania (nocľaháreň)',
            'Bývanie v zariadení určenom pre ľudí bez domova',
            'Bývanie v mestskej ubytovni (Ubytovňa Fortuna, Ubytovňa Kopčany)',
            'Bývanie v komerčnej ubytovni',
            'Ľudia v inštitucionálnej starostlivosti',
            'Bývanie v neistých a nevyhovujúcich podmienkach',
          ]),
        },
        { variant: 'boxed' },
      ),
      select(
        'dlzkaBytovejNudze',
        {
          title: {
            [StepType.Ziadatel]: 'Uveďte, ako dlho trvá vaša bytová núdza',
            [StepType.ManzelManzelka]: 'Uveďte, ako dlho trvá bytová núdza manžela/manželky',
            [StepType.DruhDruzka]: 'Uveďte, ako dlho trvá bytová núdza druha/družky',
            [StepType.InyClen]: 'Uveďte, ako dlho trvá bytová núdza člena/členky domácnosti',
          }[stepType],
          required: true,
          options: createStringOptions(
            ['Menej ako 1 rok', '1 - 2 roky', '3 - 5 rokov', '6 - 9 rokov', '10 a viac rokov'],
            false,
          ),
        },
        {},
      ),
      number(
        'nakladyNaByvanie',
        {
          title:
            stepType === StepType.Ziadatel
              ? 'Aké vysoké sú vaše celkové náklady na bývanie?'
              : 'Aké vysoké sú jeho/jej celkové náklady na bývanie?',
          required: true,
          minimum: 0,
        },
        { size: 'medium' },
      ),
      selectMultiple(
        'dovodNevyhovujucehoByvania',
        {
          title:
            stepType === StepType.Ziadatel
              ? 'Vyberte dôvody, prečo je vaše súčasné bývanie nevyhovujúce alebo ohrozené a pod.'
              : 'Vyberte dôvody, prečo je jeho/jej súčasné bývanie nevyhovujúce alebo ohrozené a pod.',
          required: true,
          options: createStringOptions(
            [
              'Výpoveď z nájmu – ukončený nájomný/podnájomný vzťah (prebieha výpovedná lehota)',
              'Strata vlastníckych práv – povinnosť vysťahovať sa v dôsledku straty vlastníctva',
              'Domáce násilie zaznamenané políciou/štátnym úradom',
              'Mobilné obydlie (maringotka, karavan, osobné auto)',
              'Neštandardné obydlie (chatka, chatrč)',
              'Provizórne/dočasné stavby (búdy, strážne domčeky)',
              'Obydlie nespôsobilé na bývanie podľa stavebno-technických alebo hygienických predpisov (Napr. bez elektriny, vody, možnosti kúrenia, napojenia na odpad, bez WC)',
              'Extrémne preľudnené obydlie',
            ],
            false,
          ),
        },
        {},
      ),
    ]),
  ]

  if (stepType === StepType.Ziadatel) {
    return wrapper(innerFields)
  }

  return wrapper([
    situaciaRovnakaAkoVasaField,
    conditionalFields(
      createCondition([[['situaciaRovnakaAkoVasa'], { const: false }]]),
      innerFields,
    ),
  ])
}

const getRizikoveFaktoryFields = (stepType: StepType) => {
  const wrapper = (fields: (FieldType | null)[]) =>
    object(
      'rizikoveFaktoryWrapper',
      { required: true },
      { title: 'Rizikové faktory', objectDisplay: 'boxed' },
      fields,
    )

  const fields = [
    radioGroup(
      'rizikoveFaktory',
      {
        type: 'boolean',
        title:
          stepType === StepType.Ziadatel
            ? 'Týkajú sa vás rizikové faktory, ktoré zvyšujú vašu sociálno-ekonomickú zraniteľnosť?'
            : 'Týkajú sa ho/jej rizikové faktory, ktoré zvyšujú sociálno-ekonomickú zraniteľnosť?',
        required: true,
        options: [
          { value: true, title: 'Áno' },
          { value: false, title: 'Nie', isDefault: true },
        ],
      },
      { variant: 'boxed', orientations: 'row' },
    ),
    conditionalFields(createCondition([[['rizikoveFaktory'], { const: true }]]), [
      checkboxGroup(
        'zoznamRizikovychFaktorov',
        {
          title: 'Označte rizikové faktory',
          options: createStringOptions(
            [
              'Osamelý rodič (dospelá osoba), ktorý/á žije v spoločnej domácnosti s nezaopatreným dieťaťom/deťmi, avšak bez manžela/manželky alebo partnera/partnerky, a zároveň tomuto dieťaťu/deťom zabezpečuje osobnú starostlivosť.',
              'Rodič na rodičovskej/materskej/otcovskej dovolenke',
              'Hrozba odobratia detí orgánom Sociálnoprávnej ochrany detí a sociálnej kurately v dôsledku akútnej bytovej núdze žiadateľa',
              'Opustenie ústavnej starostlivosti v uplynulých 3 rokoch: Centrum pre deti a rodiny a resocializačné stredisko',
              'Opustenie Ústavu na výkon väzby a Ústav na výkon trestu odňatia slobody v uplynulých 3 rokoch alebo 3 mesiace pred prepustením',
              'Opustenie špeciálneho výchovného zariadenia v uplynulých 3 rokoch alebo 3 mesiace pred prepustením: Diagnostické centrá, reedukačné centrá, liečebno-výchovné sanatóriá, resocializačné stredisko',
              'Iné',
            ],
            false,
          ),
          required: true,
        },
        {
          helptextHeader: 'Môžete označiť viac možností.',
          variant: 'boxed',
          belowComponents: [
            {
              type: 'alert',
              props: {
                type: 'info',
                message:
                  'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte dokumenty dokazujúce uvedený rizikové faktory dokazujúce zvýšenú zraniteľnosť. (Napr. rozhodnutie súdu/trestné oznámenie a pod.)',
              },
            },
          ],
        },
      ),
      stepType !== StepType.Dieta
        ? radioGroup(
            'vek',
            {
              type: 'string',
              title: 'Vek',
              options: createStringOptions(['63-70 rokov', '71-80 rokov', '81 rokov a viac']),
            },
            { variant: 'boxed' },
          )
        : null,
    ]),
  ]

  return wrapper(fields)
}

const getFieldsForStep = (stepType: StepType) => {
  return [
    ...getOsobneUdajeFields(stepType),
    getAdresaTrvalehoPobytuFields(stepType),
    getPrijemFields(stepType),
    getZdravotnyStavFields(stepType),
    getSucasneByvanieFields(stepType),
    getRizikoveFaktoryFields(stepType),
  ]
}

export default schema(
  {
    title: 'Žiadosť o nájomný byt',
  },
  {},
  [
    step(
      'ziadatelZiadatelka',
      { title: 'Žiadateľ/žiadateľka' },
      getFieldsForStep(StepType.Ziadatel),
    ),
    step('manzelManzelka', { title: 'Manžel/manželka' }, [
      radioGroup(
        'manzelManzelkaSucastouDomacnosti',
        {
          type: 'boolean',
          title: 'Bude súčasťou budúcej domácnosti aj váš manžel/manželka?',
          required: true,
          options: [
            { value: true, title: 'Áno' },
            { value: false, title: 'Nie', isDefault: true },
          ],
        },
        { variant: 'boxed', orientations: 'row' },
      ),
      conditionalFields(
        createCondition([[['manzelManzelkaSucastouDomacnosti'], { const: true }]]),
        getFieldsForStep(StepType.ManzelManzelka),
      ),
    ]),
    step('druhDruzka', { title: 'Druh/družka' }, [
      radioGroup(
        'druhDruzkaSucastouDomacnosti',
        {
          type: 'boolean',
          title: 'Bude súčasťou budúcej domácnosti aj váš druh/družka?',
          required: true,
          options: [
            { value: true, title: 'Áno' },
            { value: false, title: 'Nie', isDefault: true },
          ],
        },
        { variant: 'boxed', orientations: 'row' },
      ),
      conditionalFields(
        createCondition([[['druhDruzkaSucastouDomacnosti'], { const: true }]]),
        getFieldsForStep(StepType.DruhDruzka),
      ),
    ]),
    step(
      'deti',
      { title: 'Nezaopatrené deti do 25 rokov', stepperTitle: 'Nezaopatrené dieťa/deti' },
      [
        radioGroup(
          'detiSucastouDomacnosti',
          {
            type: 'boolean',
            title: 'Bude súčasťou budúcej domácnosti aj vaše dieťa/deti?',
            required: true,
            options: [
              { value: true, title: 'Áno' },
              { value: false, title: 'Nie', isDefault: true },
            ],
          },
          {
            variant: 'boxed',
            orientations: 'row',
            belowComponents: [
              {
                type: 'alert',
                props: {
                  type: 'info',
                  message:
                    'Nezaopatrené dieťa je dieťa, ktoré nemá ukončenú povinnú 10 ročnú školskú dochádzku alebo sústavne študuje dennou formou štúdia, najdlhšie však do dovŕšenia 25 rokov, prípadne sa nemôže sústavne pripravovať na budúce povolanie alebo vykonávať zárobkovú činnosť pre chorobu alebo úraz.',
                },
              },
            ],
          },
        ),
        conditionalFields(createCondition([[['detiSucastouDomacnosti'], { const: true }]]), [
          arrayField(
            'zoznamDeti',
            { title: 'Deti', required: true },
            {
              hideTitle: true,
              variant: 'topLevel',
              addButtonLabel: 'Pridať ďalšie dieťa',
              itemTitle: 'Dieťa č. {index}',
            },
            getFieldsForStep(StepType.Dieta),
          ),
        ]),
      ],
    ),
    step('inyClenoviaClenkyDomacnosti', { title: 'Iní členovia/členky domácnosti' }, [
      radioGroup(
        'inyClenoviaClenkySucastouDomacnosti',
        {
          type: 'boolean',
          title:
            'Budú súčasťou budúcej domácnosti aj iní členovia/členky? (zaopatrené deti, starí rodičia a pod.)',
          required: true,
          options: [
            { value: true, title: 'Áno' },
            { value: false, title: 'Nie', isDefault: true },
          ],
        },
        {
          variant: 'boxed',
          orientations: 'row',
        },
      ),
      conditionalFields(
        createCondition([[['inyClenoviaClenkySucastouDomacnosti'], { const: true }]]),
        [
          arrayField(
            'zoznamInychClenov',
            { title: 'Iní členovia/členky domácnosti', required: true },
            {
              hideTitle: true,
              variant: 'topLevel',
              addButtonLabel: 'Pridať ďalšieho člena/členku domácnosti',
              itemTitle: 'Člen/členka domácnosti č. {index}',
            },
            getFieldsForStep(StepType.InyClen),
          ),
        ],
      ),
    ]),
    step('ineOkolnosti', { title: 'Iné okolnosti' }, [
      textArea(
        'ineOkolnosti',
        { title: 'Prečo si podávate žiadosť?' },
        {
          helptextHeader:
            'Priestor pre vyjadrenie akýchkoľvek informácií, ktoré si myslíte, že by sme mali vedieť, ale neboli súčasťou otázok.',
        },
      ),
      textArea(
        'preferovanaVelkostALokalita',
        { title: 'Preferovaná veľkosť a lokalita bývania' },
        {
          helptextHeader:
            'Špecifikácia, o aký typ bytu má žiadateľ záujem - najmä z pohľadu cenovej kategórie bytu (výška nájomného), veľkosti bytu (počet izieb), lokality bytu (mestská časť).',
        },
      ),
    ]),
  ],
)

import {
  arrayField,
  checkbox,
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
import {
  createCamelCaseOptionsV2,
  createCondition,
  createStringOptions,
} from '../generator/helpers'

enum StepType {
  Ziadatel,
  ManzelManzelka,
  DruhDruzka,
  Dieta,
  InyClen,
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
      input('mesto', { type: 'text', title: 'Mesto', required: true }, {}),
      input('psc', { type: 'ba-slovak-zip', title: 'PSČ', required: true }, {}),
    ],
  ),
]

const getVlastnikNehnutelnostiFields = (stepType: StepType) => {
  return [
    radioGroup(
      'vlastnikNehnutelnosti',
      {
        type: 'boolean',
        title: {
          [StepType.Ziadatel]:
            'Ste vlastníkom/vlastníčkou alebo spoluvlastníkom/spoluvlastníčkou nehnuteľnosti určenej na bývanie?',
          [StepType.ManzelManzelka]:
            'Je váš manžel/manželka vlastníkom/vlastníčkou alebo spoluvlastníkom/spoluvlastníčkou nehnuteľnosti určenej na bývanie?',
          [StepType.Dieta]:
            'Je vaše dieťa vlastníkom/vlastníčkou alebo spoluvlastníkom/spoluvlastníčkou nehnuteľnosti určenej na bývanie?',
          [StepType.DruhDruzka]:
            'Je váš druh/družka vlastníkom/vlastníčkou alebo spoluvlastníkom/spoluvlastníčkou nehnuteľnosti určenej na bývanie?',
          [StepType.InyClen]:
            'Je člen/členka domácnosti vlastníkom/vlastníčkou alebo spoluvlastníkom/spoluvlastníčkou nehnuteľnosti určenej na bývanie?',
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
        helptextHeader:
          stepType === StepType.Ziadatel
            ? 'Ak ste vlastníkom/vlastníčkou alebo spoluvlastníkom/spoluvlastníčkou nehnuteľnosti, ale nemôžete v nej bývať, napr. kvôli stavebným, hygienickým nedostatkom alebo právnym prekážkam brániacim riadnemu užívaniu nehnuteľnosti, označte "Áno" a uveďte túto skutočnosť pod otázkou Napíšte dôvody, pre ktoré nemôžete využívať túto nehnuteľnosť na bývanie.'
            : 'Ak je vlastníkom/vlastníčkou alebo spoluvlastníkom/spoluvlastníčkou nehnuteľnosti, ale nemôžete v nej bývať, napr. kvôli stavebným, hygienickým nedostatkom alebo právnym prekážkam brániacim riadnemu užívaniu nehnuteľnosti, označte "Áno" a uveďte túto skutočnosť pod otázkou Napíšte dôvody, pre ktoré nemôžete využívať túto nehnuteľnosť na bývanie.',
      },
    ),
    conditionalFields(createCondition([[['vlastnikNehnutelnosti'], { const: true }]]), [
      input(
        'vlastnikNehnutelnostiDovody',
        {
          title: 'Napíšte dôvody, pre ktoré nemôžete využívať túto nehnuteľnosť na bývanie',
          required: true,
          type: 'text',
        },
        {
          belowComponents: [
            {
              type: 'alert',
              props: {
                type: 'info',
                message:
                  'Ak je vlastníkom/vlastníčkou alebo spoluvlastníkom/spoluvlastníčkou nehnuteľnosti, k nahliadnutiu si pripravte list vlastníctva.',
              },
            },
          ],
        },
      ),
    ]),
  ]
}

const getAdresaSkutocnehoPobytuFields = (stepType: StepType) => {
  if (stepType === StepType.Dieta || stepType === StepType.InyClen) {
    return null
  }

  return object(
    'adresaSkutocnehoPobytu',
    { required: true },
    {
      title: 'Adresa skutočného pobytu',
      description: {
        [StepType.Ziadatel]: undefined,
        [StepType.ManzelManzelka]:
          'Ak má váš manžel/manželka v občianskom preukaze uvedenú mestskú časť, uveďte adresu príslušného mestského úradu.',
        [StepType.DruhDruzka]:
          'Ak má váš druh/družka v občianskom preukaze uvedenú mestskú časť, uveďte adresu príslušného mestského úradu. ',
      }[stepType],
      objectDisplay: stepType === StepType.Ziadatel ? 'wrapper' : 'boxed',
    },
    [
      ...adresaSharedFields,
      ...(stepType === StepType.ManzelManzelka || stepType === StepType.DruhDruzka
        ? getVlastnikNehnutelnostiFields(stepType)
        : []),
    ],
  )
}

const getAdresaTrvalehoPobytuFields = (stepType: StepType) => {
  if (stepType !== StepType.Ziadatel) {
    return null
  }

  const adresaFields = [
    ...adresaSharedFields,
    customComponentsField(
      {
        type: 'alert',
        props: {
          type: 'info',
          message:
            'V prípade, že máte v občianskom preukaze uvedenú mestskú časť, uveďte adresu príslušného mestského úradu.',
        },
      },
      {},
    ),
  ]

  const byvanieVMestskomNajomnomByteField = radioGroup(
    'byvanieVMestskomNajomnomByte',
    {
      type: 'boolean',
      title: 'Bývate v mestskom nájomnom byte v Bratislave?',
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

  const pobytVBratislaveMenejAkoRokField = radioGroup(
    'pobytVBratislaveMenejAkoRok',
    {
      type: 'boolean',
      title: 'Žijete na území Bratislavy menej ako 1 rok? (vrátane trvalého a skutočného pobytu)',
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

  const pobytVBratislaveAlertField = customComponentsField(
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

  const adresaSkutocnehoPobytuRovnakaFields = [
    radioGroup(
      'adresaSkutocnehoPobytuRovnaka',
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
    conditionalFields(createCondition([[['adresaSkutocnehoPobytuRovnaka'], { const: false }]]), [
      getAdresaSkutocnehoPobytuFields(stepType),
    ]),
  ]

  return object(
    'adresaTrvalehoPobytu',
    { required: true },
    {
      objectDisplay: 'boxed',
      title: 'Adresa trvalého pobytu',
      description:
        'Ak máte v občianskom preukaze uvedenú mestskú časť, uveďte adresu daného mestského úradu.',
    },
    [
      ...adresaFields,
      ...getVlastnikNehnutelnostiFields(stepType),
      byvanieVMestskomNajomnomByteField,
      pobytVBratislaveMenejAkoRokField,
      pobytVBratislaveAlertField,
      ...adresaSkutocnehoPobytuRovnakaFields,
    ],
  )
}

const getOsobneUdajeSection = (stepType: StepType) => {
  return object(
    'osobneUdaje',
    { required: true },
    { objectDisplay: 'boxed', title: 'Osobné údaje' },
    [
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
        : null,
      datePicker(
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
      ),
      radioGroup(
        'statnaPrislusnost',
        {
          type: 'string',
          title: 'Štátna príslušnosť',
          required: true,
          options: createStringOptions(['Slovenská', 'Iná']),
        },
        { variant: 'boxed', orientations: 'row' },
      ),
      stepType !== StepType.Dieta
        ? select(
            'rodinnyStav',
            {
              title: 'Rodinný stav',
              required: true,
              options: createStringOptions(
                [
                  'Slobodný/slobodná',
                  'Ženatý/vydatá',
                  'Rozvedený/rozvedená',
                  'Vdovec/vdova',
                  'Iné',
                ],
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
                      [StepType.InyClen]:
                        'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte doklad dokazujúci rodinný stav člena/členky domácnosti.',
                    }[stepType],
                  },
                },
              ],
            },
          )
        : null,
      stepType === StepType.Ziadatel
        ? input(
            'email',
            { title: 'Email', required: true, type: 'email' },
            {
              helptextHeader:
                'Ak nemáte email, uveďte kontaktné údaje na inú osobu resp. organizáciu.',
            },
          )
        : null,
      stepType === StepType.Ziadatel
        ? input(
            'telefonneCislo',
            { type: 'ba-slovak-phone-number', title: 'Telefónne číslo', required: true },
            {
              size: 'medium',
              placeholder: '+421',
              helptextHeader:
                'Ak nemáte telefonický kontakt, uveďte kontaktné údaje na inú osobu resp. organizáciu. Vyplňte vo formáte s predvoľbou +421.',
            },
          )
        : null,
      stepType === StepType.Ziadatel
        ? getAdresaTrvalehoPobytuFields(stepType)
        : getAdresaSkutocnehoPobytuFields(stepType),
      ...(stepType === StepType.Dieta ? getVlastnikNehnutelnostiFields(stepType) : []),
    ],
  )
}

const getPrijemSection = (stepType: StepType) => {
  const wrapper = (fields: (FieldType | null)[]) =>
    object(
      'prijem',
      { required: true },
      {
        objectDisplay: 'boxed',
        title: 'Príjem',
        description: {
          [StepType.Ziadatel]:
            'Ak máte nepravidelný príjem, uveďte, prosím, váš priemerný čistý mesačný príjem za celý minulý rok a za súčasný rok. Priemerný mesačný príjem počítajte ako podiel príjmu za kalendárny rok a príslušného počtu mesiacov, počas ktorých sa príjem poberali.',
          [StepType.ManzelManzelka]:
            'Ak má váš manžel/manželka nepravidelný príjem, uveďte, prosím, priemerný čistý mesačný príjem za celý minulý rok a za súčasný rok. Priemerný mesačný príjem počítajte ako podiel príjmu za kalendárny rok a príslušného počtu mesiacov, počas ktorých sa príjem poberali.',
          [StepType.DruhDruzka]:
            'Ak má váš druh/družka nepravidelný príjem, uveďte, prosím, priemerný čistý mesačný príjem za celý minulý rok a za súčasný rok. Priemerný mesačný príjem počítajte ako podiel príjmu za kalendárny rok a príslušného počtu mesiacov, počas ktorých sa príjem poberali.',
          [StepType.Dieta]: undefined,
          [StepType.InyClen]:
            'Ak má člen/členka domácnosti nepravidelný príjem, uveďte, prosím, priemerný čistý mesačný príjem za celý minulý rok a za súčasný rok. Priemerný mesačný príjem počítajte ako podiel príjmu za kalendárny rok a príslušného počtu mesiacov, počas ktorých sa príjem poberali.',
        }[stepType],
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
            { value: true, title: 'Áno' },
            { value: false, title: 'Nie', isDefault: true },
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
        'maPrijem',
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
      conditionalFields(createCondition([[['maPrijem'], { const: true }]]), [
        number(
          'prijemVyska',
          { title: 'Čistý mesačný príjem dieťaťa', required: true, minimum: 0 },
          {
            size: 'medium',
            leftIcon: 'euro',
            belowComponents: [
              {
                type: 'alert',
                props: {
                  type: 'info',
                  message:
                    'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte potvrdenie o príjme dieťaťa.',
                },
              },
            ],
          },
        ),
      ]),
    ])
  }

  const fields = [
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
        { leftIcon: 'euro', size: 'medium' },
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
        { leftIcon: 'euro', size: 'medium' },
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
        { leftIcon: 'euro', size: 'medium' },
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
        { leftIcon: 'euro', size: 'medium' },
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
        { leftIcon: 'euro', size: 'medium' },
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
        { leftIcon: 'euro', size: 'medium' },
      ),
    ]),
    customComponentsField(
      {
        type: 'alert',
        props: {
          type: 'info',
          message: {
            [StepType.Ziadatel]:
              'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte dokumenty dokazujúce všetky spomínané príjmy. (napríklad doklad od zamestnávateľa, potvrdenie z daňového úradu, potvrdenie o výške dôchodku, doklad o poberaní prídavkov na dieťa/deti, o poberaní materského, rodičovský príspevok, doklad o určení výšky výživného a pod.)',
            [StepType.ManzelManzelka]:
              'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte dokumenty dokazujúce všetky spomínané príjmy manžela/manželky. (napríklad doklad od zamestnávateľa, potvrdenie z daňového úradu, potvrdenie o výške dôchodku, doklad o poberaní prídavkov na dieťa/deti, o poberaní materského, rodičovský príspevok, doklad o určení výšky výživného a pod.)',
            [StepType.DruhDruzka]:
              'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte dokumenty dokazujúce všetky spomínané príjmy druha/družky. (napríklad doklad od zamestnávateľa, potvrdenie z daňového úradu, potvrdenie o výške dôchodku, doklad o poberaní prídavkov na dieťa/deti, o poberaní materského, rodičovský príspevok, doklad o určení výšky výživného a pod.)',
            [StepType.InyClen]:
              'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte dokumenty dokazujúce všetky spomínané príjmy člena/členky domácnosti. (napríklad doklad od zamestnávateľa, potvrdenie z daňového úradu, potvrdenie o výške dôchodku, doklad o poberaní prídavkov na dieťa/deti, o poberaní materského, rodičovský príspevok, doklad o určení výšky výživného a pod.)',
          }[stepType],
        },
      },
      {},
    ),
  ]

  return wrapper(fields)
}

const getZdravotnyStavSection = (stepType: StepType) => {
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

  return object(
    'zdravotnyStav',
    { required: true },
    {
      objectDisplay: 'boxed',
      title: 'Zdravotný stav',
      description: {
        [StepType.Ziadatel]:
          'Diagnózy vypĺňajte až po tom, ako ich budete mať odkonzultované a následne potvrdené vašim (všeobecným) lekárom.',
        [StepType.ManzelManzelka]:
          'Diagnózy vypĺňajte až po tom, ako ich budete mať odkonzultované a následne potvrdené (všeobecným) lekárom manžela/manželky.',
        [StepType.DruhDruzka]:
          'Diagnózy vypĺňajte až po tom, ako ich budete mať odkonzultované a následne potvrdené (všeobecným) lekárom druha/družky.',
        [StepType.Dieta]:
          'Diagnózy vypĺňajte až po tom, ako ich budete mať odkonzultované a následne potvrdené (všeobecným) lekárom dieťaťa.',
        [StepType.InyClen]:
          'Diagnózy vypĺňajte až po tom, ako ich budete mať odkonzultované a následne potvrdené vašim (všeobecným) lekárom člena/členky domácnosti.',
      }[stepType],
    },
    [
      radioGroup(
        'tzpPreukaz',
        {
          type: 'boolean',
          title: textHelper({
            ziadatel: 'Ste držiteľom preukazu ŤZP?',
            other: 'Je držiteľom preukazu ŤZP?',
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
        },
      ),
      conditionalFields(createCondition([[['tzpPreukaz'], { const: true }]]), [
        select(
          'mieraFunkcnejPoruchy',
          {
            title: textHelper({
              ziadatel: 'Máte uznanú mieru funkčnej poruchy?',
              other: 'Má uznanú mieru funkčnej poruchy?',
            }),
            required: true,
            options: createStringOptions(['Od 50 % do 74 %', 'Od 75 % do 100 %'], false),
          },
          {},
        ),
      ]),
      conditionalFields(createCondition([[['tzpPreukaz'], { const: false }]]), [
        radioGroup(
          'chronickeOchorenie',
          {
            type: 'boolean',
            title: textHelper({
              ziadatel: 'Trpíte chronickým ochorením?',
              other: 'Trpí chronickým ochorením?',
            }),
            required: true,
            options: [
              { value: true, title: 'Áno' },
              { value: false, title: 'Nie', isDefault: true },
            ],
          },
          { variant: 'boxed', orientations: 'row' },
        ),
        conditionalFields(createCondition([[['chronickeOchorenie'], { const: true }]]), [
          selectMultiple(
            'existujuceDiagnozy',
            {
              title: textHelper({
                ziadatel: 'Máte niektorú z týchto diagnóz?',
                dieta: 'Má dieťa niektorú z týchto diagnóz?',
                other: 'Má niektorú z týchto diagnóz?',
              }),
              required: true,
              options: createStringOptions(
                [
                  'Alzheimerova choroba',
                  'Anorexia/Bulímia',
                  'Arteriálna hypertenzia (chronický zvýšený tlak)',
                  'Astma',
                  'Autizmus',
                  'Bipolárna porucha',
                  'Chronická obštrukčná choroba pľúc (Symptomatická)',
                  'Chronická paradentóza',
                  'Chronické gastroenterologické ochorenia (Crohnova choroba, Ulcerózna kolitída, Chronická gastritída a podobné)',
                  'Chronické muskuloskeletálne choroby (obmedzený pohyb, chýbajúca končatina)',
                  'Chronické následky cievnej mozgovej príhody',
                  'Chronické ochorenie obličiek v dôsledku nasledovných chorôb: Cukrovka, Glomerulonefritída, Hypertenzia, prípadne iných ochorení',
                  'Chronické ochorenie pečene (cirhóza, hepatitídy atď., okrem rakoviny)',
                  'Chronické rozsiahle ochorenia kože s komplikáciami (chronický ekzém, chronické formy parapsoriázy)',
                  'Chronický zápal stredného ucha (strata sluchu, vertigo)',
                  'Demencia',
                  'Diabetes mellitus 1 a 2 typu (Cukrovka) bez závažných komplikácií',
                  'Diabetes mellitus 1 a 2 typu (Cukrovka) so závažnými komplikáciami (diabetická noha, neuropatia, retinopatia)',
                  'Diagnostikovaná rakovina s nastavenou liečbou (všetky typy rakoviny)',
                  'Downov syndróm',
                  'Dystýmia + Úzkostná porucha',
                  'Encefalokéla (vady mozgu)',
                  'Epilepsia',
                  'Guillainov-Barrého syndróm',
                  'Hepatitída C',
                  'HIV/AIDS',
                  'Hluchota (bez posudku)',
                  'Iné chronické ochorenia srdca',
                  'Ischemická choroba srdca',
                  'Klinefelterov syndróm',
                  'Metastatická fáza rakoviny (všetky typy rakoviny)',
                  'Očné ochorenia (glaukoma, katarakta a podobné)',
                  'Ochorenie motorických neurónov',
                  'Osteoatróza (artróza)',
                  'Parkinsonova choroba',
                  'Rakovina vo fáze remisie (všetky typy rakoviny)',
                  'Reumatické ochorenie srdca',
                  'Reumatoidná artritída',
                  'Sarkoidóza',
                  'Schistosomóza (krvné motolice)',
                  'Schizofrénia',
                  'Slepota (bez posudku)',
                  'Silikóza, Azbestóza, Pneumokonióza',
                  'Skleróza multiplex (roztrúsená)',
                  'Spina bifida (rázštep chrbtice)',
                  'Spinóza a/alebo atrézia traviacého traktu',
                  'Struma (zväčšená štítna žľaza)',
                  'Syfilis',
                  'Tetanus',
                  'Terminálna fáza rakoviny (všetky typy rakoviny)',
                  'Tuberkulóza',
                  'Turnerov syndróm',
                  'Vrodená chýba bránice (CDH)',
                  'Vrodené chyby brušnej steny a/alebo tráviaceho traktu',
                  'Vrodené poruchy a abnormality pohybového aparátu',
                  'Vrodené srdcové chyby (CHD)',
                ],
                false,
              ),
            },
            {},
          ),
        ]),
      ]),

      stepType === StepType.Ziadatel
        ? radioGroup(
            'bezbarierovyByt',
            {
              type: 'boolean',
              title: 'Uchádzate sa o pridelenie bezbariérového bytu?',
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
                `Podmienkou pridelenia bezbariérového bytu je, že žiadateľ alebo člen domácnosti musí mať lekárom potvrdené, že má diagnostikované zdravotné postihnutie, v zmysle prílohy č. 2 [zákona 443/2010 Z. z.](https://www.slov-lex.sk/pravne-predpisy/SK/ZZ/2010/443/20180101#prilohy)`,
              ),
            },
          )
        : null,
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
    ],
  )
}

const getSucasneByvanieSection = (stepType: StepType) => {
  const wrapper = (fields: (FieldType | null)[]) =>
    object(
      'sucasneByvanie',
      { required: true },
      {
        objectDisplay: 'boxed',
        title: 'Súčasné bývanie',
        description:
          stepType === StepType.Ziadatel
            ? 'Ak označíte odpoveď  "Áno" zobrazia sa vám konkrétne možnosti bývania. Ak sa vás žiadna z nich nebude týkať, označte odpoveď "Nie".'
            : undefined,
      },
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
      {
        variant: 'boxed',
        orientations: 'row',
        helptextHeader: {
          [StepType.Ziadatel]: undefined,
          [StepType.ManzelManzelka]:
            'Ak označíte odpoveď  "Áno", zobrazia sa vám konkrétne možnosti bývania. Ak sa manžela/manželky žiadna z nich nebude týkať, označte odpoveď "Nie".',
          [StepType.DruhDruzka]:
            'Ak označíte odpoveď  "Áno", zobrazia sa vám konkrétne možnosti bývania. Ak sa druha/družky žiadna z nich nebude týkať, označte odpoveď "Nie".',
          [StepType.Dieta]:
            'Ak označíte odpoveď  "Áno", zobrazia sa vám konkrétne možnosti bývania. Ak sa nezaopatreného dieťaťa žiadna z nich nebude týkať, označte odpoveď "Nie".',
          [StepType.InyClen]:
            'Ak pri otázke Nachádza sa v bytovej núdzi označíte odpoveď  "Áno", zobrazia sa vám konkrétne možnosti bývania. Ak sa člena/členky domácnosti žiadna z nich nebude týkať, označte odpoveď "Nie".',
        }[stepType],
      },
    ),
    conditionalFields(createCondition([[['bytovaNudza'], { const: true }]]), [
      radioGroup(
        'typByvania',
        {
          type: 'string',
          title: 'Typ bývania',
          required: true,
          options: createCamelCaseOptionsV2([
            {
              title: 'Bývanie na ulici',
            },
            {
              title: 'Bývanie v krízovom ubytovaní za účelom prenocovania',
            },
            {
              title: 'Bývanie v zariadení určenom pre ľudí v núdzi',
              description: 'Útulok, azylový dom, Domov na pol ceste',
            },
            {
              title: 'Bývanie v neštandardnom obydlí',
              description: 'Mobilné obydlia, chatky, búdy, provizórne stavby',
            },
            {
              title: 'Bývanie v mestskej ubytovni',
              description: 'Ubytovňa Fortuna, Ubytovňa Kopčany',
            },
            {
              title: 'Bývanie v komerčnej ubytovni',
            },
            {
              title: 'Bývanie v inštitucionálnej starostlivosti',
              description:
                'Ústav na výkon väzby a Ústav na výkon trestu odňatia slobody – prepustenie o 3 mesiace a skôr, Centrum pre deti a rodiny, Resocializačné stredisko – prepustenie o 3 mesiace a skôr',
            },
            {
              title: 'Bývanie v neistých/nevyhovujúcich podmienkach',
              description:
                'Strata vlastníckych práv, výpoveď z nájmu, obydlie bez elektriny, vody, možnosti kúrenia, bez WC, extrémne preľudnene obydlie, nájom/podnájom bez zmluvy, bývanie u príbuzných/známych, neudržateľnosť nájomnej zmluvy (napr. náhly pokles príjmu)',
            },
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
            [StepType.Dieta]: 'Uveďte, ako dlho trvá bytová núdza dieťaťa',
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

const getRizikoveFaktorySection = (stepType: StepType) => {
  if (stepType !== StepType.Ziadatel) {
    return null
  }

  return object(
    'rizikoveFaktoryWrapper',
    { required: true },
    { title: 'Rizikové faktory', objectDisplay: 'boxed' },
    [
      radioGroup(
        'rizikoveFaktory',
        {
          type: 'boolean',
          title:
            'Týkajú sa vás alebo niektorého člena/členky vašej domácnosti rizikové faktory, ktoré zvyšujú sociálno-ekonomickú zraniteľnosť?',
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
                    'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte dokumenty dokazujúce uvedený rizikové faktory dokazujúce zvýšenú zraniteľnosť vás alebo iného člena/členky domácnosti. (Napr. rozhodnutie súdu/doklad o prepustení zo zariadenia/doklad od ÚPSVR a pod.)',
                },
              },
            ],
          },
        ),
        radioGroup(
          'vekNajstarsiehoClena',
          {
            type: 'string',
            title: 'Zvoľte vek najstaršieho člena domácnosti',
            required: true,
            options: createStringOptions(
              ['menej ako 63 rokov', '63 - 70 rokov', '71 - 80 rokov', '81 a viac rokov'],
              false,
            ),
          },
          { variant: 'boxed' },
        ),
      ]),
    ],
  )
}

const getFieldsForStep = (stepType: StepType) => {
  return [
    getOsobneUdajeSection(stepType),
    getSucasneByvanieSection(stepType),
    getPrijemSection(stepType),
    getZdravotnyStavSection(stepType),
    getRizikoveFaktorySection(stepType),
  ]
}

export default schema(
  {
    title: 'Žiadosť o nájomný byt (TESTOVACIA VERZIA)',
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
      {
        title: 'Nezaopatrené deti do 25 rokov',
        stepperTitle: 'Nezaopatrené dieťa/deti',
        description:
          'Nezaopatrené dieťa je dieťa, ktoré nemá ukončenú povinnú 10 ročnú školskú dochádzku alebo sústavne študuje dennou formou štúdia, najdlhšie však do dovŕšenia 25 rokov, prípadne sa nemôže sústavne pripravovať na budúce povolanie alebo vykonávať zárobkovú činnosť pre chorobu alebo úraz.',
      },
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
        'dovodyPodaniaZiadosti',
        { title: 'Prečo si podávate žiadosť?', required: true },
        {
          helptextHeader:
            'Priestor pre vyjadrenie akýchkoľvek informácií, ktoré si myslíte, že by sme mali vedieť, ale neboli súčasťou otázok.',
        },
      ),
      select(
        'preferovanaVelkost',
        {
          title: 'Akú veľkosť nájomného bytu preferujete?',
          required: true,
          options: createStringOptions(
            ['garsónka/1-izbový byt', '2-izbový byt', '3-izbový byt', '4-izbový byt'],
            false,
          ),
        },
        {},
      ),
      selectMultiple(
        'preferovanaLokalita',
        {
          title: 'Aká je vaša preferovaná lokalita nájomného bytu (mestská časť)?',
          required: true,
          options: createStringOptions(
            [
              'Staré Mesto',
              'Ružinov',
              'Vrakuňa',
              'Podunajské Biskupice',
              'Nové Mesto',
              'Karlova Ves',
              'Dúbravka',
              'Petržalka',
            ],
            false,
          ),
        },
        {},
      ),
      number(
        'maximalnaVyskaNajomneho',
        {
          title:
            'Prosím uveďte maximálnu výšku nájomného (bez energií), ktorú dokážete mesačne platiť',
          required: true,
          minimum: 0,
        },
        { leftIcon: 'euro', size: 'medium' },
      ),
    ]),
    step('sucetPrijmovCestneVyhlasenie', { title: 'Súčet príjmov a čestné výhlásenie' }, [
      customComponentsField(
        {
          type: 'alert',
          props: {
            type: 'info',
            message: 'Súčeť príjmov TODO',
          },
        },
        {},
      ),
      checkbox(
        'cestneVyhlasenie',
        {
          title: 'Čestné vyhlásenie',
          required: true,
          constValue: true,
        },
        {
          checkboxLabel:
            'Čestne vyhlasujem, že všetky údaje, uvedené v žiadosti a dokumentoch na nahliadnutie sú pravdivé a úplné. Zároveň som si vedomý/á toho, že poskytnutie nepravdivých a/alebo neúplných informácií môže mať za následok nezaradenie žiadosti do evidencie žiadateľov.',
          variant: 'boxed',
        },
      ),
    ]),
  ],
)

export const ziadostONajomnyBytAdditionalInfoTemplate = `### Zoznam potrebných dokumentov

#### Žiadateľ/žiadateľka

- Občiansky preukaz
<% if (it.formData.ziadatelZiadatelka?.osobneUdaje?.rodinnyStav) { %>
- Doklad o rodinnom stave (rozsudok o rozvode, sobášny list, alebo iný relevantný doklad)
<% } %>
<% if (it.formData.ziadatelZiadatelka?.osobneUdaje?.adresaTrvalehoPobytu?.pobytVBratislaveMenejAkoRok) { %>
- Doklady potvrdzujúce pôsobenie v Bratislave (pracovná zmluva, nájomná zmluva, potvrdenie o návšteve školy, potvrdenie z ubytovne, nocľahárne, potvrdenie sociálneho pracovníka o kontakte s klientom)
<% } %>
<% if (it.formData.ziadatelZiadatelka?.prijem?.zamestnanie) { %>
- Potvrdenie o príjme od zamestnávateľa
<% } %>
<% if (it.formData.ziadatelZiadatelka?.prijem?.samostatnaZarobkovaCinnost) { %>
- Daňové priznanie alebo potvrdenie o príjme z daňového úradu
<% } %>
<% if (it.formData.ziadatelZiadatelka?.prijem?.dochodok) { %>
- Potvrdenie o výške dôchodku
<% } %>
<% if (it.formData.ziadatelZiadatelka?.prijem?.vyzivne) { %>
- Doklad o určení výšky výživného
<% } %>
<% if (it.formData.ziadatelZiadatelka?.prijem?.davkaVNezamestnanosti) { %>
- Potvrdenie o poberaní dávky v nezamestnanosti
<% } %>
<% if (it.formData.ziadatelZiadatelka?.prijem?.inePrijmy) { %>
- Doklady o iných príjmoch (napr. potvrdenie o poberaní prídavkov na deti, materského, rodičovského príspevku)
<% } %>
<% if (it.formData.ziadatelZiadatelka?.zdravotnyStav?.tzpPreukaz) { %>
- Preukaz ŤZP
<% } %>
<% if (it.formData.ziadatelZiadatelka?.zdravotnyStav?.chronickeOchorenie) { %>
- Potvrdenie o chronickom ochorení od ošetrujúceho lekára
<% } %>
<% if (it.formData.ziadatelZiadatelka?.rizikoveFaktoryWrapper?.rizikoveFaktory) { %>
- Doklady potvrdzujúce rizikové faktory (napr. rozhodnutie súdu, trestné oznámenie)
<% } %>

<% if (it.formData.druhDruzka?.druhDruzkaSucastouDomacnosti) { %>
#### Druh/Družka

- Kópia občianskeho preukazu
<% if (it.formData.druhDruzka?.osobneUdaje?.rodinnyStav) { %>
- Doklad o rodinnom stave
<% } %>
<% if (it.formData.druhDruzka?.prijem?.zamestnanie) { %>
- Potvrdenie o príjme od zamestnávateľa
<% } %>
<% if (it.formData.druhDruzka?.prijem?.samostatnaZarobkovaCinnost) { %>
- Daňové priznanie alebo potvrdenie o príjme z daňového úradu
<% } %>
<% if (it.formData.druhDruzka?.prijem?.dochodok) { %>
- Potvrdenie o výške dôchodku
<% } %>
<% if (it.formData.druhDruzka?.prijem?.vyzivne) { %>
- Doklad o určení výšky výživného
<% } %>
<% if (it.formData.druhDruzka?.prijem?.davkaVNezamestnanosti) { %>
- Potvrdenie o poberaní dávky v nezamestnanosti
<% } %>
<% if (it.formData.druhDruzka?.prijem?.inePrijmy) { %>
- Doklady o iných príjmoch
<% } %>
<% if (it.formData.druhDruzka?.zdravotnyStav?.tzpPreukaz) { %>
- Preukaz ŤZP
<% } %>
<% if (it.formData.druhDruzka?.zdravotnyStav?.chronickeOchorenie) { %>
- Potvrdenie o chronickom ochorení od ošetrujúceho lekára
<% } %>
<% } %>

<% if (it.formData.deti?.detiSucastouDomacnosti) { %>
#### Deti

<% it.formData.deti.zoznamDeti.forEach(function(dieta, index) { %>
##### Dieťa <%= index + 1 %>

- Rodný list (do 15 rokov) alebo kópia občianskeho preukazu
<% if (dieta.prijem?.student) { %>
- Potvrdenie o návšteve školy
<% } %>
<% if (dieta.prijem?.maPrijem) { %>
- Doklady o príjme dieťaťa
<% } %>
<% if (dieta.zdravotnyStav?.tzpPreukaz) { %>
- Preukaz ŤZP
<% } %>
<% if (dieta.zdravotnyStav?.chronickeOchorenie) { %>
- Potvrdenie o chronickom ochorení od ošetrujúceho lekára
<% } %>
<% }) %>
<% } %>

<% if (it.formData.inyClenoviaClenkyDomacnosti?.inyClenoviaClenkySucastouDomacnosti) { %>
#### Iní členovia/členky domácnosti

<% it.formData.inyClenoviaClenkyDomacnosti.zoznamInychClenov.forEach(function(clen, index) { %>
##### Člen <%= index + 1 %>

- Kópia občianskeho preukazu
<% if (clen.osobneUdaje?.rodinnyStav) { %>
- Doklad o rodinnom stave
<% } %>
<% if (clen.prijem?.zamestnanie) { %>
- Potvrdenie o príjme od zamestnávateľa
<% } %>
<% if (clen.prijem?.samostatnaZarobkovaCinnost) { %>
- Daňové priznanie alebo potvrdenie o príjme z daňového úradu
<% } %>
<% if (clen.prijem?.dochodok) { %>
- Potvrdenie o výške dôchodku
<% } %>
<% if (clen.prijem?.vyzivne) { %>
- Doklad o určení výšky výživného
<% } %>
<% if (clen.prijem?.davkaVNezamestnanosti) { %>
- Potvrdenie o poberaní dávky v nezamestnanosti
<% } %>
<% if (clen.prijem?.inePrijmy) { %>
- Doklady o iných príjmoch
<% } %>
<% if (clen.zdravotnyStav?.tzpPreukaz) { %>
- Preukaz ŤZP
<% } %>
<% if (clen.zdravotnyStav?.chronickeOchorenie) { %>
- Potvrdenie o chronickom ochorení od ošetrujúceho lekára
<% } %>
<% }) %>
<% } %>`

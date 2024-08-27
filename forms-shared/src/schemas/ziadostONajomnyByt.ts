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
import { createCondition } from '../generator/helpers'

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
      ...getVlastnikNehnutelnostiFields(stepType),
      radioGroup(
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
      ),
      radioGroup(
        'pobytVBratislaveMenejAkoRok',
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
      ),
      conditionalFields(createCondition([[['pobytVBratislaveMenejAkoRok'], { const: true }]]), [
        customComponentsField(
          {
            type: 'alert',
            props: {
              type: 'info',
              message:
                'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte dokumenty potvrdzujúce vaše pôsobenie v Bratislave resp. skutočný pobyt. Napríklad pracovnú zmluvu, nájomnú zmluvu, potvrdenie o návšteve školy, potvrdenie z ubytovne, nocľahárne, potvrdenie sociálneho pracovníka o kontakte s klientom.',
            },
          },
          {},
        ),
      ]),
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
          options: [
            { value: 'slovenska', title: 'Slovenská', isDefault: true },
            { value: 'ina', title: 'Iná' },
          ],
        },
        { variant: 'boxed', orientations: 'row' },
      ),
      ...(stepType !== StepType.Dieta
        ? [
            select(
              'rodinnyStav',
              {
                title: 'Rodinný stav',
                required: true,
                options: [
                  { value: 'slobodny', title: 'Slobodný/slobodná' },
                  { value: 'zenaty', title: 'Ženatý/vydatá' },
                  { value: 'rozvedeny', title: 'Rozvedený/rozvedená' },
                  { value: 'vdovec', title: 'Vdovec/vdova' },
                  { value: 'ine', title: 'Iné' },
                ],
              },
              {},
            ),
            conditionalFields(
              createCondition([
                [['rodinnyStav'], { enum: ['zenaty', 'rozvedeny', 'vdovec', 'ine'] }],
              ]),
              [
                customComponentsField(
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
                  {},
                ),
              ],
            ),
          ]
        : []),
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
      ...(stepType === StepType.Dieta || stepType === StepType.InyClen
        ? getVlastnikNehnutelnostiFields(stepType)
        : []),
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
            options: [
              { value: '50az74', title: 'Od 50 % do 74 %' },
              { value: '75az100', title: 'Od 75 % do 100 %' },
            ],
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
              options: [
                { value: 'alzheimer', title: 'Alzheimerova choroba' },
                { value: 'anorexiaBulimia', title: 'Anorexia/Bulímia' },
                {
                  value: 'arterialnaHypertenzia',
                  title: 'Arteriálna hypertenzia (chronický zvýšený tlak)',
                },
                { value: 'astma', title: 'Astma' },
                { value: 'autizmus', title: 'Autizmus' },
                { value: 'bipolarnaPorucha', title: 'Bipolárna porucha' },
                {
                  value: 'chronickaObstrukcnaChorobaPluc',
                  title: 'Chronická obštrukčná choroba pľúc (Symptomatická)',
                },
                { value: 'chronickaParadentoza', title: 'Chronická paradentóza' },
                {
                  value: 'chronickeGastroenterologickeOchorenia',
                  title:
                    'Chronické gastroenterologické ochorenia (Crohnova choroba, Ulcerózna kolitída, Chronická gastritída a podobné)',
                },
                {
                  value: 'chronickeMuskuloskeletalneChoroby',
                  title:
                    'Chronické muskuloskeletálne choroby (obmedzený pohyb, chýbajúca končatina)',
                },
                {
                  value: 'chronickeNasledkyCMP',
                  title: 'Chronické následky cievnej mozgovej príhody',
                },
                {
                  value: 'chronickeOchorenieObliciek',
                  title:
                    'Chronické ochorenie obličiek v dôsledku nasledovných chorôb: Cukrovka, Glomerulonefritída, Hypertenzia, prípadne iných ochorení',
                },
                {
                  value: 'chronickeOchoreniePecene',
                  title: 'Chronické ochorenie pečene (cirhóza, hepatitídy atď., okrem rakoviny)',
                },
                {
                  value: 'chronickeOchoreniaKoze',
                  title:
                    'Chronické rozsiahle ochorenia kože s komplikáciami (chronický ekzém, chronické formy parapsoriázy)',
                },
                {
                  value: 'chronickyZapalStrednhoUcha',
                  title: 'Chronický zápal stredného ucha (strata sluchu, vertigo)',
                },
                { value: 'demencia', title: 'Demencia' },
                {
                  value: 'diabetesBezKomplikacii',
                  title: 'Diabetes mellitus 1 a 2 typu (Cukrovka) bez závažných komplikácií',
                },
                {
                  value: 'diabetesSKomplikaciami',
                  title:
                    'Diabetes mellitus 1 a 2 typu (Cukrovka) so závažnými komplikáciami (diabetická noha, neuropatia, retinopatia)',
                },
                {
                  value: 'rakovinaSLiecbou',
                  title: 'Diagnostikovaná rakovina s nastavenou liečbou (všetky typy rakoviny)',
                },
                { value: 'downovSyndrom', title: 'Downov syndróm' },
                { value: 'dystymiaUzkost', title: 'Dystýmia + Úzkostná porucha' },
                { value: 'encefalokela', title: 'Encefalokéla (vady mozgu)' },
                { value: 'epilepsia', title: 'Epilepsia' },
                { value: 'guillainBarrehoSyndrom', title: 'Guillainov-Barrého syndróm' },
                { value: 'hepatitidaC', title: 'Hepatitída C' },
                { value: 'hivAids', title: 'HIV/AIDS' },
                { value: 'hluchota', title: 'Hluchota (bez posudku)' },
                { value: 'ineChronickeOchoreniaSrdca', title: 'Iné chronické ochorenia srdca' },
                { value: 'ischemickaChorobaSrdca', title: 'Ischemická choroba srdca' },
                { value: 'klinefelterovSyndrom', title: 'Klinefelterov syndróm' },
                {
                  value: 'metastatickaRakovina',
                  title: 'Metastatická fáza rakoviny (všetky typy rakoviny)',
                },
                { value: 'ocneOchorenia', title: 'Očné ochorenia (glaukoma, katarakta a podobné)' },
                { value: 'ochorenieMotorickychNeuronov', title: 'Ochorenie motorických neurónov' },
                { value: 'osteoatroza', title: 'Osteoatróza (artróza)' },
                { value: 'parkinson', title: 'Parkinsonova choroba' },
                {
                  value: 'rakovinaVRemisii',
                  title: 'Rakovina vo fáze remisie (všetky typy rakoviny)',
                },
                { value: 'reumatickeOchorenieSrdca', title: 'Reumatické ochorenie srdca' },
                { value: 'reumatoidnaArtritida', title: 'Reumatoidná artritída' },
                { value: 'sarkoidoza', title: 'Sarkoidóza' },
                { value: 'schistosomoza', title: 'Schistosomóza (krvné motolice)' },
                { value: 'schizofrenia', title: 'Schizofrénia' },
                { value: 'slepota', title: 'Slepota (bez posudku)' },
                {
                  value: 'silikozaAzbestozaPneumokonioza',
                  title: 'Silikóza, Azbestóza, Pneumokonióza',
                },
                { value: 'sklerozaMultiplex', title: 'Skleróza multiplex (roztrúsená)' },
                { value: 'spinaBifida', title: 'Spina bifida (rázštep chrbtice)' },
                { value: 'spinozaAtrezia', title: 'Spinóza a/alebo atrézia traviacého traktu' },
                { value: 'struma', title: 'Struma (zväčšená štítna žľaza)' },
                { value: 'syfilis', title: 'Syfilis' },
                { value: 'tetanus', title: 'Tetanus' },
                {
                  value: 'terminalnaFazaRakoviny',
                  title: 'Terminálna fáza rakoviny (všetky typy rakoviny)',
                },
                { value: 'tuberkuloza', title: 'Tuberkulóza' },
                { value: 'turnerovSyndrom', title: 'Turnerov syndróm' },
                { value: 'vrodenaChybaBranice', title: 'Vrodená chyba bránice (CDH)' },
                {
                  value: 'vrodeneChybyBrusnejSteny',
                  title: 'Vrodené chyby brušnej steny a/alebo tráviaceho traktu',
                },
                {
                  value: 'vrodenePoruchyPohybovehoAparatu',
                  title: 'Vrodené poruchy a abnormality pohybového aparátu',
                },
                { value: 'vrodeneSrdcoveChyby', title: 'Vrodené srdcové chyby (CHD)' },
              ],
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
          options: [
            { value: 'ulica', title: 'Bývanie na ulici' },
            {
              value: 'krizoveUbytovanie',
              title: 'Bývanie v krízovom ubytovaní za účelom prenocovania',
            },
            {
              value: 'zariadeniePreLudiVNudzi',
              title: 'Bývanie v zariadení určenom pre ľudí v núdzi',
              description: 'Útulok, azylový dom, Domov na pol ceste',
            },
            {
              value: 'nestatnardneObydlie',
              title: 'Bývanie v neštandardnom obydlí',
              description: 'Mobilné obydlia, chatky, búdy, provizórne stavby',
            },
            {
              value: 'mestskaUbytovna',
              title: 'Bývanie v mestskej ubytovni',
              description: 'Ubytovňa Fortuna, Ubytovňa Kopčany',
            },
            { value: 'komercnaUbytovna', title: 'Bývanie v komerčnej ubytovni' },
            {
              value: 'institucionalnaStarostlivost',
              title: 'Bývanie v inštitucionálnej starostlivosti',
              description:
                'Ústav na výkon väzby a Ústav na výkon trestu odňatia slobody – prepustenie o 3 mesiace a skôr, Centrum pre deti a rodiny, Resocializačné stredisko – prepustenie o 3 mesiace a skôr',
            },
            {
              value: 'neistePodmienky',
              title: 'Bývanie v neistých/nevyhovujúcich podmienkach',
              description:
                'Strata vlastníckych práv, výpoveď z nájmu, obydlie bez elektriny, vody, možnosti kúrenia, bez WC, extrémne preľudnene obydlie, nájom/podnájom bez zmluvy, bývanie u príbuzných/známych, neudržateľnosť nájomnej zmluvy (napr. náhly pokles príjmu)',
            },
          ],
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
          options: [
            { value: 'menejAko1', title: 'Menej ako 1 rok' },
            { value: '1az2', title: '1 - 2 roky' },
            { value: '3az5', title: '3 - 5 rokov' },
            { value: '6az9', title: '6 - 9 rokov' },
            { value: '10aViac', title: '10 a viac rokov' },
          ],
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
            options: [
              {
                value: 'osamelyRodic',
                title:
                  'Osamelý rodič (dospelá osoba), ktorý/á žije v spoločnej domácnosti s nezaopatreným dieťaťom/deťmi, avšak bez manžela/manželky alebo partnera/partnerky, a zároveň tomuto dieťaťu/deťom zabezpečuje osobnú starostlivosť.',
              },
              {
                value: 'rodicNaDovolenke',
                title: 'Rodič na rodičovskej/materskej/otcovskej dovolenke',
              },
              {
                value: 'hrozbaOdobratiaDeti',
                title:
                  'Hrozba odobratia detí orgánom Sociálnoprávnej ochrany detí a sociálnej kurately v dôsledku akútnej bytovej núdze žiadateľa',
              },
              {
                value: 'opustenieUstavnejStarostlivosti',
                title:
                  'Opustenie ústavnej starostlivosti v uplynulých 3 rokoch: Centrum pre deti a rodiny a resocializačné stredisko',
              },
              {
                value: 'opustenieVazby',
                title:
                  'Opustenie Ústavu na výkon väzby a Ústav na výkon trestu odňatia slobody v uplynulých 3 rokoch alebo 3 mesiace pred prepustením',
              },
              {
                value: 'opustenieSpecialnehoZariadenia',
                title:
                  'Opustenie špeciálneho výchovného zariadenia v uplynulých 3 rokoch alebo 3 mesiace pred prepustením: Diagnostické centrá, reedukačné centrá, liečebno-výchovné sanatóriá, resocializačné stredisko',
              },
              { value: 'ine', title: 'Iné' },
            ],
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
            options: [
              { value: 'menejAko63', title: 'menej ako 63 rokov' },
              { value: '63az70', title: '63 - 70 rokov' },
              { value: '71az80', title: '71 - 80 rokov' },
              { value: '81aViac', title: '81 a viac rokov' },
            ],
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
        { title: 'Prečo si podávate žiadosť?' },
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
          options: [
            { value: 'garsonka1izbovy', title: 'garsónka/1-izbový byt' },
            { value: '2izbovy', title: '2-izbový byt' },
            { value: '3izbovy', title: '3-izbový byt' },
            { value: '4izbovy', title: '4-izbový byt' },
          ],
        },
        {},
      ),
      selectMultiple(
        'preferovanaLokalita',
        {
          title: 'Aká je vaša preferovaná lokalita nájomného bytu (mestská časť)?',
          required: true,
          options: [
            { value: 'stareMesto', title: 'Staré Mesto' },
            { value: 'ruzinov', title: 'Ružinov' },
            { value: 'vrakuna', title: 'Vrakuňa' },
            { value: 'podunajskeBiskupice', title: 'Podunajské Biskupice' },
            { value: 'noveMesto', title: 'Nové Mesto' },
            { value: 'karlovaVes', title: 'Karlova Ves' },
            { value: 'dubravka', title: 'Dúbravka' },
            { value: 'petrzalka', title: 'Petržalka' },
          ],
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
<% let maPrijem = (prijem) => it.helpers.safeBoolean(prijem?.zamestnanie) || it.helpers.safeBoolean(prijem?.samostatnaZarobkovaCinnost) || it.helpers.safeBoolean(prijem?.dochodok) || it.helpers.safeBoolean(prijem?.vyzivne) || it.helpers.safeBoolean(prijem?.davkaVNezamestnanosti) || it.helpers.safeBoolean(prijem?.inePrijmy) %>
<% let dokladRodinnyStav = (osobneUdaje) => it.helpers.safeString(osobneUdaje?.rodinnyStav) && osobneUdaje?.rodinnyStav !== "slobodny" %>

#### Žiadateľ/žiadateľka

- Osobné údaje - občiansky preukaz
<% if (dokladRodinnyStav(it.formData.ziadatelZiadatelka?.osobneUdaje)) { %>
- Osobné údaje - rozsudok o rozvode, sobášny list alebo iný doklad dokazujúci rodinný stav
<% } %>
- Adresa - dokumenty potvrdujúce pôsobenie v Bratislave, napr. pracovnú zmluvu, nájomnú zmluvu, potvrdenie o návšteve školy, potvrdenie z ubytovne, nocľahárne, potvrdenie sociálneho pracovníka o kontakte s klientom a pod.
<% if (it.helpers.safeBoolean(it.formData.ziadatelZiadatelka?.osobneUdaje?.adresaTrvalehoPobytu?.vlastnikNehnutelnosti)) { %>
- Adresa - list vlastníctva
<% } %>
<% if (maPrijem(it.formData.ziadatelZiadatelka?.prijem)) { %>
- Príjem - dokumenty dokazujúce všetky príjmy, napr. doklad od zamestnávateľa, potvrdenie z daňového úradu, potvrdenie o výške dôchodku, doklad o poberaní prídavkov na dieťa/deti, o poberaní materského, rodičovský príspevok, doklad o určení výšky výživného a pod.
<% } %>
<% if (it.helpers.safeBoolean(it.formData.ziadatelZiadatelka?.zdravotnyStav?.tzpPreukaz) || it.helpers.safeBoolean(it.formData.ziadatelZiadatelka?.zdravotnyStav?.chronickeOchorenie)) { %>
- Zdravotný stav - dokumenty dokazujúce zdravotný stav, napr. potvrdenie o chronickom ochorení od ošetrujúceho lekára
<% } %>
<% if (it.helpers.safeBoolean(it.formData.ziadatelZiadatelka?.rizikoveFaktoryWrapper?.rizikoveFaktory)) { %>
- Rizikové faktory - dokumenty dokazujúce rizikové faktory dokazujúce zvýšenú zraniteľnosť vás alebo iného člena/členky domácnosti, napr. rozhodnutie súdu/doklad o prepustení zo zariadenia/doklad od ÚPSVR a pod.
<% } %>

<% if (it.helpers.safeBoolean(it.formData.manzelManzelka?.manzelManzelkaSucastouDomacnosti)) { %>
#### Manžel/manželka

- Osobné údaje - kópia občianskeho preukazu
<% if (dokladRodinnyStav(it.formData.manzelManzelka?.osobneUdaje)) { %>
- Osobné údaje - rozsudok o rozvode, sobášny list alebo iný doklad dokazujúci rodinný stav
<% } %>
<% if (it.helpers.safeBoolean(it.formData.manzelManzelka?.osobneUdaje?.adresaSkutocnehoPobytu?.vlastnikNehnutelnosti)) { %>
- Adresa - list vlastníctva
<% } %>
<% if (maPrijem(it.formData.manzelManzelka?.prijem)) { %>
- Príjem - dokumenty dokazujúce všetky príjmy manžela/manželky, napr. doklad od zamestnávateľa, potvrdenie z daňového úradu, potvrdenie o výške dôchodku, doklad o poberaní prídavkov na dieťa/deti, o poberaní materského, rodičovský príspevok, doklad o určení výšky výživného a pod.
<% } %>
<% if (it.helpers.safeBoolean(it.formData.manzelManzelka?.zdravotnyStav?.tzpPreukaz) || it.helpers.safeBoolean(it.formData.manzelManzelka?.zdravotnyStav?.chronickeOchorenie)) { %>
- Zdravotný stav - dokumenty dokazujúce zdravotný stav manžela/manželky, napr. potvrdenie o chronickom ochorení od ošetrujúceho lekára
<% } %>
<% } %>

<% if (it.helpers.safeBoolean(it.formData.druhDruzka?.druhDruzkaSucastouDomacnosti)) { %>
#### Druh/družka

- Osobné údaje - kópia občianskeho preukazu
<% if (dokladRodinnyStav(it.formData.druhDruzka?.osobneUdaje)) { %>
- Osobné údaje - rozsudok o rozvode, sobášny list alebo iný doklad dokazujúci rodinný stav
<% } %>
<% if (it.helpers.safeBoolean(it.formData.druhDruzka?.osobneUdaje?.adresaSkutocnehoPobytu?.vlastnikNehnutelnosti)) { %>
- Adresa - list vlastníctva
<% } %>
<% if (maPrijem(it.formData.druhDruzka?.prijem)) { %>
- Príjem - dokumenty dokazujúce všetky príjmy druha/družky, napr. doklad od zamestnávateľa, potvrdenie z daňového úradu, potvrdenie o výške dôchodku, doklad o poberaní prídavkov na dieťa/deti, o poberaní materského, rodičovský príspevok, doklad o určení výšky výživného a pod.
<% } %>
<% if (it.helpers.safeBoolean(it.formData.druhDruzka?.zdravotnyStav?.tzpPreukaz) || it.helpers.safeBoolean(it.formData.druhDruzka?.zdravotnyStav?.chronickeOchorenie)) { %>
- Zdravotný stav - dokumenty dokazujúce zdravotný stav druha/družky, napr. potvrdenie o chronickom ochorení od ošetrujúceho lekára
<% } %>
<% } %>

<% if (it.helpers.safeBoolean(it.formData.deti?.detiSucastouDomacnosti)) { %>
#### Nezaopatrené deti do 25 rokov

<% it.helpers.safeArray(it.formData.deti.zoznamDeti).forEach(function(dieta, index) { %>
<% let dietaName = [dieta.osobneUdaje?.menoPriezvisko?.meno, dieta.osobneUdaje?.menoPriezvisko?.priezvisko].filter(Boolean).join(' ') %>
##### Dieťa <%= index + 1 %><% if (dietaName) { %> (<%= dietaName %>)<% } %>

- Osobné údaje - kópia rodného listu dieťaťa, resp. kópia občianskeho preukazu, ak už dieťa dovŕšilo vek 15 rokov
<% if (it.helpers.safeBoolean(dieta.osobneUdaje?.vlastnikNehnutelnosti)) { %>
- Adresa - list vlastníctva
<% } %>
<% if (it.helpers.safeBoolean(dieta.prijem?.student)) { %>
- Príjem - potvrdenie o návšteve školy
<% } %>
<% if (it.helpers.safeBoolean(dieta.prijem?.maPrijem)) { %>
- Príjem - potvrdenie o príjme dieťaťa
<% } %>
<% if (it.helpers.safeBoolean(dieta.zdravotnyStav?.tzpPreukaz) || it.helpers.safeBoolean(dieta.zdravotnyStav?.chronickeOchorenie)) { %>
- Zdravotný stav - dokumenty dokazujúce uvedený zdravotný stav dieťaťa, napr. potvrdenie o chronickom ochorení od ošetrujúceho lekára
<% } %>
<% }) %>
<% } %>

<% if (it.helpers.safeBoolean(it.formData.inyClenoviaClenkyDomacnosti?.inyClenoviaClenkySucastouDomacnosti)) { %>
#### Iní členovia/členky domácnosti

<% it.helpers.safeArray(it.formData.inyClenoviaClenkyDomacnosti.zoznamInychClenov).forEach(function(clen, index) { %>
<% let clenName = [clen.osobneUdaje?.menoPriezvisko?.meno, clen.osobneUdaje?.menoPriezvisko?.priezvisko].filter(Boolean).join(' ') %>
##### Člen/členka domácnosti <%= index + 1 %><% if (clenName) { %> (<%= clenName %>)<% } %>

- Osobné údaje - kópia občianskeho preukazu
<% if (dokladRodinnyStav(clen.osobneUdaje)) { %>
- Osobné údaje - doklad dokazujúci rodinný stav člena/členky domácnosti
<% } %>
<% if (it.helpers.safeBoolean(clen.osobneUdaje?.vlastnikNehnutelnosti)) { %>
- Adresa - list vlastníctva
<% } %>
<% if (maPrijem(clen.prijem)) { %>
- Príjem - dokumenty dokazujúce všetky príjmy člena/členky domácnosti, napr. doklad od zamestnávateľa, potvrdenie z daňového úradu, potvrdenie o výške dôchodku, doklad o poberaní prídavkov na dieťa/deti, o poberaní materského, rodičovský príspevok, doklad o určení výšky výživného a pod.
<% } %>
<% if (it.helpers.safeBoolean(clen.zdravotnyStav?.tzpPreukaz) || it.helpers.safeBoolean(clen.zdravotnyStav?.chronickeOchorenie)) { %>
- Zdravotný stav - dokumenty dokazujúce zdravotný stav člena/členky domácnosti, napr. potvrdenie o chronickom ochorení od ošetrujúceho lekára
<% } %>
<% }) %>
<% } %>`

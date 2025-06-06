import { createCondition } from '../generator/helpers'
import { GeneratorFieldType } from '../generator/generatorTypes'
import { select } from '../generator/functions/select'
import { selectMultiple } from '../generator/functions/selectMultiple'
import { input } from '../generator/functions/input'
import { number } from '../generator/functions/number'
import { radioGroup } from '../generator/functions/radioGroup'
import { textArea } from '../generator/functions/textArea'
import { checkbox } from '../generator/functions/checkbox'
import { checkboxGroup } from '../generator/functions/checkboxGroup'
import { datePicker } from '../generator/functions/datePicker'
import { customComponentsField } from '../generator/functions/customComponentsField'
import { object } from '../generator/object'
import { arrayField } from '../generator/functions/arrayField'
import { step } from '../generator/functions/step'
import { conditionalFields } from '../generator/functions/conditionalFields'
import { schema } from '../generator/functions/schema'
import { match } from 'ts-pattern'
import { conditionalStep } from '../generator/functions/conditionalStep'
import { StepUiOptions } from '../generator/uiOptionsTypes'

enum StepType {
  Ziadatel,
  ManzelManzelka,
  DruhDruzka,
  Dieta,
  InyClen,
}

const getConditionalStep = (
  stepProperty: string,
  stepOptions: {
    title: string
  } & StepUiOptions,
  inner: (ziadatelTzpPreukaz: boolean) => (GeneratorFieldType | null)[],
) =>
  [true, false].map((ziadatelTzpPreukaz) =>
    conditionalStep(
      stepProperty,
      createCondition([
        [['ziadatelZiadatelka', 'zdravotnyStav', 'tzpPreukaz'], { const: ziadatelTzpPreukaz }],
      ]),
      stepOptions,
      inner(ziadatelTzpPreukaz),
    ),
  )

const adresaSharedFields = [
  input('ulicaACislo', { title: 'Ulica a číslo', required: true, type: 'text' }, {}),
  input('mesto', { type: 'text', title: 'Mesto', required: true }, { selfColumn: '3/4' }),
  input('psc', { type: 'ba-slovak-zip', title: 'PSČ', required: true }, { selfColumn: '1/4' }),
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
            'Je vaše nezaopatrené dieťa vlastníkom/vlastníčkou alebo spoluvlastníkom/spoluvlastníčkou nehnuteľnosti určenej na bývanie?',
          [StepType.DruhDruzka]:
            'Je váš druh/družka vlastníkom/vlastníčkou alebo spoluvlastníkom/spoluvlastníčkou nehnuteľnosti určenej na bývanie?',
          [StepType.InyClen]:
            'Je člen/členka domácnosti vlastníkom/vlastníčkou alebo spoluvlastníkom/spoluvlastníčkou nehnuteľnosti určenej na bývanie?',
        }[stepType],
        required: true,
        items: [
          { value: true, label: 'Áno' },
          { value: false, label: 'Nie', isDefault: true },
        ],
      },
      {
        variant: 'boxed',
        orientations: 'row',
        helptext:
          stepType === StepType.Ziadatel
            ? 'Ak ste vlastníkom/vlastníčkou alebo spoluvlastníkom/spoluvlastníčkou nehnuteľnosti, ale nemôžete v nej bývať, napr. kvôli stavebným, hygienickým nedostatkom alebo právnym prekážkam brániacim riadnemu užívaniu nehnuteľnosti, označte "Áno" a uveďte túto skutočnosť pod otázkou *Napíšte dôvody, pre ktoré nemôžete využívať túto nehnuteľnosť na bývanie*.'
            : 'Ak je vlastníkom/vlastníčkou alebo spoluvlastníkom/spoluvlastníčkou nehnuteľnosti, ale nemôžete v nej bývať, napr. kvôli stavebným, hygienickým nedostatkom alebo právnym prekážkam brániacim riadnemu užívaniu nehnuteľnosti, označte "Áno" a uveďte túto skutočnosť pod otázkou *Napíšte dôvody, pre ktoré nemôžete využívať túto nehnuteľnosť na bývanie*.',
        helptextMarkdown: true,
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
    {
      objectDisplay: 'boxed',
      title: 'Adresa trvalého pobytu',
      description:
        'Ak máte v občianskom preukaze uvedenú mestskú časť, uveďte adresu daného mestského úradu.',
    },
    [
      ...adresaSharedFields,
      ...getVlastnikNehnutelnostiFields(stepType),
      radioGroup(
        'byvanieVMestskomNajomnomByte',
        {
          type: 'boolean',
          title: 'Bývate v mestskom nájomnom byte v Bratislave?',
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
      radioGroup(
        'pobytVBratislaveViacAkoRok',
        {
          type: 'boolean',
          title:
            'Žijete na území Bratislavy viac ako 1 rok? (vrátane trvalého a skutočného pobytu)',
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
      conditionalFields(createCondition([[['pobytVBratislaveViacAkoRok'], { const: true }]]), [
        customComponentsField(
          'pobytVBratislaveViacAkoRokAlert',
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
          items: [
            { value: true, label: 'Áno', isDefault: true },
            { value: false, label: 'Nie' },
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
  return object('osobneUdaje', { objectDisplay: 'boxed', title: 'Osobné údaje' }, [
    input('meno', { title: 'Meno', required: true, type: 'text' }, { selfColumn: '2/4' }),
    input(
      'priezvisko',
      { title: 'Priezvisko', required: true, type: 'text' },
      { selfColumn: '2/4' },
    ),
    stepType !== StepType.Dieta
      ? input(
          'rodnePriezvisko',
          { title: 'Rodné priezvisko', type: 'text' },
          {
            helptext:
              stepType === StepType.Ziadatel
                ? 'Vyplňte iba v prípade, ak je vaše priezvisko iné ako to, ktoré ste uviedli v predchádzajúcej odpovedi.'
                : 'Vyplňte iba v prípade, ak je priezvisko iné ako to, ktoré ste uviedli v predchádzajúcej odpovedi.',
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
        items: [
          { value: 'slovenska', label: 'Slovenská', isDefault: true },
          { value: 'ina', label: 'Iná' },
        ],
      },
      { variant: 'boxed', orientations: 'row' },
    ),
    ...(stepType !== StepType.Dieta && stepType !== StepType.ManzelManzelka
      ? [
          select(
            'rodinnyStav',
            {
              title: 'Rodinný stav',
              required: true,
              items: [
                { value: 'slobodny', label: 'Slobodný/slobodná' },
                { value: 'zenaty', label: 'Ženatý/vydatá' },
                { value: 'rozvedeny', label: 'Rozvedený/rozvedená' },
                { value: 'vdovec', label: 'Vdovec/vdova' },
                { value: 'ine', label: 'Iné' },
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
                'rodinnyStavAlert',
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
    ...(stepType === StepType.Ziadatel
      ? [
          input(
            'email',
            { title: 'Email', type: 'email' },
            {
              helptext: 'Ak nemáte email, uveďte kontaktné údaje na inú osobu resp. organizáciu.',
            },
          ),
          conditionalFields(createCondition([[['email'], { type: 'string' }]]), [
            radioGroup(
              'kontaktovanyEmailom',
              {
                type: 'boolean',
                title: 'Chcem byť kontaktovaný/á emailom?',
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
          ]),
        ]
      : []),
    stepType === StepType.Ziadatel
      ? input(
          'telefonneCislo',
          { type: 'ba-slovak-phone-number', title: 'Telefónne číslo', required: true },
          {
            size: 'medium',
            placeholder: '+421',
            helptext:
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
  ])
}

const getPrijemSection = (stepType: StepType) => {
  const wrapper = (fields: (GeneratorFieldType | null)[]) =>
    object(
      'prijem',
      {
        objectDisplay: 'boxed',
        title: 'Príjem',
        description: {
          [StepType.Ziadatel]:
            'Posudzuje sa váš priemerný čistý mesačný príjem za celý minulý kalendárny rok. Priemerný mesačný príjem sa vypočíta ako podiel príjmu za daný kalendárny rok a príslušného počtu mesiacov, počas ktorých sa príjem poberal.',
          [StepType.ManzelManzelka]:
            'Posudzuje sa priemerný čistý mesačný príjem manžela/manželky za celý minulý kalendárny rok. Priemerný mesačný príjem sa vypočíta ako podiel príjmu za daný kalendárny rok a príslušného počtu mesiacov, počas ktorých sa príjem poberal.',
          [StepType.DruhDruzka]:
            'Posudzuje sa priemerný čistý mesačný príjem druha/družky za celý minulý kalendárny rok. Priemerný mesačný príjem sa vypočíta ako podiel príjmu za daný kalendárny rok a príslušného počtu mesiacov, počas ktorých sa príjem poberal.',
          [StepType.Dieta]: undefined,
          [StepType.InyClen]:
            'Posudzuje sa priemerný čistý mesačný príjem člena/členky domácnosti za celý minulý kalendárny rok. Priemerný mesačný príjem sa vypočíta ako podiel príjmu za daný kalendárny rok a príslušného počtu mesiacov, počas ktorých sa príjem poberal.',
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
      conditionalFields(createCondition([[['student'], { const: true }]]), [
        customComponentsField(
          'studentAlert',
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
            'Malo dieťa staršie ako 15 rokov v minulom kalendárnom roku príjem, ktorý by sa mohol zarátavať do celkového príjmu domácnosti?',
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
      conditionalFields(createCondition([[['maPrijem'], { const: true }]]), [
        number(
          'prijemVyska',
          {
            title: 'Čistý mesačný príjem dieťaťa',
            type: 'number',
            step: 0.01,
            required: true,
            minimum: 0,
          },
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
      customComponentsField(
        'sucetPrijmovStudentKalkulacka',
        {
          type: 'calculator',
          props: {
            variant: 'white',
            calculators: [
              {
                label: 'Súčet všetkých čistých mesačných príjmov dieťaťa',
                formula: 'maPrijem ? prijemVyska : 0',
                missingFieldsMessage:
                  'Pre zobrazenie súčtu príjmu je potrebné vyplniť správne všetky príjmy.',
                unit: '€',
              },
            ],
          },
        },
        {},
      ),
    ])
  }

  const fields = [
    radioGroup(
      'zamestnanie',
      {
        type: 'boolean',
        title: {
          [StepType.Ziadatel]: 'Boli ste v minulom kalendárnom roku zamestnaný/á?',
          [StepType.ManzelManzelka]:
            'Bol váš manžel/manželka v minulom kalendárnom roku zamestnaný/á?',
          [StepType.DruhDruzka]: 'Bol váš druh/družka v minulom kalendárnom roku zamestnaný/á?',
          [StepType.InyClen]: 'Bol člen/členka  v minulom kalendárnom roku zamestnaný/á?',
        }[stepType],
        required: true,
        items: [
          { value: true, label: 'Áno' },
          { value: false, label: 'Nie', isDefault: true },
        ],
      },
      {
        variant: 'boxed',
        orientations: 'row',
        helptext: {
          [StepType.Ziadatel]:
            'Pri príjme zo zamestnania ide o čistú mzdu, t. j. príjem očistený od dane z príjmu a odvodov na zdravotné a sociálne poistenie, príp. dôchodkového sporenia. Váš zamestnávateľ vám na základe žiadosti vystaví [potvrdenie o výške príjmu](https://cdn-api.bratislava.sk/strapi-homepage/upload/Potvrdenie_o_vyske_prijmu_Priloha3_0eceac9a76.pdf). Je potrebné uviesť váš priemerný mesačný čistý príjem za minulý kalendárny rok.',
          [StepType.ManzelManzelka]:
            'Pri príjme zo zamestnania ide o čistú mzdu, t. j. príjem očistený od dane z príjmu a odvodov na zdravotné a sociálne poistenie, príp. dôchodkového sporenia. Zamestnávateľ vášmu manželovi/manželke na základe žiadosti vystaví [potvrdenie o výške príjmu](https://cdn-api.bratislava.sk/strapi-homepage/upload/Potvrdenie_o_vyske_prijmu_Priloha3_0eceac9a76.pdf). Je potrebné uviesť priemerný mesačný čistý príjem za minulý kalendárny rok.',
          [StepType.DruhDruzka]:
            'Pri príjme zo zamestnania ide o čistú mzdu, t. j. príjem očistený od dane z príjmu a odvodov na zdravotné a sociálne poistenie, príp. dôchodkového sporenia. Zamestnávateľ vášmu druhovi/družke na základe žiadosti vystaví [potvrdenie o výške príjmu](https://cdn-api.bratislava.sk/strapi-homepage/upload/Potvrdenie_o_vyske_prijmu_Priloha3_0eceac9a76.pdf). Je potrebné uviesť priemerný mesačný čistý príjem za minulý kalendárny rok.',
          [StepType.InyClen]:
            'Pri príjme zo zamestnania ide o čistú mzdu, t. j. príjem očistený od dane z príjmu a odvodov na zdravotné a sociálne poistenie, príp. dôchodkového sporenia. Zamestnávateľ člena/členky domácnosti na základe žiadosti vystaví [potvrdenie o výške príjmu](https://cdn-api.bratislava.sk/strapi-homepage/upload/Potvrdenie_o_vyske_prijmu_Priloha3_0eceac9a76.pdf). Je potrebné uviesť priemerný mesačný čistý príjem za minulý kalendárny rok.',
        }[stepType],
        helptextMarkdown: true,
      },
    ),
    conditionalFields(createCondition([[['zamestnanie'], { const: true }]]), [
      number(
        'zamestnaniePrijem',
        {
          title: 'Čistý mesačný príjem zo zamestnania',
          type: 'number',
          step: 0.01,
          required: true,
          minimum: 0,
        },
        { leftIcon: 'euro', size: 'medium' },
      ),
    ]),
    radioGroup(
      'samostatnaZarobkovaCinnost',
      {
        type: 'boolean',
        title:
          stepType === StepType.Ziadatel
            ? 'Mali ste v minulom kalendárnom roku príjem zo samostatnej zárobkovej činnosti?'
            : 'Mal/mala v minulom kalendárnom roku príjem zo samostatnej zárobkovej činnosti?',
        required: true,
        items: [
          { value: true, label: 'Áno' },
          { value: false, label: 'Nie', isDefault: true },
        ],
      },
      {
        variant: 'boxed',
        orientations: 'row',
        helptext: {
          [StepType.Ziadatel]:
            'V prípade príjmu z podnikania, resp. zo samostatnej zárobkovej činnosti (vrátane živnosti) je potrebné uviesť čistý príjem SZČO po odpočítaní výdavkov, odvodov poistného na [sociálne poistenie](https://sk.wikipedia.org/wiki/Soci%C3%A1lne_poistenie) a [zdravotné poistenie](https://sk.wikipedia.org/wiki/Zdravotn%C3%A9_poistenie) a zaplatenej dane z príjmu. V tomto prípade prosím uveďte sumu Vášho čistého príjmu podľa potvrdenia, ktoré vám vydá daňový úrad. Ak v čase podávania tejto žiadosti ešte nemáte podané daňové priznanie, resp. nepoznáte sumu vášho príjmu, vyplňte prosím váš čistý príjem za posledný známy rok.',
          [StepType.ManzelManzelka]:
            'V prípade príjmu z podnikania, resp. zo samostatnej zárobkovej činnosti (vrátane živnosti) je potrebné uviesť čistý príjem SZČO po odpočítaní výdavkov, odvodov poistného na [sociálne poistenie](https://sk.wikipedia.org/wiki/Soci%C3%A1lne_poistenie) a [zdravotné poistenie](https://sk.wikipedia.org/wiki/Zdravotn%C3%A9_poistenie) a zaplatenej dane z príjmu. V tomto prípade prosím uveďte sumu čistého príjmu manžela/manželky podľa potvrdenia, ktoré mu/jej vydá daňový úrad. Ak v čase podávania tejto žiadosti ešte nemá podané daňové priznanie, resp. nepozná sumu jeho/jej príjmu, vyplňte prosím čistý príjem za posledný známy rok.',
          [StepType.DruhDruzka]:
            'V prípade príjmu z podnikania, resp. zo samostatnej zárobkovej činnosti (vrátane živnosti) je potrebné uviesť čistý príjem SZČO po odpočítaní výdavkov, odvodov poistného na [sociálne poistenie](https://sk.wikipedia.org/wiki/Soci%C3%A1lne_poistenie) a [zdravotné poistenie](https://sk.wikipedia.org/wiki/Zdravotn%C3%A9_poistenie) a zaplatenej dane z príjmu. V tomto prípade prosím uveďte sumu čistého príjmu druha/družky podľa potvrdenia, ktoré mu/jej vydá daňový úrad. Ak v čase podávania tejto žiadosti ešte nemá podané daňové priznanie, resp. nepozná sumu jeho/jej príjmu, vyplňte prosím čistý príjem za posledný známy rok.',
          [StepType.InyClen]:
            'V prípade príjmu z podnikania, resp. zo samostatnej zárobkovej činnosti (vrátane živnosti) je potrebné uviesť čistý príjem SZČO po odpočítaní výdavkov, odvodov poistného na [sociálne poistenie](https://sk.wikipedia.org/wiki/Soci%C3%A1lne_poistenie) a [zdravotné poistenie](https://sk.wikipedia.org/wiki/Zdravotn%C3%A9_poistenie) a zaplatenej dane z príjmu. V tomto prípade prosím uveďte sumu čistého príjmu člena/členky domácnosti podľa potvrdenia, ktoré mu/jej vydá daňový úrad. Ak v čase podávania tejto žiadosti ešte nemá podané daňové priznanie, resp. nepozná sumu jeho/jej príjmu, vyplňte prosím čistý príjem za posledný známy rok.',
        }[stepType],
        helptextMarkdown: true,
      },
    ),
    conditionalFields(createCondition([[['samostatnaZarobkovaCinnost'], { const: true }]]), [
      number(
        'samostatnaZarobkovaCinnostPrijem',
        {
          title: 'Mesačný príjem z podnikania',
          type: 'number',
          step: 0.01,
          required: true,
          minimum: 0,
        },
        { leftIcon: 'euro', size: 'medium' },
      ),
    ]),
    radioGroup(
      'dochodok',
      {
        type: 'boolean',
        title:
          stepType === StepType.Ziadatel
            ? 'Poberali ste v minulom kalendárnom roku dôchodok?'
            : 'Poberal/poberala v minulom kalendárnom roku dôchodok?',
        required: true,
        items: [
          { value: true, label: 'Áno' },
          { value: false, label: 'Nie', isDefault: true },
        ],
      },
      {
        variant: 'boxed',
        orientations: 'row',
        helptext:
          stepType === StepType.Ziadatel
            ? 'Označte áno, ak ste poberali v minulom kalendárnom roku niektorý z dôchodkov, resp. dôchodkových dávok v rámci systému sociálneho zabezpečenia, napr. invalidný dôchodok, starobný / predčasný starobný dôchodok, vdovský / vdovecký dôchodok, sirotský dôchodok, výsluhový dôchodok.'
            : 'Označte áno, ak poberal/poberala v minulom kalendárnom roku niektorý z dôchodkov, resp. dôchodkových dávok v rámci systému sociálneho zabezpečenia, napr. invalidný dôchodok, starobný / predčasný starobný dôchodok, vdovský / vdovecký dôchodok, sirotský dôchodok, výsluhový dôchodok.',
      },
    ),
    conditionalFields(createCondition([[['dochodok'], { const: true }]]), [
      number(
        'dochodokVyska',
        { title: 'Mesačná výška dôchodku', type: 'number', step: 0.01, required: true, minimum: 0 },
        { leftIcon: 'euro', size: 'medium' },
      ),
    ]),
    radioGroup(
      'vyzivne',
      {
        type: 'boolean',
        title:
          stepType === StepType.Ziadatel
            ? 'Poberali ste v minulom kalendárnom roku výživné alebo náhradné výživné na dieťa/deti?'
            : 'Poberal/poberala v minulom kalendárnom roku výživné alebo náhradné výživné na dieťa/deti?',
        required: true,
        items: [
          { value: true, label: 'Áno' },
          { value: false, label: 'Nie', isDefault: true },
        ],
      },
      { variant: 'boxed', orientations: 'row' },
    ),
    conditionalFields(createCondition([[['vyzivne'], { const: true }]]), [
      number(
        'vyzivneVyska',
        {
          title: 'Mesačná výška sumy výživného na dieťa/deti',
          type: 'number',
          step: 0.01,
          required: true,
          minimum: 0,
        },
        { leftIcon: 'euro', size: 'medium' },
      ),
    ]),
    radioGroup(
      'davkaVNezamestnanosti',
      {
        type: 'boolean',
        title:
          stepType === StepType.Ziadatel
            ? 'Poberali ste v minulom kalendárnom roku dávku v nezamestnanosti?'
            : 'Poberal/poberala v minulom kalendárnom roku dávku v nezamestnanosti?',
        required: true,
        items: [
          { value: true, label: 'Áno' },
          { value: false, label: 'Nie', isDefault: true },
        ],
      },
      { variant: 'boxed', orientations: 'row' },
    ),
    conditionalFields(createCondition([[['davkaVNezamestnanosti'], { const: true }]]), [
      number(
        'davkaVNezamestnanostiVyska',
        {
          title: 'Mesačná výška príspevku z úradu práce',
          type: 'number',
          step: 0.01,
          required: true,
          minimum: 0,
        },
        { leftIcon: 'euro', size: 'medium' },
      ),
    ]),
    radioGroup(
      'inePrijmy',
      {
        type: 'boolean',
        title:
          stepType === StepType.Ziadatel
            ? 'Poberali ste v minulom kalendárnom roku iné príjmy?'
            : 'Poberal/poberala v minulom kalendárnom roku iné príjmy?',
        required: true,
        items: [
          { value: true, label: 'Áno' },
          { value: false, label: 'Nie', isDefault: true },
        ],
      },
      {
        variant: 'boxed',
        orientations: 'row',
        helptext:
          'Materskú, tehotenský príspevok, rodičovský príspevok, prídavky na deti, dávka v hmotnej núdzi, ochranný príspevok, opatrovateľský príspevok, kompenzačný príspevok alebo iné príspevky z Úradu práce.',
      },
    ),
    conditionalFields(createCondition([[['inePrijmy'], { const: true }]]), [
      number(
        'inePrijmyVyska',
        {
          title: 'Iné pravidelné mesačné príjmy',
          type: 'number',
          step: 0.01,
          required: true,
          minimum: 0,
        },
        { leftIcon: 'euro', size: 'medium' },
      ),
    ]),
    customComponentsField(
      'prijmyAlert',
      {
        type: 'alert',
        props: {
          type: 'info',
          message: {
            [StepType.Ziadatel]:
              'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte dokumenty dokazujúce všetky spomínané príjmy (napríklad doklad od zamestnávateľa, potvrdenie z daňového úradu, potvrdenie o výške dôchodku, doklad o poberaní prídavkov na dieťa/deti, o poberaní materského, rodičovský príspevok, doklad o určení výšky výživného a pod.)',
            [StepType.ManzelManzelka]:
              'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte dokumenty dokazujúce všetky spomínané príjmy manžela/manželky (napríklad doklad od zamestnávateľa, potvrdenie z daňového úradu, potvrdenie o výške dôchodku, doklad o poberaní prídavkov na dieťa/deti, o poberaní materského, rodičovský príspevok, doklad o určení výšky výživného a pod.)',
            [StepType.DruhDruzka]:
              'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte dokumenty dokazujúce všetky spomínané príjmy druha/družky (napríklad doklad od zamestnávateľa, potvrdenie z daňového úradu, potvrdenie o výške dôchodku, doklad o poberaní prídavkov na dieťa/deti, o poberaní materského, rodičovský príspevok, doklad o určení výšky výživného a pod.)',
            [StepType.InyClen]:
              'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte dokumenty dokazujúce všetky spomínané príjmy člena/členky domácnosti (napríklad doklad od zamestnávateľa, potvrdenie z daňového úradu, potvrdenie o výške dôchodku, doklad o poberaní prídavkov na dieťa/deti, o poberaní materského, rodičovský príspevok, doklad o určení výšky výživného a pod.)',
          }[stepType],
        },
      },
      {},
    ),
    customComponentsField(
      'sucetPrijmovKalkulacka',
      {
        type: 'calculator',
        props: {
          variant: 'white',
          calculators: [
            {
              label: {
                [StepType.Ziadatel]:
                  'Súčet všetkých čistých mesačných príjmov žiadateľa/žiadateľky',
                [StepType.ManzelManzelka]:
                  'Súčet všetkých čistých mesačných príjmov manžela/manželky',
                [StepType.DruhDruzka]: 'Súčet všetkých čistých mesačných príjmov druha/družky',
                [StepType.InyClen]:
                  'Súčet všetkých čistých mesačných príjmov člena/členky domácnosti',
              }[stepType],
              formula:
                'zamestnaniePrijemSum = zamestnanie ? zamestnaniePrijem : 0;\n' +
                'samostatnaZarobkovaCinnostPrijemSum = samostatnaZarobkovaCinnost ? samostatnaZarobkovaCinnostPrijem : 0;\n' +
                'dochodokSum = dochodok ? dochodokVyska : 0;\n' +
                'vyzivneSum = vyzivne ? vyzivneVyska : 0;\n' +
                'davkaVNezamestnanostiSum = davkaVNezamestnanosti ? davkaVNezamestnanostiVyska : 0;\n' +
                'inePrijmySum = inePrijmy ? inePrijmyVyska : 0;\n' +
                'zamestnaniePrijemSum + samostatnaZarobkovaCinnostPrijemSum + dochodokSum + vyzivneSum + davkaVNezamestnanostiSum + inePrijmySum',
              missingFieldsMessage:
                'Pre zobrazenie súčtu príjmu je potrebné vyplniť správne všetky príjmy.',
              unit: '€',
            },
          ],
        },
      },
      {},
    ),
  ]

  return wrapper(fields)
}

const getZdravotnyStavSection = (stepType: StepType) => {
  const choroby = [
    radioGroup(
      'chronickeOchorenie',
      {
        type: 'boolean',
        title: match(stepType)
          .with(StepType.Ziadatel, () => 'Trpíte chronickým ochorením?')
          .otherwise(() => 'Trpí chronickým ochorením?'),
        required: true,
        items: [
          { value: true, label: 'Áno' },
          { value: false, label: 'Nie', isDefault: true },
        ],
      },
      { variant: 'boxed', orientations: 'row' },
    ),
    conditionalFields(createCondition([[['chronickeOchorenie'], { const: true }]]), [
      selectMultiple(
        'existujuceDiagnozy',
        {
          title: match(stepType)
            .with(StepType.Ziadatel, () => 'Máte niektorú z týchto diagnóz?')
            .with(StepType.Dieta, () => 'Má dieťa niektorú z týchto diagnóz?')
            .otherwise(() => 'Má niektorú z týchto diagnóz?'),
          required: true,
          items: [
            { value: 'alzheimer', label: 'Alzheimerova choroba' },
            { value: 'anorexiaBulimia', label: 'Anorexia/Bulímia' },
            {
              value: 'arterialnaHypertenzia',
              label: 'Arteriálna hypertenzia (chronický zvýšený tlak)',
            },
            { value: 'astma', label: 'Astma' },
            { value: 'autizmus', label: 'Autizmus' },
            { value: 'bipolarnaPorucha', label: 'Bipolárna porucha' },
            {
              value: 'chronickaObstrukcnaChorobaPluc',
              label: 'Chronická obštrukčná choroba pľúc (Symptomatická)',
            },
            { value: 'chronickaParadentoza', label: 'Chronická paradentóza' },
            {
              value: 'chronickeGastroenterologickeOchorenia',
              label:
                'Chronické gastroenterologické ochorenia (Crohnova choroba, Ulcerózna kolitída, Chronická gastritída a podobné)',
            },
            {
              value: 'chronickeMuskuloskeletalneChoroby',
              label: 'Chronické muskuloskeletálne choroby (obmedzený pohyb, chýbajúca končatina)',
            },
            {
              value: 'chronickeNasledkyCMP',
              label: 'Chronické následky cievnej mozgovej príhody',
            },
            {
              value: 'chronickeOchorenieObliciek',
              label:
                'Chronické ochorenie obličiek v dôsledku nasledovných chorôb: Cukrovka, Glomerulonefritída, Hypertenzia, prípadne iných ochorení',
            },
            {
              value: 'chronickeOchoreniePecene',
              label: 'Chronické ochorenie pečene (cirhóza, hepatitídy atď., okrem rakoviny)',
            },
            {
              value: 'chronickeOchoreniaKoze',
              label:
                'Chronické rozsiahle ochorenia kože s komplikáciami (chronický ekzém, chronické formy parapsoriázy)',
            },
            {
              value: 'chronickyZapalStrednhoUcha',
              label: 'Chronický zápal stredného ucha (strata sluchu, vertigo)',
            },
            { value: 'demencia', label: 'Demencia' },
            {
              value: 'diabetesBezKomplikacii',
              label: 'Diabetes mellitus 1 a 2 typu (Cukrovka) bez závažných komplikácií',
            },
            {
              value: 'diabetesSKomplikaciami',
              label:
                'Diabetes mellitus 1 a 2 typu (Cukrovka) so závažnými komplikáciami (diabetická noha, neuropatia, retinopatia)',
            },
            {
              value: 'rakovinaSLiecbou',
              label: 'Diagnostikovaná rakovina s nastavenou liečbou (všetky typy rakoviny)',
            },
            { value: 'downovSyndrom', label: 'Downov syndróm' },
            { value: 'dystymiaUzkost', label: 'Dystýmia + Úzkostná porucha' },
            { value: 'encefalokela', label: 'Encefalokéla (vady mozgu)' },
            { value: 'epilepsia', label: 'Epilepsia' },
            { value: 'guillainBarrehoSyndrom', label: 'Guillainov-Barrého syndróm' },
            { value: 'hepatitidaC', label: 'Hepatitída C' },
            { value: 'hivAids', label: 'HIV/AIDS' },
            { value: 'hluchota', label: 'Hluchota (bez posudku)' },
            { value: 'ineChronickeOchoreniaSrdca', label: 'Iné chronické ochorenia srdca' },
            { value: 'ischemickaChorobaSrdca', label: 'Ischemická choroba srdca' },
            { value: 'klinefelterovSyndrom', label: 'Klinefelterov syndróm' },
            {
              value: 'metastatickaRakovina',
              label: 'Metastatická fáza rakoviny (všetky typy rakoviny)',
            },
            { value: 'ocneOchorenia', label: 'Očné ochorenia (glaukoma, katarakta a podobné)' },
            { value: 'ochorenieMotorickychNeuronov', label: 'Ochorenie motorických neurónov' },
            { value: 'osteoatroza', label: 'Osteoatróza (artróza)' },
            { value: 'parkinson', label: 'Parkinsonova choroba' },
            {
              value: 'rakovinaVRemisii',
              label: 'Rakovina vo fáze remisie (všetky typy rakoviny)',
            },
            { value: 'reumatickeOchorenieSrdca', label: 'Reumatické ochorenie srdca' },
            { value: 'reumatoidnaArtritida', label: 'Reumatoidná artritída' },
            { value: 'sarkoidoza', label: 'Sarkoidóza' },
            { value: 'schistosomoza', label: 'Schistosomóza (krvné motolice)' },
            { value: 'schizofrenia', label: 'Schizofrénia' },
            { value: 'slepota', label: 'Slepota (bez posudku)' },
            {
              value: 'silikozaAzbestozaPneumokonioza',
              label: 'Silikóza, Azbestóza, Pneumokonióza',
            },
            { value: 'sklerozaMultiplex', label: 'Skleróza multiplex (roztrúsená)' },
            { value: 'spinaBifida', label: 'Spina bifida (rázštep chrbtice)' },
            { value: 'spinozaAtrezia', label: 'Spinóza a/alebo atrézia traviacého traktu' },
            { value: 'struma', label: 'Struma (zväčšená štítna žľaza)' },
            { value: 'syfilis', label: 'Syfilis' },
            { value: 'tetanus', label: 'Tetanus' },
            {
              value: 'terminalnaFazaRakoviny',
              label: 'Terminálna fáza rakoviny (všetky typy rakoviny)',
            },
            { value: 'tuberkuloza', label: 'Tuberkulóza' },
            { value: 'turnerovSyndrom', label: 'Turnerov syndróm' },
            { value: 'vrodenaChybaBranice', label: 'Vrodená chyba bránice (CDH)' },
            {
              value: 'vrodeneChybyBrusnejSteny',
              label: 'Vrodené chyby brušnej steny a/alebo tráviaceho traktu',
            },
            {
              value: 'vrodenePoruchyPohybovehoAparatu',
              label: 'Vrodené poruchy a abnormality pohybového aparátu',
            },
            { value: 'vrodeneSrdcoveChyby', label: 'Vrodené srdcové chyby (CHD)' },
          ],
        },
        {},
      ),
    ]),
  ]

  const alert = customComponentsField(
    'zdravotnyStavAlert',
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
  )

  return object(
    'zdravotnyStav',
    {
      objectDisplay: 'boxed',
      title: 'Zdravotný stav',
      description: {
        [StepType.Ziadatel]:
          'Diagnózy vypĺňajte až po tom, ako ich budete mať odkonzultované a následne potvrdené vašim (všeobecným) lekárom - [vzor tlačiva pre lekára](https://cdn-api.bratislava.sk/strapi-homepage/upload/Potvrdenie_od_lekara_zoznam_diagnoz_Priloha1_3cb11640e7.pdf).',
        [StepType.ManzelManzelka]:
          'Diagnózy vypĺňajte až po tom, ako ich budete mať odkonzultované a následne potvrdené (všeobecným) lekárom manžela/manželky - [vzor tlačiva pre lekára](https://cdn-api.bratislava.sk/strapi-homepage/upload/Potvrdenie_od_lekara_zoznam_diagnoz_Priloha1_3cb11640e7.pdf).',
        [StepType.DruhDruzka]:
          'Diagnózy vypĺňajte až po tom, ako ich budete mať odkonzultované a následne potvrdené (všeobecným) lekárom druha/družky - [vzor tlačiva pre lekára](https://cdn-api.bratislava.sk/strapi-homepage/upload/Potvrdenie_od_lekara_zoznam_diagnoz_Priloha1_3cb11640e7.pdf).',
        [StepType.Dieta]:
          'Diagnózy vypĺňajte až po tom, ako ich budete mať odkonzultované a následne potvrdené (všeobecným) lekárom dieťaťa - [vzor tlačiva pre lekára](https://cdn-api.bratislava.sk/strapi-homepage/upload/Potvrdenie_od_lekara_zoznam_diagnoz_Priloha1_3cb11640e7.pdf).',
        [StepType.InyClen]:
          'Diagnózy vypĺňajte až po tom, ako ich budete mať odkonzultované a následne potvrdené (všeobecným) lekárom člena/členky domácnosti - [vzor tlačiva pre lekára](https://cdn-api.bratislava.sk/strapi-homepage/upload/Potvrdenie_od_lekara_zoznam_diagnoz_Priloha1_3cb11640e7.pdf).',
      }[stepType],
      descriptionMarkdown: true,
    },
    match(stepType)
      .with(StepType.Ziadatel, () => [
        radioGroup(
          'tzpPreukaz',
          {
            type: 'boolean',
            title:
              stepType === StepType.Ziadatel
                ? 'Ste vy, alebo niekto z členov budúcej domácnosti držiteľom preukazu ŤZP?'
                : 'Je držiteľom preukazu ŤZP?',
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
        conditionalFields(createCondition([[['tzpPreukaz'], { const: true }]]), [
          input(
            'menoDrzitelaTzp',
            {
              type: 'text',
              title:
                'Uveďte meno člena/členky budúcej domácnosti s najvyššou mierou uznanej funkčnej poruchy',
              required: true,
            },
            {},
          ),
          select(
            'mieraFunkcnejPoruchy',
            {
              title: 'Aká je najvyššia uznaná miera funkčnej poruchy držiteľa/ky preukazu ŤZP?',
              required: true,
              items: [
                { value: '50az74', label: 'Od 50 % do 74 %' },
                { value: '75az100', label: 'Od 75 % do 100 %' },
              ],
            },
            {},
          ),
        ]),
        conditionalFields(createCondition([[['tzpPreukaz'], { const: false }]]), choroby),
        radioGroup(
          'bezbarierovyByt',
          {
            type: 'boolean',
            title: 'Uchádzate sa o pridelenie bezbariérového bytu?',
            required: true,
            items: [
              { value: true, label: 'Áno' },
              { value: false, label: 'Nie', isDefault: true },
            ],
          },
          {
            variant: 'boxed',
            orientations: 'row',
            helptext: `Podmienkou pridelenia bezbariérového bytu je, že žiadateľ alebo člen domácnosti musí mať lekárom potvrdené, že má diagnostikované zdravotné postihnutie, v zmysle [prílohy č. 2 zákona 443/2010 Z. z.](https://www.slov-lex.sk/pravne-predpisy/SK/ZZ/2010/443/20180101#prilohy) - [vzor tlačiva pre lekára](https://cdn-api.bratislava.sk/strapi-homepage/upload/Potvrdenie_od_lekara_bezbarierovy_byt_Priloha2_94fc7ae8e6.pdf).`,
            helptextMarkdown: true,
          },
        ),
        alert,
      ])
      .otherwise(() => [...choroby, alert]),
  )
}

const getSucasneByvanieSection = (stepType: StepType) => {
  const wrapper = (fields: (GeneratorFieldType | null)[]) =>
    object(
      'sucasneByvanie',
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
              [StepType.Dieta]:
                'Je situácia súčasného bývania vášho nezaopatreného dieťaťa rovnaká ako vaša?',
              [StepType.InyClen]:
                'Je situácia súčasného bývania člena/členky domácnosti rovnaká ako vaša?',
            }[stepType],
            required: true,
            items: [
              { value: true, label: 'Áno', isDefault: true },
              { value: false, label: 'Nie' },
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
        items: [
          { value: true, label: 'Áno', isDefault: true },
          { value: false, label: 'Nie' },
        ],
      },
      {
        variant: 'boxed',
        orientations: 'row',
        helptext: {
          [StepType.Ziadatel]: undefined,
          [StepType.ManzelManzelka]:
            'Ak označíte odpoveď "Áno", zobrazia sa vám konkrétne možnosti bývania. Ak sa manžela/manželky žiadna z nich nebude týkať, označte odpoveď "Nie".',
          [StepType.DruhDruzka]:
            'Ak označíte odpoveď "Áno", zobrazia sa vám konkrétne možnosti bývania. Ak sa druha/družky žiadna z nich nebude týkať, označte odpoveď "Nie".',
          [StepType.Dieta]:
            'Ak označíte odpoveď "Áno", zobrazia sa vám konkrétne možnosti bývania. Ak sa nezaopatreného dieťaťa žiadna z nich nebude týkať, označte odpoveď "Nie".',
          [StepType.InyClen]:
            'Ak pri otázke Nachádza sa v bytovej núdzi označíte odpoveď "Áno", zobrazia sa vám konkrétne možnosti bývania. Ak sa člena/členky domácnosti žiadna z nich nebude týkať, označte odpoveď "Nie".',
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
          items: [
            { value: 'ulica', label: 'Bývanie na ulici' },
            {
              value: 'krizoveUbytovanie',
              label: 'Bývanie v krízovom ubytovaní za účelom prenocovania',
            },
            {
              value: 'zariadeniePreLudiVNudzi',
              label: 'Bývanie v zariadení určenom pre ľudí v núdzi',
              description: 'Útulok, azylový dom, Domov na pol ceste',
            },
            {
              value: 'nestatnardneObydlie',
              label: 'Bývanie v neštandardnom obydlí',
              description: 'Mobilné obydlia, chatky, búdy, provizórne stavby',
            },
            {
              value: 'mestskaUbytovna',
              label: 'Bývanie v mestskej ubytovni',
              description: 'Ubytovňa Fortuna, Ubytovňa Kopčany',
            },
            { value: 'komercnaUbytovna', label: 'Bývanie v komerčnej ubytovni' },
            {
              value: 'institucionalnaStarostlivost',
              label: 'Bývanie v inštitucionálnej starostlivosti',
              description:
                stepType === StepType.Dieta
                  ? 'Ústav na výkon väzby a Ústav na výkon trestu odňatia slobody – prepustenie o 3 mesiace a skôr, Centrum pre deti a rodiny, Resocializačné stredisko – prepustenie o 3 mesiace a skôr, Špeciálne výchovné zariadenie'
                  : 'Ústav na výkon väzby a Ústav na výkon trestu odňatia slobody – prepustenie o 3 mesiace a skôr, Centrum pre deti a rodiny, Resocializačné stredisko – prepustenie o 3 mesiace a skôr',
            },
            {
              value: 'neistePodmienky',
              label: 'Bývanie v neistých/nevyhovujúcich podmienkach',
              description:
                'Strata vlastníckych práv, výpoveď z nájmu, obydlie bez elektriny, vody, možnosti kúrenia, bez WC, extrémne preľudnene obydlie, nájom/podnájom bez zmluvy, bývanie u príbuzných/známych, neudržateľnosť nájomnej zmluvy (napr. náhly pokles príjmu)',
            },
          ],
        },
        { variant: 'boxed' },
      ),
      conditionalFields(
        createCondition([[['typByvania'], { const: 'institucionalnaStarostlivost' }]]),
        [
          customComponentsField(
            'institucionalnaStarostlivostAlert',
            {
              type: 'alert',
              props: {
                type: 'info',
                message:
                  'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte dokumenty potvrdzujúce zvolený typ bývania - doklad o budúcom prepustení z ÚVTOS alebo resocializačného zariadenia.',
              },
            },
            {},
          ),
        ],
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
          items: [
            { value: 'menejAko1', label: 'Menej ako 1 rok' },
            { value: '1az2', label: '1 - 2 roky' },
            { value: '3az5', label: '3 - 5 rokov' },
            { value: '6az9', label: '6 - 9 rokov' },
            { value: '10aViac', label: '10 a viac rokov' },
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

  return object('rizikoveFaktory', { title: 'Rizikové faktory', objectDisplay: 'boxed' }, [
    radioGroup(
      'rizikoveFaktoryPritomne',
      {
        type: 'boolean',
        title:
          'Týkajú sa vás alebo niektorého člena/členky vašej domácnosti rizikové faktory, ktoré zvyšujú sociálno-ekonomickú zraniteľnosť?',
        required: true,
        items: [
          { value: true, label: 'Áno', isDefault: true },
          { value: false, label: 'Nie' },
        ],
      },
      { variant: 'boxed', orientations: 'row' },
    ),
    conditionalFields(createCondition([[['rizikoveFaktoryPritomne'], { const: true }]]), [
      checkboxGroup(
        'zoznamRizikovychFaktorov',
        {
          title: 'Označte rizikové faktory',
          items: [
            {
              value: 'osamelyRodic',
              label:
                'Osamelý rodič (dospelá osoba), ktorý/á žije v spoločnej domácnosti s nezaopatreným dieťaťom/deťmi, avšak bez manžela/manželky alebo partnera/partnerky, a zároveň tomuto dieťaťu/deťom zabezpečuje osobnú starostlivosť.',
            },
            {
              value: 'rodicNaDovolenke',
              label: 'Rodič na rodičovskej/materskej/otcovskej dovolenke',
            },
            {
              value: 'moznostNavratuDeti',
              label:
                'Možnosť návratu detí do rodiny z Centra pre detí a rodiny alebo možnosť zlúčenia rodiny, v prípade získania vhodného bývania',
            },
            {
              value: 'opustenieUstavnejStarostlivosti',
              label:
                'Opustenie ústavnej starostlivosti v uplynulých 3 rokoch: Centrum pre deti a rodiny a resocializačné stredisko',
            },
            {
              value: 'opustenieVazby',
              label:
                'Opustenie Ústavu na výkon väzby a Ústavu na výkon trestu odňatia slobody v uplynulých 3 rokoch a skôr',
            },
            {
              value: 'opustenieSpecialnehoZariadenia',
              label:
                'Opustenie špeciálneho výchovného zariadenia v uplynulých 3 rokoch a skôr (Diagnostické centrá, reedukačné centrá, liečebno-výchovné sanatória)',
            },
          ],
          required: true,
        },
        {
          helptext: 'Môžete označiť viac možností.',
          variant: 'boxed',
        },
      ),
    ]),
    radioGroup(
      'vekNajstarsiehoClena',
      {
        type: 'string',
        title: 'Zvoľte vek najstaršieho člena domácnosti',
        required: true,
        items: [
          { value: 'menejAko63', label: 'menej ako 63 rokov' },
          { value: '63az70', label: '63 - 70 rokov' },
          { value: '71az80', label: '71 - 80 rokov' },
          { value: '81aViac', label: '81 a viac rokov' },
        ],
      },
      {
        variant: 'boxed',
        helptext:
          'Vyšší vek jedného z členov domácnosti je považovaný za rizikový faktor. Otázka sa vzťahuje iba na členov domácnosti, s ktorými by ste chceli bývať v mestskom nájomnom byte.',
        belowComponents: [
          {
            type: 'alert',
            props: {
              type: 'info',
              message:
                'V prípade, že vás bude kontaktovať zástupca mesta, na nahliadnutie si pripravte dokumenty dokazujúce uvedené rizikové faktory dokazujúce zvýšenú zraniteľnosť vás alebo iného člena/členky domácnosti. (Napr. rozhodnutie súdu/doklad o prepustení zo zariadenia/doklad od ÚPSVR a pod.)',
            },
          },
        ],
      },
    ),
  ])
}

const getFieldsForStep = (stepType: StepType, ziadatelTzpPreukaz: boolean) => {
  return [
    getOsobneUdajeSection(stepType),
    getSucasneByvanieSection(stepType),
    getPrijemSection(stepType),
    ziadatelTzpPreukaz ? null : getZdravotnyStavSection(stepType),
    getRizikoveFaktorySection(stepType),
  ]
}

export default schema(
  {
    title: 'Žiadosť o nájom bytu',
  },
  [
    step(
      'ziadatelZiadatelka',
      { title: 'Žiadateľ/žiadateľka' },
      getFieldsForStep(StepType.Ziadatel, false),
    ),
    ...getConditionalStep('manzelManzelka', { title: 'Manžel/manželka' }, (ziadatelTzpPreukaz) => [
      radioGroup(
        'manzelManzelkaSucastouDomacnosti',
        {
          type: 'boolean',
          title: 'Bude súčasťou budúcej domácnosti aj váš manžel/manželka?',
          required: true,
          items: [
            { value: true, label: 'Áno' },
            { value: false, label: 'Nie', isDefault: true },
          ],
        },
        { variant: 'boxed', orientations: 'row' },
      ),
      conditionalFields(
        createCondition([[['manzelManzelkaSucastouDomacnosti'], { const: true }]]),
        getFieldsForStep(StepType.ManzelManzelka, ziadatelTzpPreukaz),
      ),
    ]),
    ...getConditionalStep('druhDruzka', { title: 'Druh/družka' }, (ziadatelTzpPreukaz) => [
      radioGroup(
        'druhDruzkaSucastouDomacnosti',
        {
          type: 'boolean',
          title: 'Bude súčasťou budúcej domácnosti aj váš druh/družka?',
          required: true,
          items: [
            { value: true, label: 'Áno' },
            { value: false, label: 'Nie', isDefault: true },
          ],
        },
        { variant: 'boxed', orientations: 'row' },
      ),
      conditionalFields(
        createCondition([[['druhDruzkaSucastouDomacnosti'], { const: true }]]),
        getFieldsForStep(StepType.DruhDruzka, ziadatelTzpPreukaz),
      ),
    ]),
    ...getConditionalStep(
      'deti',
      {
        title: 'Nezaopatrené deti do 25 rokov',
        stepperTitle: 'Nezaopatrené dieťa/deti',
        description: `Nezaopatrené dieťa je dieťa, ktoré:

- má menej ako 25 rokov a zároveň
- navštevuje školu dennou formou štúdia (napr. základná, stredná alebo vysoká škola v dennom štúdiu),
- alebo je v predškolskom veku,
- alebo sa nemôže učiť ani pracovať kvôli vážnej chorobe alebo úrazu (potvrdené lekárom).

**Poznámka: Ak osoba nespĺňa uvedené podmienky, prosím, uveďte ju v ďalšej časti žiadosti „Iní členovia/členky domácnosti“.**`,
        descriptionMarkdown: true,
      },
      (ziadatelTzpPreukaz) => [
        radioGroup(
          'detiSucastouDomacnosti',
          {
            type: 'boolean',
            title: 'Bude súčasťou budúcej domácnosti aj vaše nezaopatrené dieťa/deti?',
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
            getFieldsForStep(StepType.Dieta, ziadatelTzpPreukaz),
          ),
        ]),
      ],
    ),
    ...getConditionalStep(
      'inyClenoviaClenkyDomacnosti',
      { title: 'Iní členovia/členky domácnosti' },
      (ziadatelTzpPreukaz) => [
        radioGroup(
          'inyClenoviaClenkySucastouDomacnosti',
          {
            type: 'boolean',
            title:
              'Budú súčasťou budúcej domácnosti aj iní členovia/členky? (zaopatrené deti, starí rodičia a pod.)',
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
              getFieldsForStep(StepType.InyClen, ziadatelTzpPreukaz),
            ),
          ],
        ),
      ],
    ),
    step('ineOkolnosti', { title: 'Iné okolnosti' }, [
      textArea(
        'dovodyPodaniaZiadosti',
        { title: 'Prečo si podávate žiadosť?' },
        {
          helptext:
            'Priestor pre vyjadrenie akýchkoľvek informácií, ktoré si myslíte, že by sme mali vedieť, ale neboli súčasťou otázok.',
        },
      ),
      select(
        'preferovanaVelkost',
        {
          title: 'Akú veľkosť nájomného bytu preferujete?',
          required: true,
          items: [
            { value: 'garsonka1izbovy', label: 'garsónka/1-izbový byt' },
            { value: '2izbovy', label: '2-izbový byt' },
            { value: '3izbovy', label: '3-izbový byt' },
            { value: '4izbovy', label: '4-izbový byt' },
          ],
        },
        {},
      ),
      radioGroup(
        'maPreferovanuLokalitu',
        {
          type: 'boolean',
          title: 'Máte preferovanú lokalitu nájomného bytu (mestskú časť)?',
          required: true,
          items: [
            { value: true, label: 'Áno' },
            { value: false, label: 'Nie', isDefault: false },
          ],
        },
        {
          variant: 'boxed',
          orientations: 'row',
        },
      ),
      conditionalFields(createCondition([[['maPreferovanuLokalitu'], { const: true }]]), [
        selectMultiple(
          'preferovanaLokalita',
          {
            title: 'Aká je vaša preferovaná lokalita?',
            required: true,
            items: [
              { value: 'stareMesto', label: 'Staré Mesto' },
              { value: 'ruzinov', label: 'Ružinov' },
              { value: 'vrakuna', label: 'Vrakuňa' },
              { value: 'podunajskeBiskupice', label: 'Podunajské Biskupice' },
              { value: 'noveMesto', label: 'Nové Mesto' },
              { value: 'karlovaVes', label: 'Karlova Ves' },
              { value: 'dubravka', label: 'Dúbravka' },
              { value: 'petrzalka', label: 'Petržalka' },
            ],
          },
          {},
        ),
      ]),
      number(
        'maximalnaVyskaNajomneho',
        {
          title:
            'Uveďte, prosím, maximálnu výšku nájomného (vrátane energií), ktorú dokážete mesačne platiť',
          type: 'number',
          step: 0.01,
          required: true,
          minimum: 0,
        },
        { leftIcon: 'euro', size: 'medium' },
      ),
    ]),
    step('sucetPrijmovCestneVyhlasenie', { title: 'Súčet príjmov a čestné výhlásenie' }, [
      customComponentsField(
        'sucetPrijmovKalkulacka',
        {
          type: 'calculator',
          props: {
            variant: 'white',
            calculators: [
              {
                label: 'Celkový čistý mesačný príjem budúcej domácnosti',
                formula: `calculateZamestnaniePrijemSum(prijem) = prijem.zamestnanie ? prijem.zamestnaniePrijem : 0;
calculateSamostatnaZarobkovaCinnostPrijemSum(prijem) = prijem.samostatnaZarobkovaCinnost ? prijem.samostatnaZarobkovaCinnostPrijem : 0;
calculateDochodokSum(prijem) = prijem.dochodok ? prijem.dochodokVyska : 0;
calculateVyzivneSum(prijem) = prijem.vyzivne ? prijem.vyzivneVyska : 0;
calculateDavkaVNezamestnanostiSum(prijem) = prijem.davkaVNezamestnanosti ? prijem.davkaVNezamestnanostiVyska : 0;
calculateInePrijmySum(prijem) = prijem.inePrijmy ? prijem.inePrijmyVyska : 0;

calculatePrijem(prijem) = calculateZamestnaniePrijemSum(prijem) + calculateSamostatnaZarobkovaCinnostPrijemSum(prijem) + calculateDochodokSum(prijem) + calculateVyzivneSum(prijem) + calculateDavkaVNezamestnanostiSum(prijem) + calculateInePrijmySum(prijem);

calculateDietaPrijem(dieta) = dieta.prijem.maPrijem ? dieta.prijem.prijemVyska : 0;
sum(a, b) = a + b;
calculateDetiPrijem(deti) = deti.detiSucastouDomacnosti ? fold(sum, 0, map(calculateDietaPrijem, deti.zoznamDeti)) : 0;

calculateClenPrijem(clen) = calculatePrijem(clen.prijem);
calculateInychClenovPrijmy(inyClenoviaClenkyDomacnosti) = inyClenoviaClenkyDomacnosti.inyClenoviaClenkySucastouDomacnosti ? fold(sum, 0, map(calculateClenPrijem, inyClenoviaClenkyDomacnosti.zoznamInychClenov)) : 0;

ziadatelPrijem = calculatePrijem(ziadatelZiadatelka.prijem);
manzelManzelkaPrijem = manzelManzelka.manzelManzelkaSucastouDomacnosti ? calculatePrijem(manzelManzelka.prijem) : 0;
druhDruzkaPrijem = druhDruzka.druhDruzkaSucastouDomacnosti ? calculatePrijem(druhDruzka.prijem) : 0;
detiPrijmy = calculateDetiPrijem(deti);
inyClenoviaPrijmy = calculateInychClenovPrijmy(inyClenoviaClenkyDomacnosti);

ziadatelPrijem + manzelManzelkaPrijem + druhDruzkaPrijem + detiPrijmy + inyClenoviaPrijmy`,
                missingFieldsMessage:
                  'Pre zobrazenie celkového čistého mesačného príjmu budúcej domácnosti je potrebné vyplniť správne všetky príjmy.',
                unit: '€',
                dataContextLevelsUp: 1,
              },
            ],
          },
        },
        {},
      ),
      customComponentsField(
        'prijemAlert',
        {
          type: 'alert',
          props: {
            type: 'info',
            message:
              'Overte si, či váš celkový čistý mesačný príjem budúcej domácnosti spĺňa podmienky. Celkový príjem nemôže prekročiť  štvornásobok, resp. päťnásobok aktuálneho životného minima.',
          },
        },
        {},
      ),
      customComponentsField(
        'overitPrijemLink',
        {
          type: 'additionalLinks',
          props: {
            links: [
              {
                title: 'Overiť príjem',
                href: 'https://cdn-api.bratislava.sk/strapi-homepage/upload/Tabulka_zivotne_minimum_2024_25970f264b.pdf',
              },
            ],
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
            'Čestne vyhlasujem, že všetky údaje uvedené v žiadosti a dokumentoch na nahliadnutie sú pravdivé a úplné. Zároveň som si vedomý/á toho, že poskytnutie nepravdivých a/alebo neúplných informácií môže mať za následok nezaradenie žiadosti do evidencie žiadateľov.',
          variant: 'boxed',
        },
      ),
    ]),
  ],
)

export const ziadostONajomBytuAdditionalInfoTemplate = `### Zoznam potrebných dokumentov
<% let maPrijem = (prijem) => it.helpers.safeBoolean(prijem?.zamestnanie) || it.helpers.safeBoolean(prijem?.samostatnaZarobkovaCinnost) || it.helpers.safeBoolean(prijem?.dochodok) || it.helpers.safeBoolean(prijem?.vyzivne) || it.helpers.safeBoolean(prijem?.davkaVNezamestnanosti) || it.helpers.safeBoolean(prijem?.inePrijmy) %>
<% let dokladRodinnyStav = (osobneUdaje) => it.helpers.safeString(osobneUdaje?.rodinnyStav) && ['zenaty', 'rozvedeny', 'vdovec', 'ine'].includes(osobneUdaje?.rodinnyStav) %>
<% let maRizikovyFaktorVyzadujuciDoklad = (rizikoveFaktory) => {
  const zoznam = it.helpers.safeArray(rizikoveFaktory?.zoznamRizikovychFaktorov);
  return zoznam.includes('opustenieUstavnejStarostlivosti') || zoznam.includes('opustenieVazby') || zoznam.includes('opustenieSpecialnehoZariadenia');
} %>
<% let getRizikoveFaktoryDokumentyArray = (rizikoveFaktory) => {
  const dokumenty = [];
  const zoznam = it.helpers.safeArray(rizikoveFaktory?.zoznamRizikovychFaktorov);
  
  if (zoznam.includes('opustenieUstavnejStarostlivosti')) {
    dokumenty.push('prepúšťacia správa zo zariadenia ústavnej starostlivosti');
  }
  if (zoznam.includes('opustenieVazby')) {
    dokumenty.push('rozhodnutie/doklad o prepustení z Ústavu na výkon väzby a Ústavu na výkon trestu odňatia slobody alebo resocializačného zariadenia v uplynulých 3 rokoch');
  }
  if (zoznam.includes('opustenieSpecialnehoZariadenia')) {
    dokumenty.push('doklad o opustení špeciálneho výchovného zariadenia v uplynulých 3 rokoch, iba v prípade dobrovoľného pobytu');
  }
  return dokumenty;
} %>

#### Žiadateľ/žiadateľka

- Osobné údaje - občiansky preukaz
<% if (dokladRodinnyStav(it.formData.ziadatelZiadatelka?.osobneUdaje)) { %>
- Osobné údaje - rozsudok o rozvode, sobášny list alebo iný doklad dokazujúci rodinný stav
<% } %>
<% if (it.helpers.safeBoolean(it.formData.ziadatelZiadatelka?.osobneUdaje?.adresaTrvalehoPobytu?.pobytVBratislaveViacAkoRok)) { %>
- Adresa - dokumenty potvrdujúce pôsobenie v Bratislave, napr. pracovnú zmluvu, nájomnú zmluvu, potvrdenie o návšteve školy, potvrdenie z ubytovne, nocľahárne, potvrdenie sociálneho pracovníka o kontakte s klientom a pod.
<% } %>
<% if (it.helpers.safeBoolean(it.formData.ziadatelZiadatelka?.osobneUdaje?.adresaTrvalehoPobytu?.vlastnikNehnutelnosti)) { %>
- Adresa - list vlastníctva
<% } %>
<% if (it.helpers.safeString(it.formData.ziadatelZiadatelka?.sucasneByvanie?.typByvania) === 'institucionalnaStarostlivost') { %>
- Súčasné bývanie - doklad o budúcom prepustení z ÚVTOS alebo resocializačného zariadenia
<% } %>
<% if (maPrijem(it.formData.ziadatelZiadatelka?.prijem)) { %>
- Príjem - dokumenty dokazujúce všetky príjmy, napr. doklad od zamestnávateľa, potvrdenie z daňového úradu, potvrdenie o výške dôchodku, doklad o poberaní prídavkov na dieťa/deti, o poberaní materského, rodičovský príspevok, doklad o určení výšky výživného a pod.
<% } %>
<% if (it.helpers.safeBoolean(it.formData.ziadatelZiadatelka?.zdravotnyStav?.tzpPreukaz) || it.helpers.safeBoolean(it.formData.ziadatelZiadatelka?.zdravotnyStav?.chronickeOchorenie)) { %>
- Zdravotný stav - dokumenty dokazujúce zdravotný stav, napr. potvrdenie o chronickom ochorení od ošetrujúceho lekára
<% } %>
<% if (maRizikovyFaktorVyzadujuciDoklad(it.formData.ziadatelZiadatelka?.rizikoveFaktory)) { %>
- Rizikové faktory - <%= getRizikoveFaktoryDokumentyArray(it.formData.ziadatelZiadatelka?.rizikoveFaktory).join(', ') %>
<% } %>

<% if (it.helpers.safeBoolean(it.formData.manzelManzelka?.manzelManzelkaSucastouDomacnosti)) { %>
#### Manžel/manželka

- Osobné údaje - kópia občianskeho preukazu
- Osobné údaje - sobášny list
<% if (it.helpers.safeBoolean(it.formData.manzelManzelka?.osobneUdaje?.adresaSkutocnehoPobytu?.vlastnikNehnutelnosti)) { %>
- Adresa - list vlastníctva
<% } %>
<% if (!it.helpers.safeBoolean(it.formData.manzelManzelka?.situaciaRovnakaAkoVasa) && it.helpers.safeString(it.formData.manzelManzelka?.sucasneByvanie?.typByvania) === 'institucionalnaStarostlivost') { %>
- Súčasné bývanie - doklad o budúcom prepustení z ÚVTOS alebo resocializačného zariadenia
<% } %>
<% if (maPrijem(it.formData.manzelManzelka?.prijem)) { %>
- Príjem - dokumenty dokazujúce všetky príjmy manžela/manželky, napr. doklad od zamestnávateľa, potvrdenie z daňového úradu, potvrdenie o výške dôchodku, doklad o poberaní prídavkov na dieťa/deti, o poberaní materského, rodičovský príspevok, doklad o určení výšky výživného a pod.
<% } %>
<% if (it.helpers.safeBoolean(it.formData.manzelManzelka?.zdravotnyStav?.chronickeOchorenie)) { %>
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
<% if (!it.helpers.safeBoolean(it.formData.druhDruzka?.situaciaRovnakaAkoVasa) && it.helpers.safeString(it.formData.druhDruzka?.sucasneByvanie?.typByvania) === 'institucionalnaStarostlivost') { %>
- Súčasné bývanie - doklad o budúcom prepustení z ÚVTOS alebo resocializačného zariadenia
<% } %>
<% if (maPrijem(it.formData.druhDruzka?.prijem)) { %>
- Príjem - dokumenty dokazujúce všetky príjmy druha/družky, napr. doklad od zamestnávateľa, potvrdenie z daňového úradu, potvrdenie o výške dôchodku, doklad o poberaní prídavkov na dieťa/deti, o poberaní materského, rodičovský príspevok, doklad o určení výšky výživného a pod.
<% } %>
<% if (it.helpers.safeBoolean(it.formData.druhDruzka?.zdravotnyStav?.chronickeOchorenie)) { %>
- Zdravotný stav - dokumenty dokazujúce zdravotný stav druha/družky, napr. potvrdenie o chronickom ochorení od ošetrujúceho lekára
<% } %>
<% } %>

<% if (it.helpers.safeBoolean(it.formData.deti?.detiSucastouDomacnosti)) { %>
#### Nezaopatrené deti do 25 rokov

<% it.helpers.safeArray(it.formData.deti.zoznamDeti).forEach(function(dieta, index) { %>
<% let dietaName = [dieta.osobneUdaje?.meno, dieta.osobneUdaje?.priezvisko].filter(Boolean).join(' ') %>
##### Dieťa č. <%= index + 1 %><% if (dietaName) { %> (<%= dietaName %>)<% } %>

- Osobné údaje - kópia rodného listu dieťaťa, resp. kópia občianskeho preukazu, ak už dieťa dovŕšilo vek 15 rokov
<% if (it.helpers.safeBoolean(dieta.osobneUdaje?.vlastnikNehnutelnosti)) { %>
- Adresa - list vlastníctva
<% } %>
<% if (!it.helpers.safeBoolean(dieta.situaciaRovnakaAkoVasa) && it.helpers.safeString(dieta.sucasneByvanie?.typByvania) === 'institucionalnaStarostlivost') { %>
- Súčasné bývanie - doklad o budúcom prepustení z ÚVTOS alebo resocializačného zariadenia
<% } %>
<% if (it.helpers.safeBoolean(dieta.prijem?.student)) { %>
- Príjem - potvrdenie o návšteve školy
<% } %>
<% if (it.helpers.safeBoolean(dieta.prijem?.maPrijem)) { %>
- Príjem - potvrdenie o príjme dieťaťa
<% } %>
<% if (it.helpers.safeBoolean(dieta.zdravotnyStav?.chronickeOchorenie)) { %>
- Zdravotný stav - dokumenty dokazujúce uvedený zdravotný stav dieťaťa, napr. potvrdenie o chronickom ochorení od ošetrujúceho lekára
<% } %>
<% }) %>
<% } %>

<% if (it.helpers.safeBoolean(it.formData.inyClenoviaClenkyDomacnosti?.inyClenoviaClenkySucastouDomacnosti)) { %>
#### Iní členovia/členky domácnosti

<% it.helpers.safeArray(it.formData.inyClenoviaClenkyDomacnosti.zoznamInychClenov).forEach(function(clen, index) { %>
<% let clenName = [clen.osobneUdaje?.meno, clen.osobneUdaje?.priezvisko].filter(Boolean).join(' ') %>
##### Člen/členka domácnosti č. <%= index + 1 %><% if (clenName) { %> (<%= clenName %>)<% } %>

- Osobné údaje - kópia občianskeho preukazu
<% if (dokladRodinnyStav(clen.osobneUdaje)) { %>
- Osobné údaje - doklad dokazujúci rodinný stav člena/členky domácnosti
<% } %>
<% if (it.helpers.safeBoolean(clen.osobneUdaje?.vlastnikNehnutelnosti)) { %>
- Adresa - list vlastníctva
<% } %>
<% if (!it.helpers.safeBoolean(clen.situaciaRovnakaAkoVasa) && it.helpers.safeString(clen.sucasneByvanie?.typByvania) === 'institucionalnaStarostlivost') { %>
- Súčasné bývanie - doklad o budúcom prepustení z ÚVTOS alebo resocializačného zariadenia
<% } %>
<% if (maPrijem(clen.prijem)) { %>
- Príjem - dokumenty dokazujúce všetky príjmy člena/členky domácnosti, napr. doklad od zamestnávateľa, potvrdenie z daňového úradu, potvrdenie o výške dôchodku, doklad o poberaní prídavkov na dieťa/deti, o poberaní materského, rodičovský príspevok, doklad o určení výšky výživného a pod.
<% } %>
<% if (it.helpers.safeBoolean(clen.zdravotnyStav?.chronickeOchorenie)) { %>
- Zdravotný stav - dokumenty dokazujúce zdravotný stav člena/členky domácnosti, napr. potvrdenie o chronickom ochorení od ošetrujúceho lekára
<% } %>
<% }) %>
<% } %>`

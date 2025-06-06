import { createCondition } from '../../generator/helpers'
import { kalkulackaFields } from './kalkulacky'
import { stavbyBase } from './stavbyBase'
import { StepEnum } from './stepEnum'
import { vyplnitKrokRadio } from './vyplnitKrokRadio'
import { oddiel4ZakladDaneFormula } from '../../tax-form/formulas'
import { input } from '../../generator/functions/input'
import { number } from '../../generator/functions/number'
import { radioGroup } from '../../generator/functions/radioGroup'
import { datePicker } from '../../generator/functions/datePicker'
import { customComponentsField } from '../../generator/functions/customComponentsField'
import { object } from '../../generator/object'
import { arrayField } from '../../generator/functions/arrayField'
import { step } from '../../generator/functions/step'
import { conditionalFields } from '../../generator/functions/conditionalFields'

enum Typ {
  Byt,
  NebytovyPriestor,
}

const specialCaseCondition = createCondition([
  [
    ['podielPriestoruNaSpolocnychCastiachAZariadeniachDomu'],
    {
      type: 'string',
      format: 'ba-ratio',
      // The regex itself doesn't validate all the requirements for ratio, but works as an addition to the
      // format: 'ba-ratio' validation to ensure that the denominator is a number starting with 1-9 followed
      // by 3 or more zeroes.
      pattern: '^\\d+\\/([1-9]0{3,})$',
    },
  ],
])

const vymeraPodlahovejPlochyBytu = number(
  'vymeraPodlahovejPlochyBytu',
  {
    type: 'integer',
    title: 'Výmera podlahovej plochy bytu (základ dane bytu)',
    required: true,
    minimum: 0,
  },
  {
    helptextFooter: 'Zadávajte číslo zaokrúhlené nahor (napr. ak 12.3 m^2^, tak zadajte 13).',
    helptextFooterMarkdown: true,
  },
)

const celkovaVymeraSpecialCase = (typ: Typ) =>
  number(
    'celkovaVymeraSpecialCase',
    {
      type: 'integer',
      title:
        typ === Typ.Byt
          ? 'Celková výmera podlahovej plochy vášho bytu'
          : 'Celková výmera podlahovej plochy vášho nebytového priestoru',
      required: true,
      minimum: 0,
    },
    {
      helptextFooter:
        'Ak má číslo za lomkou vo vašom podiele priestoru na spoločných častiach hodnotu, napríklad, 1 000, 10 000, alebo 100 000, údaj z listu vlastníctva vám nepomôže. Správne údaje o podlahovej ploche nájdete v kúpnej zmluve alebo znaleckom posudku (celková podlahová plocha okrem balkónov, lodžií a terás).',
    },
  )

const vymeraKalkulacka = customComponentsField(
  'vymeraKalkulacka',
  {
    type: 'calculator',
    props: {
      variant: 'black',
      calculators: [
        {
          label: 'Základ dane',
          formula: oddiel4ZakladDaneFormula,
          missingFieldsMessage:
            '**Pre výpočet základu dane vyplňte správne všetky polia:**\n' +
            '- Podiel priestoru na spoločných častiach a zariadeniach domu\n' +
            '- Spoluvlastnícky podiel',
          unit: 'm^2^',
          unitMarkdown: true,
        },
      ],
    },
  },
  {},
)

const podielPriestoruNaSpolocnychCastiachAZariadeniachDomu = (typ: Typ) =>
  input(
    'podielPriestoruNaSpolocnychCastiachAZariadeniachDomu',
    {
      type: 'ba-ratio',
      title: 'Podiel priestoru na spoločných častiach a zariadeniach domu',
      required: true,
    },
    {
      placeholder: typ === Typ.Byt ? 'Napr. 4827/624441' : 'Napr. 124827/624441',
      helptextFooter:
        typ === Typ.Byt
          ? 'Zadávajte celý zlomok. Nájdete ho vedľa údajov o vchode, poschodí a čísle bytu. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/6_byt_podiel_priestoru_265f9a3965.png"}'
          : 'Zadávajte celý zlomok. Nájdete ho vedľa údajov o vchode, poschodí a čísle priestoru. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/6_nebytovypriestor_podiel_priestoru_86f78e3c99.png"}',
      helptextFooterMarkdown: true,
    },
  )

const spoluvlastnickyPodiel = (typ: Typ) =>
  input(
    'spoluvlastnickyPodiel',
    { type: 'ba-ratio', title: 'Spoluvlastnícky podiel', required: true },
    {
      placeholder: 'Napr. 1/150',
      helptextFooter:
        typ === Typ.Byt
          ? 'Zadávajte celý zlomok. Nájdete ho vedľa údajov o mene vlastníkov. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/6_byt_spoluvlastnicky_podiel_cf4b72f71b.png"}'
          : 'Zadávajte celý zlomok. Nájdete ho vedľa údajov o mene vlastníkov. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/6_nebytovypriestor_spoluvlastnicky_podiel_79034be7a6.png"}',
      helptextFooterMarkdown: true,
    },
  )

const vymeraPodlahovychPlochNebytovehoPriestoruVBytovomDome = number(
  'vymeraPodlahovychPlochNebytovehoPriestoruVBytovomDome',
  {
    type: 'integer',
    title: 'Výmera podlahových plôch nebytového priestoru v bytovom dome',
    required: true,
    minimum: 0,
  },
  {
    helptextFooter: 'Zadávajte číslo zaokrúhlené nahor na celé číslo (príklad: 48,27 = 49).',
  },
)

const innerArray = (kalkulacka: boolean) =>
  arrayField(
    'priznania',
    { title: 'Priznania k dani z bytov a z nebytových priestorov v bytovom dome', required: true },
    {
      hideTitle: true,
      variant: 'topLevel',
      addTitle: 'Podávate priznanie aj za ďalší byt alebo nebytový priestor v inom bytovom dome?',
      addDescription:
        'V prípade, že podávate priznanie aj za ďalší byt, alebo iný nebytový priestor, je potrebné pridať ďalšie priznanie.',
      addButtonLabel: 'Pridať ďalšie priznanie',
      itemTitle: 'Priznanie k dani z bytov a z nebytových priestorov v bytovom dome č. {index}',
    },
    [
      ...stavbyBase(StepEnum.DanZBytovANebytovychPriestorov),
      object(
        'priznanieZaByt',
        {
          objectDisplay: 'boxed',
        },
        [
          radioGroup(
            'priznanieZaByt',
            {
              type: 'boolean',
              title: 'Podávate priznanie za byt?',
              required: true,
              items: [
                { value: true, label: 'Áno' },
                { value: false, label: 'Nie', isDefault: false },
              ],
            },
            {
              variant: 'boxed',
              orientations: 'row',
              labelSize: 'h4',
            },
          ),
          conditionalFields(createCondition([[['priznanieZaByt'], { const: true }]]), [
            input('cisloBytu', { type: 'text', title: 'Číslo bytu', required: true }, {}),
            input(
              'popisBytu',
              { type: 'text', title: 'Popis bytu' },
              { helptextFooter: 'Stručný popis bytu.', placeholder: 'Napr. dvojizbový byt' },
            ),
            ...(kalkulacka
              ? [
                  podielPriestoruNaSpolocnychCastiachAZariadeniachDomu(Typ.Byt),
                  conditionalFields(specialCaseCondition, [celkovaVymeraSpecialCase(Typ.Byt)]),
                  spoluvlastnickyPodiel(Typ.Byt),
                  vymeraKalkulacka,
                ]
              : [vymeraPodlahovejPlochyBytu]),
            number(
              'vymeraPodlahovejPlochyNaIneUcely',
              {
                type: 'integer',
                title: 'Výmera podlahovej plochy bytu používaného na iné účely',
                minimum: 0,
              },
              {
                helptextFooter:
                  'Vyplňte v prípade, ak používate časť bytu napríklad na podnikateľské účely. Zadajte výmeru.',
              },
            ),
            object('datumy', {}, [
              datePicker(
                'datumVznikuDanovejPovinnosti',
                { title: 'Dátum vzniku daňovej povinnosti' },
                {
                  selfColumn: '2/4',
                  helptextFooter:
                    'Vypĺňate len v prípade, ak ste byt zdedili alebo vydražili (v tom prípade uvediete prvý deň mesiaca nasledujúceho po tom, v ktorom ste nehnuteľnosť nadobudli).',
                },
              ),
              datePicker(
                'datumZanikuDanovejPovinnosti',
                { title: 'Dátum zániku daňovej povinnosti' },
                {
                  selfColumn: '2/4',
                  helptextFooter:
                    'Vypĺňate len v prípade, ak ste byt predali alebo darovali (uvediete dátum 31.12.rok predaja/darovania).',
                },
              ),
            ]),
          ]),
        ],
      ),
      object(
        'priznanieZaNebytovyPriestor',
        {
          objectDisplay: 'boxed',
        },
        [
          radioGroup(
            'priznanieZaNebytovyPriestor',
            {
              type: 'boolean',
              title:
                'Podávate priznanie za nebytový priestor (napr. garážové státie, pivnica, obchodný priestor a pod.)?',
              required: true,
              items: [
                { value: true, label: 'Áno' },
                { value: false, label: 'Nie', isDefault: true },
              ],
            },
            {
              variant: 'boxed',
              orientations: 'row',
              labelSize: 'h4',
            },
          ),
          conditionalFields(createCondition([[['priznanieZaNebytovyPriestor'], { const: true }]]), [
            arrayField(
              'nebytovePriestory',
              { title: 'Nebytové priestory', required: true, maxItems: 15 },
              {
                hideTitle: true,
                variant: 'nested',
                addButtonLabel: 'Pridať ďalší nebytový priestor v tom istom bytovom dome',
                itemTitle: 'Nebytový priestor č. {index}',
                cannotAddItemMessage:
                  'Dosiahli ste maximálny počet nebytových pozemkov (15) na jedno priznanie. Pridajte ďalšie priznanie.',
              },
              [
                object('riadok', {}, [
                  input(
                    'ucelVyuzitiaNebytovehoPriestoruVBytovomDome',
                    {
                      type: 'text',
                      title: 'Účel využitia nebytového priestoru v bytovom dome',
                      required: true,
                    },
                    {
                      selfColumn: '2/4',
                      helptextFooter: 'Napr. garážovanie, skladovanie, podnikanie alebo iné.',
                    },
                  ),
                  input(
                    'cisloNebytovehoPriestoruVBytovomDome',
                    {
                      type: 'text',
                      title: 'Číslo nebytového priestoru v bytovom dome',
                      required: true,
                    },
                    {
                      selfColumn: '2/4',
                      helptextFooter:
                        'Napr. číslo parkovacieho státia alebo pivničnej kobky (malo by byť uvedené aj na LV). :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/6_nebytovypriestor_cislo_3d64bba380.png"}',
                      helptextFooterMarkdown: true,
                    },
                  ),
                ]),
                ...(kalkulacka
                  ? [
                      podielPriestoruNaSpolocnychCastiachAZariadeniachDomu(Typ.NebytovyPriestor),
                      conditionalFields(specialCaseCondition, [
                        celkovaVymeraSpecialCase(Typ.NebytovyPriestor),
                      ]),
                      spoluvlastnickyPodiel(Typ.NebytovyPriestor),
                      vymeraKalkulacka,
                    ]
                  : [vymeraPodlahovychPlochNebytovehoPriestoruVBytovomDome]),
                object('datumy', {}, [
                  datePicker(
                    'datumVznikuDanovejPovinnosti',
                    { title: 'Dátum vzniku daňovej povinnosti' },
                    {
                      selfColumn: '2/4',
                      helptextFooter:
                        'Vypĺňate len v prípade, ak ste nebytový priestor zdedili alebo vydražili (v tom prípade uvediete prvý deň mesiaca nasledujúceho po tom, v ktorom ste nehnuteľnosť nadobudli).',
                    },
                  ),
                  datePicker(
                    'datumZanikuDanovejPovinnosti',
                    { title: 'Dátum zániku daňovej povinnosti' },
                    {
                      selfColumn: '2/4',
                      helptextFooter:
                        'Vypĺňate len v prípade, ak ste nebytový priestor predali alebo darovali (uvediete dátum 31.12.rok predaja/darovania).',
                    },
                  ),
                ]),
              ],
            ),
          ]),
        ],
      ),
      input(
        'poznamka',
        { type: 'text', title: 'Poznámka' },
        { placeholder: 'Tu môžete napísať doplnkové informácie' },
      ),
    ],
  )

export default step(
  'danZBytovANebytovychPriestorov',
  {
    title: 'Priznanie k dani z bytov a z nebytových priestorov v bytovom dome',
    stepperTitle: 'Daň z bytov a z nebytových priestorov (v bytovom dome)',
  },
  vyplnitKrokRadio({
    title: 'Chcete podať daňové priznanie k dani z bytov a z nebytových priestorov v bytovom dome?',
    helptext: `K úspešnému vyplneniu oddielu potrebujete list vlastníctva (LV) k jednotlivým priestorom. Ide o tú časť LV, kde máte nadpis “Byty a nebytové priestory” v časti “ČASŤ B: VLASTNÍCI A INÉ OPRÁVNENÉ OSOBY Z PRÁVA K NEHNUTEĽNOSTI”.\n\nV prípade, že sa vás daň z bytov a z nebytových priestorov netýka, túto časť preskočte.\n\n:form-image-preview[Zobraziť ukážku LV k bytovému domu]{src="https://cdn-api.bratislava.sk/general-strapi/upload/6_priznanie_f168d61548.png"}`,
    helptextMarkdown: true,
    fields: kalkulackaFields({
      title: 'Kalkulačka výpočtu výmery podlahových plôch bytov a nebytových priestorov',
      helptext:
        'Zjednodušili sme pre vás výpočet. Stačí ak zadáte dva údaje z LV a výmery podlahových plôch vypočítame za vás.',
      checkboxLabel: 'Chcem pomôcť s výpočtom a použiť kalkulačku výmery podlahových plôch',
      inner: innerArray,
    }),
  }),
)

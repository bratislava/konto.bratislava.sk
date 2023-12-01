import {
  arrayField,
  conditionalFields,
  customComponentsField,
  datePicker,
  input,
  markdownText,
  number,
  object,
  radioGroup,
  skipSchema,
  step,
  textArea,
} from '../../generator/functions'
import { createCondition } from '../../generator/helpers'
import { kalkulackaFields } from './kalkulacky'
import { stavbyBase } from './stavbyBase'
import { StepEnum } from './stepEnum'
import { vyplnitKrokRadio } from './vyplnitKrokRadio'

const vymeraPodlahovejPlochyBytu = number(
  'vymeraPodlahovejPlochyBytu',
  {
    type: 'integer',
    title: 'Výmera podlahovej plochy bytu (základ dane bytu)',
    required: true,
  },
  {
    helptext: markdownText(
      'Zadávajte číslo zaokrúhlené nahor (napr. ak 12.3 m^2^, tak zadajte 13).',
    ),
  },
)

const vymeraKalkulacka = customComponentsField(
  {
    type: 'propertyTaxCalculator',
    props: {
      variant: 'black',
      calculators: [
        {
          label: 'Základ dane',
          formula:
            'ceil (ratioNumerator(podielPriestoruNaSpolocnychCastiachAZariadeniachDomu) * evalRatio(spoluvlastnickyPodiel) / 100)',
          missingFieldsMessage: 'Pre výpočet základu dane vyplňte všetky polia.',
          unit: markdownText('m^2^'),
        },
      ],
    },
  },
  {},
)

const podielPriestoruNaSpolocnychCastiachAZariadeniachDomu = input(
  'podielPriestoruNaSpolocnychCastiachAZariadeniachDomu',
  {
    title: 'Podiel priestoru na spoločných častiach a zariadeniach domu',
    required: true,
    format: 'ratio',
  },
  {
    placeholder: 'Napr. 4827/624441',
    helptext: markdownText(
      'Zadávajte celý zlomok. Nájdete ho vedľa údajov o vchode, poschodí a čísle bytu. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/test_d7881242ec.svg"}',
    ),
  },
)

const spoluvlastnickyPodiel = input(
  'spoluvlastnickyPodiel',
  { title: 'Spoluvlastnícky podiel', required: true, format: 'ratio' },
  {
    placeholder: 'Napr. 1/1 alebo 1/105',
    helptext: markdownText(
      'Zadávajte celý zlomok. Nájdete ho vedľa údajov o mene vlastníkov. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/test_d7881242ec.svg"}',
    ),
  },
)

const vymeraPodlahovychPlochNebytovehoPriestoruVBytovomDome = number(
  'vymeraPodlahovychPlochNebytovehoPriestoruVBytovomDome',
  {
    type: 'integer',
    title: 'Výmera podlahových plôch nebytového priestoru v bytovom dome',
    required: true,
  },
  {
    helptext: 'Zadávajte číslo zaokrúhlené nahor na celé číslo (príklad: 48,27 = 49).',
  },
)

const innerArray = (kalkulacka: boolean) =>
  arrayField(
    'stavby',
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
        {},
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
              options: [
                { value: true, title: 'Áno' },
                { value: false, title: 'Nie', isDefault: false },
              ],
            },
            {
              variant: 'boxed',
              orientations: 'row',
              labelSize: 'h4',
            },
          ),
          conditionalFields(createCondition([[['priznanieZaByt'], { const: true }]]), [
            kalkulacka
              ? podielPriestoruNaSpolocnychCastiachAZariadeniachDomu
              : skipSchema(podielPriestoruNaSpolocnychCastiachAZariadeniachDomu),
            kalkulacka ? spoluvlastnickyPodiel : skipSchema(spoluvlastnickyPodiel),
            kalkulacka ? vymeraKalkulacka : skipSchema(vymeraKalkulacka),
            kalkulacka ? skipSchema(vymeraPodlahovejPlochyBytu) : vymeraPodlahovejPlochyBytu,
            number(
              'vymeraPodlahovejPlochyNaIneUcely',
              {
                type: 'integer',
                title: 'Výmera podlahovej plochy bytu používaného na iné účely',
              },
              {
                helptext:
                  'Vyplňte v prípade, ak používate časť bytu napríklad na podnikateľské účely. Zadajte výmeru.',
              },
            ),
          ]),
        ],
      ),
      object(
        'priznanieZaNebytovyPriestor',
        {},
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
              options: [
                { value: true, title: 'Áno' },
                { value: false, title: 'Nie', isDefault: true },
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
              { title: 'Nebytové priestory', required: true },
              {
                hideTitle: true,
                variant: 'nested',
                addButtonLabel: 'Pridať ďalší nebytový priestor v tom istom bytovom dome',
                itemTitle: 'Nebytový priestor č. {index}',
              },
              [
                object(
                  'riadok',
                  {},
                  {
                    objectDisplay: 'columns',
                    objectColumnRatio: '1/1',
                  },
                  [
                    input(
                      'ucelVyuzitiaNebytovehoPriestoruVBytovomDome',
                      {
                        title: 'Účel využitia nebytového priestoru v bytovom dome',
                        required: true,
                      },
                      {
                        helptext: 'Napr. garážovanie, skladovanie, podnikanie alebo iné.',
                      },
                    ),
                    input(
                      'cisloNebytovehoPriestoruVBytovomDome',
                      { title: 'Číslo nebytového priestoru v bytovom dome', required: true },
                      {
                        helptext:
                          'Napr. číslo parkovacieho státia alebo pivničnej kobky (malo by byť uvedené aj na LV).',
                      },
                    ),
                  ],
                ),
                kalkulacka
                  ? podielPriestoruNaSpolocnychCastiachAZariadeniachDomu
                  : skipSchema(podielPriestoruNaSpolocnychCastiachAZariadeniachDomu),
                kalkulacka ? spoluvlastnickyPodiel : skipSchema(spoluvlastnickyPodiel),
                kalkulacka ? vymeraKalkulacka : skipSchema(vymeraKalkulacka),
                kalkulacka
                  ? skipSchema(vymeraPodlahovychPlochNebytovehoPriestoruVBytovomDome)
                  : vymeraPodlahovychPlochNebytovehoPriestoruVBytovomDome,
                object(
                  'datumy',
                  {},
                  {
                    objectDisplay: 'columns',
                    objectColumnRatio: '1/1',
                  },
                  [
                    datePicker(
                      'datumVznikuDanovejPovinnosti',
                      { title: 'Dátum vzniku daňovej povinnosti' },
                      {
                        helptext:
                          'Vypĺňate len v prípade, ak ste nebytový priestor zdedili alebo vydražili (v tom prípade uvediete prvý deň mesiaca nasledujúceho po tom, v ktorom ste nehnuteľnosť nadobudli).',
                      },
                    ),
                    datePicker(
                      'datumZanikuDanovejPovinnosti',
                      { title: 'Dátum zániku daňovej povinnosti' },
                      {
                        helptext:
                          'Vypĺňate len v prípade, ak ste nebytový priestor predali alebo darovali (uvediete dátum 31.12.rok predaja/darovania).',
                      },
                    ),
                  ],
                ),
              ],
            ),
          ]),
        ],
      ),
      textArea(
        'poznamka',
        { title: 'Poznámka' },
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
    helptext: markdownText(
      `K úspešnému vyplneniu oddielu potrebujete list vlastníctva (LV) k jednotlivým priestorom. Ide o LV, na ktorom máte uvedený bytový alebo nebytový priestor.\n\nV prípade, že sa vás daň z bytov a z nebytových priestorov netýka, túto časť preskočte.\n\n:form-image-preview[Zobraziť ukážku LV k bytovému domu]{src="https://cdn-api.bratislava.sk/general-strapi/upload/test_d7881242ec.svg"}`,
    ),
    fields: kalkulackaFields({
      title: 'Kalkulačka výpočtu výmery podlahových plôch bytov a nebytových priestorov',
      helptextHeader:
        'Zjednodušili sme pre vás výpočet. Stačí ak zadáte dva údaje z LV a výmery podlahových plôch vypočítame za vás.',
      checkboxLabel: 'Chcem pomôcť s výpočtom a použiť kalkulačku výmery podlahových plôch',
      inner: innerArray,
    }),
  }),
)

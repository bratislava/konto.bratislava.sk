import {
  arrayField,
  conditionalFields,
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
import { pouzitKalkulacku } from './kalkulacky'
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

const podielPriestoruNaSpolocnychCastiachAZariadeniachDomu = input(
  'podielPriestoruNaSpolocnychCastiachAZariadeniachDomu',
  {
    title: 'Podiel priestoru na spoločných častiach a zariadeniach domu',
    required: true,
    format: 'ratio',
  },
  {
    placeholder: 'Napr. 4827/624441',
    helptext:
      'Zadávajte celý zlomok. Nájdete ho vedľa údajov o vchode, poschodí a čísle bytu. Zobraziť ukážku',
  },
)

const spoluvlastnickyPodiel = input(
  'spoluvlastnickyPodiel',
  { title: 'Spoluvlastnícky podiel', required: true, format: 'ratio' },
  {
    placeholder: 'Napr. 1/1 alebo 1/105',
    helptext: 'Zadávajte celý zlomok. Nájdete ho vedľa údajov o mene vlastníkov. Zobraziť ukážku',
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
    helptext: 'Zadávajte číslo zaokrúhlené nahor na celé číslo (príklad: 48,27 = 49)',
  },
)

const innerArray = (kalkulacka: boolean) =>
  arrayField(
    'stavby',
    { title: 'Priznania k dani zo stavieb služiacich viaceré účely', required: true },
    {
      hideTitle: true,
      variant: 'topLevel',
      addTitle: 'Podávate priznanie aj za ďalší byt alebo nebytový priestor v inom bytovom dome?',
      addDescription:
        'V prípade, že podávate priznanie aj za ďalší byt, alebo iný nebytový priestor, je potrebné pridať ďalšie priznanie.',
      addButtonLabel: 'Pridať ďalšie priznanie',
      itemTitle: 'Priznanie k dani zo stavby slúžiacej na viaceré účely č. {index}',
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
            kalkulacka ? skipSchema(vymeraPodlahovejPlochyBytu) : vymeraPodlahovejPlochyBytu,
            number(
              'vymeraPodlahovejPlochyNaIneUcely',
              {
                type: 'integer',
                title: 'Výmera podlahovej plochy bytu používaného na iné účely',
                required: true,
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
                  'todoRename',
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
                          'Vypĺňate len v prípade, ak ste nebytový priestor zdedili alebo vydražili (v tom prípade uvediete prvý deň mesiaca nasledujúceho po tom, v ktorom ste nehnuteľnosť nadobudli)',
                      },
                    ),
                    datePicker(
                      'datumZanikuDanovejPovinnosti',
                      { title: 'Dátum zániku daňovej povinnosti' },
                      {
                        helptext:
                          'Vypĺňate len v prípade, ak ste nebytový priestor predali alebo darovali (uvediete dátum 31/12/rok predaja/darovania)',
                      },
                    ),
                  ],
                ),
              ],
            ),
          ]),
        ],
      ),
    ],
  )

export default step(
  // eslint-disable-next-line no-secrets/no-secrets
  'danZBytovANebytovychPriestorov',
  {
    title: 'Priznanie k dani z bytov a z nebytových priestorov v bytovom dome',
    stepperTitle: 'Daň z bytov a z nebytových priestorov (v bytovom dome)',
  },
  vyplnitKrokRadio({
    title: 'Chcete podať daňové priznanie k dani z bytov a z nebytových priestorov v bytovom dome?',
    helptext: markdownText(
      `K úspešnému vyplneniu oddielu potrebujete list vlastníctva (LV) k jednotlivým priestorom. Ide o LV, na ktorom máte uvedený bytový alebo nebytový priestor.\n\nV prípade, že sa vás daň z bytov a z nebytových priestorov netýka, túto časť preskočte.`,
    ),
    fields: [
      ...pouzitKalkulacku({
        title: 'Kalkulačka výpočtu {name}',
        checkboxLabel: 'Chcem pomôcť s výpočtom a použiť kalkulačku výpočtu podlahovej plochy',
        helptextHeader:
          'Vysvetlene k comu sluzi kalkulacka. Lorem ipsum dolor sit amet consectetur.',
        inner: innerArray,
      }),
      textArea(
        'poznamka',
        { title: 'Poznámka' },
        { placeholder: 'Tu môžete napísať doplnkové informácie' },
      ),
    ],
  }),
)

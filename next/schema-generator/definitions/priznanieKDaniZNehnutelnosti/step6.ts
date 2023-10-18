import {
  arrayField,
  conditionalFields,
  datePicker,
  inputField,
  numberField,
  object,
  radioButton,
  step,
  textArea,
} from '../../generator/functions'
import { createCondition } from '../../generator/helpers'
import { stavbyBase } from './stavbyBase'
import { StepEnum } from './stepEnum'
import { vyplnitKrokRadio } from './vyplnitKrokRadio'

export default step(
  'danZBytovANebytovychPriestorov',
  { title: 'Daň z bytov a z nebytových priestorov v bytovom dome' },
  vyplnitKrokRadio([
    arrayField(
      'stavby',
      { title: 'asdad', required: true },
      {
        variant: 'topLevel',
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
            radioButton(
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
              },
            ),
            conditionalFields(createCondition([[['priznanieZaByt'], { const: true }]]), [
              numberField(
                'vymeraPodlahovejPlochy',
                {
                  type: 'integer',
                  title: 'Výmera podlahovej plochy bytu (základ dane bytu)',
                  required: true,
                },
                {
                  helptext:
                    // TODO m2
                    'Zadávajte číslo zaokrúhlené nahor (napr. ak 12.3 m2, tak zadajte 13).',
                },
              ),
              numberField(
                'vymeraPodlahovejPlochyNaIneUcely',
                {
                  type: 'integer',
                  title: 'Výmera podlahovej plochy bytu používaného na iné účely',
                  required: true,
                },
                {
                  helptext:
                    // TODO m2
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
            radioButton(
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
              },
            ),
            conditionalFields(
              createCondition([[['priznanieZaNebytovyPriestor'], { const: true }]]),
              [
                arrayField(
                  'nebytovePriestory',
                  { title: 'asdad', required: true },
                  {
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
                        inputField(
                          'ucelVyuzitiaNebytovehoPriestoruVBytovomDome',
                          {
                            title: 'Účel využitia nebytového priestoru v bytovom dome',
                            required: true,
                          },
                          {
                            helptext: 'Napr. garážovanie, skladovanie, podnikanie alebo iné.',
                          },
                        ),
                        inputField(
                          'cisloNebytovehoPriestoruVBytovomDome',
                          { title: 'Číslo nebytového priestoru v bytovom dome', required: true },
                          {
                            helptext:
                              'Napr. číslo parkovacieho státia alebo pivničnej kobky (malo by byť uvedené aj na LV).',
                          },
                        ),
                      ],
                    ),
                    numberField(
                      'vymeraPodlahovychPlochNebytovehoPriestoruVBytovomDome',
                      {
                        type: 'integer',
                        title: 'Výmera podlahových plôch nebytového priestoru v bytovom dome',
                        required: true,
                      },
                      {
                        helptext:
                          'Zadávajte číslo zaokrúhlené nahor na celé číslo (príklad: 48,27 = 49)',
                      },
                    ),
                    numberField(
                      'vymeraPodlahovejPlochyNaIneUcely',
                      {
                        type: 'integer',
                        title: 'Výmera podlahovej plochy bytu používaného na iné účely',
                        required: true,
                      },
                      {
                        helptext:
                          // TODO m2
                          'Vyplňte v prípade, ak používate časť bytu napríklad na podnikateľské účely. Zadajte výmeru.',
                      },
                    ),
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
                              'Vypĺňate len v prípade, ak ste byt/nebytový priestor predali alebo darovali (uvediete dátum 31/12/rok predaja/darovania)',
                          },
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ],
    ),
    textArea(
      'poznamka',
      { title: 'Poznámka' },
      { placeholder: 'Tu môžete napísať doplnkové informácie' },
    ),
  ]),
)

import {
  arrayField,
  conditionalFields,
  datePicker,
  input,
  markdownText,
  number,
  object,
  radioGroup,
  selectMultiple,
  skipSchema,
  step,
  textArea,
} from '../../generator/functions'
import { createCondition, createStringOptions } from '../../generator/helpers'
import { pouzitKalkulacku } from './kalkulacky'
import { stavbyBase } from './stavbyBase'
import { StepEnum } from './stepEnum'
import { vyplnitKrokRadio } from './vyplnitKrokRadio'

const celkovaZastavanaPlocha = number(
  'celkovaZastavanaPlocha',
  { type: 'integer', title: 'Celková zastavaná plocha', required: true },
  {
    helptext: markdownText(
      'Uveďte výmeru zastavanej plochy pozemku/ov, na ktorom je umiestnená stavba. Nájdete ju na LV, v časti A. (druh pozemku - zastavaná plocha a nádvorie). Zobraziť ukážku',
    ),
  },
)

const spoluvlastnickyPodiel = input(
  'spoluvlastnickyPodiel',
  {
    title: 'Spoluvlastnícky podiel',
    required: true,
    format: 'ratio',
  },
  {
    placeholder: 'Napr. 1/1',
    helptext:
      'Nájdete ho na LV, časti B, vedľa údajov o vlastníkovi. Zadávajte celý zlomok. Zobraziť ukážku',
  },
)

const zakladDane = number(
  'zakladDane',
  { type: 'integer', title: 'Základ dane', required: true },
  {
    helptext: markdownText(
      'Výmera zastavanej plochy stavby, pri spoluvlastníctve do výšky spoluvlastníckych podielov. Zadajte ako číslo zaokrúhlené na celé m^2^ nahor.',
    ),
  },
)

const innerArray = (kalkulacka: boolean) =>
  arrayField(
    'stavby',
    { title: 'Priznania k dani zo stavieb slúžiacich na jeden účel', required: true },
    {
      hideTitle: true,
      variant: 'topLevel',
      addTitle: 'Podávate priznanie aj za ďalšiu stavbu slúžiacu na jeden účel?',
      addDescription:
        'V prípade, že podávate priznanie aj za ďalšiu stavbu slúžiacu na jeden účel, pridajte ďalšie priznanie.',
      addButtonLabel: 'Pridať ďalšie priznanie',
      itemTitle: 'Priznanie k dani zo stavby slúžiacej na jeden účel č. {index}',
    },
    [
      ...stavbyBase(StepEnum.DanZoStaviebJedencel),
      selectMultiple(
        'predmetDane',
        {
          title: 'Predmet dane (druh stavby)',
          required: true,
          options: createStringOptions(['Čuňovo', 'Devín'], false),
        },
        {
          helptext: 'Vyberte stavbu, ktorú zdaňujete, podľa účelu využitia.',
          dropdownDivider: true,
        },
      ),
      kalkulacka ? celkovaZastavanaPlocha : skipSchema(celkovaZastavanaPlocha),
      kalkulacka ? spoluvlastnickyPodiel : skipSchema(spoluvlastnickyPodiel),
      kalkulacka ? skipSchema(zakladDane) : zakladDane,
      number(
        'pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia',
        {
          type: 'integer',
          minimum: 0,
          title: 'Počet nadzemných a podzemných podlaží stavby okrem prvého nadzemného podlažia',
          required: true,
        },
        {
          helptext: 'Napríklad, ak máte dom s dvomi podlažiami a s pivničným priestorom, zadáte 2.',
        },
      ),
      radioGroup(
        'castStavbyOslobodenaOdDane',
        {
          type: 'boolean',
          title:
            'Máte časť stavby, ktorá podlieha oslobodeniu od dane zo stavieb podľa § 17 zákona č. 582/2004 Z.z. a VZN?',
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
      conditionalFields(createCondition([[['castStavbyOslobodenaOdDane'], { const: true }]]), [
        object(
          'castStavbyOslobodenaOdDaneDetaily',
          {},
          {
            objectDisplay: 'columns',
            objectColumnRatio: '1/1',
          },
          [
            number(
              'celkovaVymera',
              {
                title: 'Celková výmera podlahových plôch všetkých podlaží stavby',
                required: true,
              },
              {
                helptext:
                  'Spočítajte výmeru na všetkých podlažiach. U spoluvlastníkov vo výške ich spoluvlastníckeho podielu',
              },
            ),
            number(
              'oslobodenaVymera',
              {
                title:
                  'Výmera podlahových plôch časti stavby, ktorá je oslobodená od dane zo stavieb',
                required: true,
              },
              {
                helptext: 'U spoluvlastníkov vo výške ich spoluvlastníckeho podielu',
              },
            ),
          ],
        ),
      ]),
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
                'Vypĺňate len v prípade, ak ste stavbu zdedili alebo vydražili (v tom prípade uvediete prvý deň mesiaca nasledujúceho po tom, v ktorom ste nehnuteľnosť nadobudli)',
            },
          ),
          datePicker(
            'datumZanikuDanovejPovinnosti',
            { title: 'Dátum zániku daňovej povinnosti' },
            {
              helptext:
                'Vypĺňate len v prípade, ak ste stavbu predali alebo darovali (uvediete dátum 31.12.rok predaja/darovania)',
            },
          ),
        ],
      ),
    ],
  )

export default step(
  'danZoStaviebJedenUcel',
  {
    title: 'Priznanie k dani zo stavieb – stavba slúžiaca na jeden účel',
    stepperTitle: 'Daň zo stavieb (stavba slúžiaca na jeden účel)',
  },
  vyplnitKrokRadio({
    title: 'Chcete podať daňové priznanie k dani zo stavieb slúžiacich na jeden účel?',
    helptext: markdownText(
      `K úspešnému vyplneniu oddielu potrebujete list vlastníctva (LV) k jednoúčelovej stavbe. Ide o LV, na ktorom máte uvedený nadpis “Stavby”.\n\nV prípade, že sa vás daň zo stavieb slúžiacich na jeden účel netýka, túto časť preskočte (napr. podávate priznanie dani k nehnuteľností za byt/nebyt v bytovom dome).`,
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

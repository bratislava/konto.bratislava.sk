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
  select,
  skipSchema,
  step,
  textArea,
} from '../../generator/functions'
import { createCondition } from '../../generator/helpers'
import { kalkulackaFields } from './kalkulacky'
import { stavbyBase } from './stavbyBase'
import { StepEnum } from './stepEnum'
import { vyplnitKrokRadio } from './vyplnitKrokRadio'

const celkovaZastavanaPlocha = number(
  'celkovaZastavanaPlocha',
  { type: 'integer', title: 'Celková zastavaná plocha', required: true },
  {
    helptext: markdownText(
      'Uveďte výmeru zastavanej plochy pozemku/ov, na ktorom je umiestnená stavba. Nájdete ju na LV, v časti A. (druh pozemku - zastavaná plocha a nádvorie). :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/strapi-homepage/upload/oprava_cyklocesty_kacin_7b008b44d8.jpg"}',
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
    helptext: markdownText(
      'Nájdete ho na LV, časti B, vedľa údajov o vlastníkovi. Zadávajte celý zlomok. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/strapi-homepage/upload/oprava_cyklocesty_kacin_7b008b44d8.jpg"}',
    ),
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

const zakladDaneKalkulacka = customComponentsField(
  {
    type: 'propertyTaxCalculator',
    props: {
      variant: 'black',
      calculators: [
        {
          label: 'Základ dane',
          formula: 'ceil (celkovaZastavanaPlocha * evalRatio(spoluvlastnickyPodiel))',
          missingFieldsMessage: 'Pre výpočet základu dane vyplňte všetky polia.',
          unit: markdownText('m^2^'),
        },
      ],
    },
  },
  {},
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
      select(
        'predmetDane',
        {
          title: 'Predmet dane',
          required: true,
          options: [
            {
              value: 'a',
              title:
                'a) stavby na bývanie a drobné stavby, ktoré majú doplnkovú funkciu pre hlavnú stavbu',
            },
            {
              value: 'b',
              title:
                'b) stavby na pôdohospodársku produkciu, skleníky, stavby pre vodné hospodárstvo, stavby využívané na skladovanie vlastnej pôdohospodárskej produkcie vrátane stavieb na vlastnú administratívu',
            },
            {
              value: 'c',
              title: 'c) chaty a stavby na individuálnu rekreáciu',
            },
            {
              value: 'd',
              title: 'd) samostatne stojace garáže',
            },
            {
              value: 'e',
              title: 'e) stavby hromadných garáží',
            },
            {
              value: 'f',
              title: 'f) stavby hromadných garáží umiestnené pod zemou',
            },
            {
              value: 'g',
              title:
                'g) priemyselné stavby, stavby slúžiace energetike, stavby slúžiace stavebníctvu, stavby využívané na skladovanie vlastnej produkcie vrátane stavieb na vlastnú administratívu',
            },
            {
              value: 'h',
              title:
                'h) stavby na ostatné podnikanie a na zárobkovú činnosť, skladovanie a administratívu súvisiacu s ostatným podnikaním a so zárobkovou činnosťou',
            },
            {
              value: 'i',
              title: 'i) ostatné stavby neuvedené v písmenách a) až h)',
            },
          ],
        },
        {
          helptext: 'Vyberte stavbu, ktorú zdaňujete, podľa účelu využitia.',
          dropdownDivider: true,
        },
      ),
      kalkulacka ? celkovaZastavanaPlocha : skipSchema(celkovaZastavanaPlocha),
      kalkulacka ? spoluvlastnickyPodiel : skipSchema(spoluvlastnickyPodiel),
      kalkulacka ? skipSchema(zakladDane) : zakladDane,
      kalkulacka ? zakladDaneKalkulacka : skipSchema(zakladDane),
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
              'celkovaVymeraPodlahovychPlochVsetkychPodlaziStavby',
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
              'vymePodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb',
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
                'Vypĺňate len v prípade, ak ste stavbu zdedili alebo vydražili (v tom prípade uvediete prvý deň mesiaca nasledujúceho po tom, v ktorom ste nehnuteľnosť nadobudli).',
            },
          ),
          datePicker(
            'datumZanikuDanovejPovinnosti',
            { title: 'Dátum zániku daňovej povinnosti' },
            {
              helptext:
                'Vypĺňate len v prípade, ak ste stavbu predali alebo darovali (uvediete dátum 31.12.rok predaja/darovania).',
            },
          ),
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
  'danZoStaviebJedenUcel',
  {
    title: 'Priznanie k dani zo stavieb – stavba slúžiaca na jeden účel',
    description: 'napr. rodinný dom, samostatne stojaca garáž, skleníky, stavby na podnikanie atď.',
    stepperTitle: 'Daň zo stavieb (stavba slúžiaca na jeden účel)',
  },
  vyplnitKrokRadio({
    title: 'Chcete podať daňové priznanie k dani zo stavieb slúžiacich na jeden účel?',
    helptext: markdownText(
      `K úspešnému vyplneniu oddielu potrebujete list vlastníctva (LV) k jednoúčelovej stavbe. Ide o LV, na ktorom máte uvedený nadpis “Stavby”.\n\nV prípade, že sa vás daň zo stavieb slúžiacich na jeden účel netýka, túto časť preskočte (napr. podávate priznanie dani k nehnuteľností za byt/nebyt v bytovom dome).\n\n:form-image-preview[Zobraziť ukážku LV k pozemkom]{src="https://cdn-api.bratislava.sk/strapi-homepage/upload/oprava_cyklocesty_kacin_7b008b44d8.jpg"}`,
    ),
    fields: kalkulackaFields({
      title: 'Kalkulačka výpočtu {name}',
      checkboxLabel: 'Chcem pomôcť s výpočtom a použiť kalkulačku výpočtu podlahovej plochy',
      helptextHeader: 'Vysvetlene k comu sluzi kalkulacka. Lorem ipsum dolor sit amet consectetur.',
      inner: innerArray,
    }),
  }),
)

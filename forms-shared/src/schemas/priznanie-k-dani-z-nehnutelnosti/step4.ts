import {
  arrayField,
  conditionalFields,
  customComponentsField,
  datePicker,
  input,
  number,
  object,
  radioGroup,
  select,
  step,
} from '../../generator/functions'
import { createCondition } from '../../generator/helpers'
import { kalkulackaFields } from './kalkulacky'
import { stavbyBase } from './stavbyBase'
import { StepEnum } from './stepEnum'
import { vyplnitKrokRadio } from './vyplnitKrokRadio'

const celkovaZastavanaPlocha = number(
  'celkovaZastavanaPlocha',
  { type: 'integer', title: 'Celková zastavaná plocha', required: true, minimum: 0 },
  {
    helptextFooter:
      'Uveďte výmeru zastavanej plochy pozemku/ov, na ktorom je umiestnená stavba. Nájdete ju na LV, v časti A. (druh pozemku - zastavaná plocha a nádvorie). :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/4_stavba_celkova_zastavana_plocha_5dac588a12.png"}',
    helptextFooterMarkdown: true,
  },
)

const spoluvlastnickyPodiel = input(
  'spoluvlastnickyPodiel',
  {
    type: 'ba-ratio',
    title: 'Spoluvlastnícky podiel',
    required: true,
  },
  {
    placeholder: 'Napr. 1/1',
    helptextFooter:
      'Nájdete ho na LV, časti B, vedľa údajov o vlastníkovi. Zadávajte celý zlomok. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/4_stavba_spoluvlastnicky_podiel_41513cd88b.png"}',
    helptextFooterMarkdown: true,
  },
)

const zakladDane = number(
  'zakladDane',
  { type: 'integer', title: 'Základ dane', required: true, minimum: 0 },
  {
    helptextFooter:
      'Výmera zastavanej plochy stavby, pri spoluvlastníctve do výšky spoluvlastníckych podielov. Zadajte ako číslo zaokrúhlené na celé m^2^ nahor.',
    helptextFooterMarkdown: true,
  },
)

const zakladDaneKalkulacka = customComponentsField(
  'zakladDaneKalkulacka',
  {
    type: 'calculator',
    props: {
      variant: 'black',
      calculators: [
        {
          label: 'Základ dane',
          formula: 'ceil (celkovaZastavanaPlocha * evalRatio(spoluvlastnickyPodiel))',
          missingFieldsMessage:
            '**Pre výpočet základu dane vyplňte správne všetky polia:**\n' +
            '- Celková zastavaná plocha\n' +
            '- Spoluvlastnícky podiel',
          unit: 'm^2^',
          unitMarkdown: true,
        },
      ],
    },
  },
  {},
)

const innerArray = (kalkulacka: boolean) =>
  arrayField(
    'priznania',
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
          items: [
            {
              value: 'a',
              label:
                'a) stavby na bývanie a drobné stavby, ktoré majú doplnkovú funkciu pre hlavnú stavbu',
            },
            {
              value: 'b',
              label:
                'b) stavby na pôdohospodársku produkciu, skleníky, stavby pre vodné hospodárstvo, stavby využívané na skladovanie vlastnej pôdohospodárskej produkcie vrátane stavieb na vlastnú administratívu',
            },
            {
              value: 'c',
              label: 'c) chaty a stavby na individuálnu rekreáciu',
            },
            {
              value: 'd',
              label: 'd) samostatne stojace garáže',
            },
            {
              value: 'e',
              label: 'e) stavby hromadných garáží',
            },
            {
              value: 'f',
              label: 'f) stavby hromadných garáží umiestnené pod zemou',
            },
            {
              value: 'g',
              label:
                'g) priemyselné stavby, stavby slúžiace energetike, stavby slúžiace stavebníctvu, stavby využívané na skladovanie vlastnej produkcie vrátane stavieb na vlastnú administratívu',
            },
            {
              value: 'h',
              label:
                'h) stavby na ostatné podnikanie a na zárobkovú činnosť, skladovanie a administratívu súvisiacu s ostatným podnikaním a so zárobkovou činnosťou',
            },
            {
              value: 'i',
              label: 'i) ostatné stavby neuvedené v písmenách a) až h)',
            },
          ],
        },
        {
          helptextFooter: 'Vyberte stavbu, ktorú zdaňujete, podľa účelu využitia.',
        },
      ),
      ...(kalkulacka
        ? [celkovaZastavanaPlocha, spoluvlastnickyPodiel, zakladDaneKalkulacka]
        : [zakladDane]),
      number(
        'pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia',
        {
          type: 'integer',
          minimum: 0,
          title: 'Počet nadzemných a podzemných podlaží stavby okrem prvého nadzemného podlažia',
          required: true,
        },
        {
          helptextFooter:
            'Napríklad, ak máte dom s dvomi podlažiami a s pivničným priestorom, zadáte 2.',
        },
      ),
      radioGroup(
        'castStavbyOslobodenaOdDane',
        {
          type: 'boolean',
          title:
            'Máte časť stavby, ktorá podlieha oslobodeniu od dane zo stavieb podľa § 17 zákona č. 582/2004 Z.z. a VZN?',
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
      conditionalFields(createCondition([[['castStavbyOslobodenaOdDane'], { const: true }]]), [
        object(
          'castStavbyOslobodenaOdDaneDetaily',
          {},
          {
            columns: true,
            columnsRatio: '1/1',
          },
          [
            number(
              'celkovaVymeraPodlahovychPlochVsetkychPodlaziStavby',
              {
                title: 'Celková výmera podlahových plôch všetkých podlaží stavby',
                required: true,
                minimum: 0,
              },
              {
                helptextFooter:
                  'Spočítajte výmeru na všetkých podlažiach. U spoluvlastníkov vo výške ich spoluvlastníckeho podielu.',
              },
            ),
            number(
              'vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb',
              {
                title:
                  'Výmera podlahových plôch časti stavby, ktorá je oslobodená od dane zo stavieb',
                required: true,
                minimum: 0,
              },
              {
                helptextFooter: 'U spoluvlastníkov vo výške ich spoluvlastníckeho podielu.',
              },
            ),
          ],
        ),
      ]),
      object(
        'datumy',
        {},
        {
          columns: true,
          columnsRatio: '1/1',
        },
        [
          datePicker(
            'datumVznikuDanovejPovinnosti',
            { title: 'Dátum vzniku daňovej povinnosti' },
            {
              helptextFooter:
                'Vypĺňate len v prípade, ak ste stavbu zdedili alebo vydražili (v tom prípade uvediete prvý deň mesiaca nasledujúceho po tom, v ktorom ste nehnuteľnosť nadobudli).',
            },
          ),
          datePicker(
            'datumZanikuDanovejPovinnosti',
            { title: 'Dátum zániku daňovej povinnosti' },
            {
              helptextFooter:
                'Vypĺňate len v prípade, ak ste stavbu predali alebo darovali (uvediete dátum 31.12.rok predaja/darovania).',
            },
          ),
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
  'danZoStaviebJedenUcel',
  {
    title: 'Priznanie k dani zo stavieb – stavba slúžiaca na jeden účel',
    description: 'napr. rodinný dom, samostatne stojaca garáž, skleníky, stavby na podnikanie atď.',
    stepperTitle: 'Daň zo stavieb (stavba slúžiaca na jeden účel)',
  },
  vyplnitKrokRadio({
    title: 'Chcete podať daňové priznanie k dani zo stavieb slúžiacich na jeden účel?',
    helptext: `K úspešnému vyplneniu oddielu potrebujete list vlastníctva (LV) k jednoúčelovej stavbe. Ide o tú časť LV, kde máte nadpis “Stavby” v časti “A: MAJETKOVÁ PODSTATA”.\n\nV prípade, že sa vás daň zo stavieb slúžiacich na jeden účel netýka, túto časť preskočte (napr. podávate priznanie dani k nehnuteľností za byt/nebytový priestor v bytovom dome).\n\n:form-image-preview[Zobraziť ukážku LV k jednoúčelovým stavbám]{src="https://cdn-api.bratislava.sk/general-strapi/upload/4_priznanie_bfb15a1f4a.png"}`,
    helptextMarkdown: true,
    fields: kalkulackaFields({
      title: 'Kalkulačka výpočtu výmery zastavanej plochy stavby',
      helptext:
        'Zjednodušili sme pre vás výpočet. Stačí ak zadáte dva údaje z LV a celkovú výmeru zastavanej plochy vypočítame za vás.',
      checkboxLabel: 'Chcem pomôcť s výpočtom a použiť kalkulačku výpočtu zastavanej plochy',
      inner: innerArray,
    }),
  }),
)

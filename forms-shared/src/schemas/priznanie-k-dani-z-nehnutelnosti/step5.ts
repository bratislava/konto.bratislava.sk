import { createCondition } from '../../generator/helpers'
import { kalkulackaFields } from './kalkulacky'
import { stavbyBase } from './stavbyBase'
import { StepEnum } from './stepEnum'
import { vyplnitKrokRadio } from './vyplnitKrokRadio'
import {
  oddiel3ViacereUcelyCelkovaVymeraFormula,
  oddiel3ViacereUcelyZakladDaneFormula,
} from '../../tax-form/formulas'
import { select } from '../../generator/functions/select'
import { input } from '../../generator/functions/input'
import { number } from '../../generator/functions/number'
import { radioGroup } from '../../generator/functions/radioGroup'
import { datePicker } from '../../generator/functions/datePicker'
import { customComponentsField } from '../../generator/functions/customComponentsField'
import { object } from '../../generator/object'
import { arrayField } from '../../generator/functions/arrayField'
import { step } from '../../generator/functions/step'
import { conditionalFields } from '../../generator/functions/conditionalFields'

const vymeraPodlahovejPlochy = number(
  'vymeraPodlahovejPlochy',
  { type: 'integer', title: 'Výmera podlahovej plochy', required: true, minimum: 0 },
  {
    helptextFooter: 'Zadávajte číslo zaokrúhlené nahor (napr. ak 12.3 m^2^, tak zadajte 13).',
    helptextFooterMarkdown: true,
  },
)

const vymeraPodlahovejPlochyKalkulacka = customComponentsField(
  'vymeraPodlahovejPlochyKalkulacka',
  {
    type: 'calculator',
    props: {
      variant: 'black',
      calculators: [
        {
          label: 'Výmera podlahovej plochy',
          formula:
            'roundTo(ratioNumerator(podielPriestoruNaSpolocnychCastiachAZariadeniachDomu) * evalRatio(spoluvlastnickyPodiel) / 100, 2)',
          missingFieldsMessage:
            '**Pre výpočet výmery podlahovej plochy vyplňte správne všetky polia:**\n' +
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

const podielPriestoruNaSpolocnychCastiachAZariadeniachDomu = input(
  'podielPriestoruNaSpolocnychCastiachAZariadeniachDomu',
  {
    type: 'ba-ratio',
    title: 'Podiel priestoru na spoločných častiach a zariadeniach domu',
    required: true,
  },
  {
    placeholder: 'Napr. 4827/624441',
    helptextFooter:
      'Zadávajte celý zlomok. Nájdete ho vedľa údajov o vchode, poschodí a čísle bytu resp. nebytového priestoru. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/5_stavba_podiel_priestoru_077a008b66.png"}',
    helptextFooterMarkdown: true,
  },
)

const spoluvlastnickyPodiel = input(
  'spoluvlastnickyPodiel',
  { type: 'ba-ratio', title: 'Spoluvlastnícky podiel', required: true },
  {
    placeholder: 'Napr. 1/1 alebo 1/105',
    helptextFooter:
      'Zadávajte celý zlomok. Nájdete ho vedľa údajov o mene vlastníkov. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/5_stavba_spoluvlastnicky_podiel_d931ee97e7.png"}',
    helptextFooterMarkdown: true,
  },
)

const sumar = object('sumar', { required: true }, { objectDisplay: 'boxed', title: 'Sumár' }, [
  number(
    'vymeraPodlahovychPloch',
    {
      type: 'integer',
      title: 'Celková výmera podlahových plôch všetkých podlaží stavby',
      required: true,
      minimum: 0,
    },
    {
      helptextFooter:
        'Celková výmera je zaokrúhlená na celé m^2^ nahor (vrátane tých, na ktoré si uplatňujete nárok na oslobodenie), u spoluvlastníkov vo výške ich spoluvlastníckeho podielu.',
      helptextFooterMarkdown: true,
    },
  ),
  number(
    'zakladDane',
    {
      type: 'integer',
      title: 'Základ dane – výmera zastavanej plochy stavby vo výške spoluvlastníckych podielov',
      required: true,
      minimum: 0,
    },
    {
      helptextFooter:
        'Celková výmera pozostáva zo súčtu podielov výmer častí stavby využívaných na jednotlivé účely na zastavanej ploche. Číslo sa zaokrúhľuje na celé m^2^ nahor.',
      helptextFooterMarkdown: true,
    },
  ),
])

const sumarKalkulacka = customComponentsField(
  'sumarKalkulacka',
  {
    type: 'calculator',
    props: {
      label: 'Sumár',
      variant: 'white',
      calculators: [
        {
          label: 'Celková výmera podlahových plôch všetkých podlaží stavby',
          formula: oddiel3ViacereUcelyCelkovaVymeraFormula,
          dataContextLevelsUp: 1,
          missingFieldsMessage:
            '**Pre výpočet celkovej výmery podlahových plôch všetkých podlaží stavby vyplňte správne všetky polia:**\n' +
            '- Podiel priestoru na spoločných častiach a zariadeniach domu a spoluvlastnícky podiel pre každú časť stavby',
          unit: 'm^2^',
          unitMarkdown: true,
        },
        {
          label: 'Základ dane – celková výmera zastavanej plochy stavby',
          formula: oddiel3ViacereUcelyZakladDaneFormula,
          dataContextLevelsUp: 1,
          missingFieldsMessage:
            '**Pre výpočet základu dane vyplňte správne všetky polia:**\n' +
            '- Celková výmera zastavanej plochy viacúčelovej stavby\n' +
            '- Podiel priestoru na spoločných častiach a zariadeniach domu a spoluvlastnícky podiel pre každú časť stavby',
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
    { title: 'Priznania k dani zo stavieb slúžiacich na viaceré účely', required: true },
    {
      hideTitle: true,
      variant: 'topLevel',
      addTitle: 'Podávate priznanie aj za ďalšiu stavbu slúžiacu na viaceré účely?',
      addDescription:
        'V prípade, že podávate priznanie aj za ďalšiu stavbu slúžiacu na viaceré účely, pridajte ďalšie priznanie.',
      addButtonLabel: 'Pridať ďalšie priznanie',
      itemTitle: 'Priznanie k dani zo stavieb – stavba slúžiaca na viaceré účely č. {index}',
    },
    [
      ...stavbyBase(StepEnum.DanZoStaviebViacereUcely),
      input(
        'popisStavby',
        { type: 'text', title: 'Popis stavby', required: true },
        {
          placeholder: 'Napr. polyfunkčná budova',
          helptextFooter:
            'Uveďte stručný popis stavby, napr. administratívna budova, polyfunkčná stavba a pod. (vychádzajte z LV).',
        },
      ),
      object('datumy', {}, {}, [
        datePicker(
          'datumVznikuDanovejPovinnosti',
          { title: 'Dátum vzniku daňovej povinnosti' },
          {
            selfColumn: '2/4',
            helptextFooter:
              'Vypĺňate len v prípade, ak ste stavbu zdedili alebo vydražili (v tom prípade uvediete prvý deň mesiaca nasledujúceho po tom, v ktorom ste nehnuteľnosť nadobudli).',
          },
        ),
        datePicker(
          'datumZanikuDanovejPovinnosti',
          { title: 'Dátum zániku daňovej povinnosti' },
          {
            selfColumn: '2/4',
            helptextFooter:
              'Vypĺňate len v prípade, ak ste stavbu predali alebo darovali (uvediete dátum 31.12.rok predaja/darovania).',
          },
        ),
      ]),
      number(
        'celkovaVymera',
        {
          title: 'Celková výmera zastavanej plochy viacúčelovej stavby',
          required: true,
          minimum: 0,
        },
        {
          helptextFooter:
            'Výmera zastavanej plochy, na ktorej je postavená nebytová budova (pozrite LV s “Parcely registra “C” a parcelu s spôsobom využívania “16” alebo “15”). Ak je stavba na viacerých parceliach, sčítajte plochu. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/5_stavba_celkova_vymera_1c6b47124a.png"}',
          helptextFooterMarkdown: true,
        },
      ),
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
            'Napríklad ak máte stavbu s piatimi nadzemnými podlažiami a dvomi podzemnými podlažiami, uvádzate počet 6.',
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
        number(
          'vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb',
          {
            type: 'integer',
            title: 'Výmera podlahových plôch časti stavby, ktorá je oslobodená od dane zo stavieb',
            required: true,
            minimum: 0,
          },
          {
            helptextFooter: 'U spoluvlastníkov vo výške ich spoluvlastníckeho podielu.',
          },
        ),
      ]),
      object('nehnutelnosti', { required: true }, { objectDisplay: 'boxed' }, [
        arrayField(
          'nehnutelnosti',
          { title: 'Aké nehnuteľnosti máte v tejto budove z hľadiska účelu?', required: true },
          {
            variant: 'nested',
            addButtonLabel: 'Pridať ďalšiu časť stavby podľa účelu',
            itemTitle: 'Časť stavby č. {index}',
          },
          [
            select(
              'ucelVyuzitiaStavby',
              {
                title: 'Účel využitia stavby',
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
              {},
            ),
            ...(kalkulacka
              ? [
                  podielPriestoruNaSpolocnychCastiachAZariadeniachDomu,
                  spoluvlastnickyPodiel,
                  vymeraPodlahovejPlochyKalkulacka,
                ]
              : [vymeraPodlahovejPlochy]),
          ],
        ),
        kalkulacka ? sumarKalkulacka : sumar,
      ]),
      input(
        'poznamka',
        { type: 'text', title: 'Poznámka' },
        { placeholder: 'Tu môžete napísať doplnkové informácie' },
      ),
    ],
  )

export default step(
  'danZoStaviebViacereUcely',
  {
    title: 'Priznanie k dani zo stavieb – stavba slúžiaca na viaceré účely',
    stepperTitle: 'Daň zo stavieb (stavba slúžiaca na viaceré účely)',
    description: 'napr. byt, apartmán, nebytový priestor, garáž, v polyfunkčnej stavbe',
  },
  vyplnitKrokRadio({
    title: 'Chcete podať daňové priznanie k dani zo stavieb slúžiacich na viaceré účely?',
    helptext: `Tento oddiel vypĺňate, ak máte nehnuteľnosť v stavbe, ktorá slúži na viaceré účely, na ktoré sú určené rôzne sadzby dane.\n\nK úspešnému vyplneniu potrebujete list(y) vlastníctva (LV):\n* k pozemkom, na ktorých stojí stavba (nadpis “Parcely registra „C" evidované na katastrálnej mape”)\n* k jednotlivým stavbám (napr. byt, garážové státie).\n\nV prípade, že sa vás daň zo stavieb slúžiacich na viaceré účely netýka, túto časť preskočte.\n\n:form-image-preview[Zobraziť ukážku LV k viacúčelovým stavbám]{src="https://cdn-api.bratislava.sk/general-strapi/upload/5_priznanie_6286b348e2.png"}`,
    helptextMarkdown: true,
    fields: kalkulackaFields({
      title: 'Kalkulačka výpočtu výmery podlahových plôch a základu dane',
      helptext:
        'Zjednodušili sme pre vás výpočet. Stačí ak zadáte tri údaje z LV a výmery podlahových plôch a základ dane vypočítame za vás.',
      checkboxLabel:
        'Chcem pomôcť s výpočtom a použiť kalkulačku výmery podlahových plôch a základu dane',
      inner: innerArray,
    }),
  }),
)

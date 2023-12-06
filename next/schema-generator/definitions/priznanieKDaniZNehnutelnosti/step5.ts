import {
  arrayField,
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
import { kalkulackaFields } from './kalkulacky'
import { stavbyBase } from './stavbyBase'
import { StepEnum } from './stepEnum'
import { vyplnitKrokRadio } from './vyplnitKrokRadio'

const vymeraPodlahovejPlochy = number(
  'vymeraPodlahovejPlochy',
  { type: 'integer', title: 'Výmera podlahovej plochy', required: true },
  {
    helptext: markdownText(
      'Zadávajte číslo zaokrúhlené nahor (napr. ak 12.3 m^2^, tak zadajte 13).',
    ),
  },
)

const vymeraPodlahovejPlochyKalkulacka = customComponentsField(
  {
    type: 'propertyTaxCalculator',
    props: {
      variant: 'black',
      calculators: [
        {
          label: 'Výmera podlahovej plochy',
          formula:
            'roundTo(ratioNumerator(podielPriestoruNaSpolocnychCastiachAZariadeniachDomu) * evalRatio(spoluvlastnickyPodiel) / 100, 2)',
          missingFieldsMessage: 'Pre výpočet výmery podlahovej plochy vyplňte všetky polia.',
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

const sumar = object('sumar', { required: true }, { objectDisplay: 'boxed', title: 'Sumár' }, [
  number(
    'vymeraPodlahovychPloch',
    {
      type: 'integer',
      title: 'Celková výmera podlahových plôch všetkých podlaží stavby',
      required: true,
    },
    {
      helptext: markdownText(
        'Celková výmera je zaokrúhlená na celé m^2^ nahor (vrátane tých, na ktoré si uplatňujete nárok na oslobodenie), u spoluvlastníkov vo výške ich spoluvlastníckeho podielu.',
      ),
    },
  ),
  number(
    'zakladDane',
    {
      type: 'integer',
      title: 'Základ dane – výmera zastavanej plochy stavby vo výške spoluvlastníckych podielov',
      required: true,
    },
    {
      helptext: markdownText(
        'Celková výmera pozostáva zo súčtu podielov výmer častí stavby využívaných na jednotlivé účely na zastavanej ploche. Číslo sa zaokrúhľuje na celé m^2^ nahor.',
      ),
    },
  ),
])

const sumarKalkulacka = customComponentsField(
  {
    type: 'propertyTaxCalculator',
    props: {
      label: 'Sumár',
      variant: 'white',
      calculators: [
        {
          label: 'Celková výmera podlahových plôch všetkých podlaží stavby',
          formula:
            'f(n) = ratioNumerator(n.podielPriestoruNaSpolocnychCastiachAZariadeniachDomu) * evalRatio(n.spoluvlastnickyPodiel) / 100; mapped = map(f, nehnutelnosti.nehnutelnosti); sum(a, b) = a+b; ceil fold(sum, 0, mapped)',
          dataContextLevelsUp: 1,
          missingFieldsMessage:
            'Pre výpočet celkovej výmery podlahových plôch všetkých podlaží stavby vyplňte všetky polia.',
          unit: markdownText('m^2^'),
        },
        {
          label: 'Základ dane – celková výmera zastavanej plochy stavby',
          formula:
            'f(n) = evalRatio(n.podielPriestoruNaSpolocnychCastiachAZariadeniachDomu) * evalRatio(n.spoluvlastnickyPodiel) * celkovaVymera; mapped = map(f, nehnutelnosti.nehnutelnosti); sum(a, b) = a+b; ceil fold(sum, 0, mapped)',
          dataContextLevelsUp: 1,
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
        { title: 'Popis stavby', required: true },
        {
          placeholder: 'Napr. polyfunkčná budova',
          helptext:
            'Uveďte stručný popis stavby, napr. administratívna budova, polyfunkčná stavba a pod. (vychádzajte z LV).',
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
      number(
        'celkovaVymera',
        { title: 'Celková výmera zastavanej plochy viacúčelovej stavby', required: true },
        {
          helptext: markdownText(
            'Výmera zastavanej plochy, na ktorej je postavená nebytová budova (pozrite LV s “Parcely registra “C” a parcelu s spôsobom využívania “16” alebo “15”). Ak je stavba na viacerých parceliach, sčítajte plochu. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/test_d7881242ec.svg"}',
          ),
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
          helptext:
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
              {},
            ),
            kalkulacka ? skipSchema(vymeraPodlahovejPlochy) : vymeraPodlahovejPlochy,
            kalkulacka
              ? podielPriestoruNaSpolocnychCastiachAZariadeniachDomu
              : skipSchema(podielPriestoruNaSpolocnychCastiachAZariadeniachDomu),
            kalkulacka ? spoluvlastnickyPodiel : skipSchema(spoluvlastnickyPodiel),
            kalkulacka
              ? vymeraPodlahovejPlochyKalkulacka
              : skipSchema(vymeraPodlahovejPlochyKalkulacka),
          ],
        ),
        kalkulacka ? skipSchema(sumar) : sumar,
        kalkulacka ? sumarKalkulacka : skipSchema(sumarKalkulacka),
      ]),
      textArea(
        'poznamka',
        { title: 'Poznámka' },
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
    helptext: markdownText(
      `Tento oddiel vypĺňate, ak máte nehnuteľnosť v stavbe, ktorá slúži na viaceré účely, na ktoré sú určené rôzne sadzby dane. Napríklad ak vlastníte bytový alebo nebytový priestor v budove, ktorá je vedená ako administratívna alebo polyfunkčná.\n\nK úspešnému vyplneniu oddielu potrebujete listy vlastníctva (LV) k pozemkom – LV, na ktorom máte uvedený nadpis “Parcely registra „C" resp. „E” evidované na katastrálnej mape” nad tabuľkou a LV k jednotlivým stavbám (napr. byt, garážové státie).\n\nV prípade, že sa vás daň zo stavieb slúžiace na viaceré účely netýka, túto časť preskočte.\n\n:form-image-preview[Zobraziť ukážku LV k pozemkom]{src="https://cdn-api.bratislava.sk/general-strapi/upload/test_d7881242ec.svg"}`,
    ),
    fields: kalkulackaFields({
      title: 'Kalkulačka výpočtu výmery podlahových plôch a základu dane',
      helptextHeader:
        'Zjednodušili sme pre vás výpočet. Stačí ak zadáte tri údaje z LV a výmery podlahových plôch a základ dane vypočítame za vás.',
      checkboxLabel:
        'Chcem pomôcť s výpočtom a použiť kalkulačku výmery podlahových plôch a základu dane',
      inner: innerArray,
    }),
  }),
)

import {
  arrayField,
  conditionalFields,
  customComponentsField,
  datePicker,
  fileUpload,
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
import { createCondition, createStringOptions } from '../../generator/helpers'
import { kalkulackaFields } from './kalkulacky'
import { pravnyVztahSpoluvlastnictvo } from './pravnyVztahSpoluvlastnictvo'
import { StepEnum } from './stepEnum'
import { vyplnitKrokRadio } from './vyplnitKrokRadio'

const celkovaVymeraPozemku = number(
  'celkovaVymeraPozemku',
  { title: 'Celková výmera pozemku', required: true },
  {
    helptext: markdownText(
      'Zadávajte číslo, nachádza sa ako 2. v poradí v tabuľke na LV. Pozemky pod stavbami sa nezdaňujú. Sčítate len tie, ktoré majú iný kód využitia ako “15”. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/strapi-homepage/upload/oprava_cyklocesty_kacin_7b008b44d8.jpg"}',
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
    helptext: markdownText(
      'Zadávajte celý zlomok. Nájdete ho vedľa údajov o vchode, poschodí a čísle bytu. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/strapi-homepage/upload/oprava_cyklocesty_kacin_7b008b44d8.jpg"}',
    ),
  },
)

const spoluvlastnickyPodiel = input(
  'spoluvlastnickyPodiel',
  { title: 'Spoluvlastnícky podiel', required: true, format: 'ratio' },
  {
    placeholder: 'Napr. 1/1 alebo 1/105',
    helptext: markdownText(
      'Zadávajte celý zlomok. Nájdete ho vedľa údajov o mene vlastníkov. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/strapi-homepage/upload/oprava_cyklocesty_kacin_7b008b44d8.jpg"}',
    ),
  },
)

const vymeraPozemkuKalkulacka = customComponentsField(
  {
    type: 'propertyTaxCalculator',
    props: {
      variant: 'black',
      calculators: [
        {
          label: 'Vaša výmera pozemku',
          formula:
            'roundTo(evalRatio(podielPriestoruNaSpolocnychCastiachAZariadeniachDomu) * evalRatio(spoluvlastnickyPodiel) * celkovaVymeraPozemku, 2)',
          missingFieldsMessage: 'Pre výpočet výmery pozemku vyplňte všetky polia.',
          unit: markdownText('m^2^'),
        },
      ],
    },
  },
  {},
)

const vymeraPozemku = number(
  'vymeraPozemku',
  { title: 'Vaša výmera pozemku', required: true },
  {
    helptext:
      'Zadajte výsledok výpočtu vašej časti/podielu na výmere pozemku ako číslo na dve desatinné čísla - bez zaokrúhlenia (napr. 0,65)',
  },
)

const innerArray = (kalkulacka: boolean) =>
  arrayField(
    'danZPozemkov',
    { title: 'Priznania k dani z pozemkov', required: true },
    {
      hideTitle: true,
      variant: 'topLevel',
      addTitle: 'Podávate priznanie aj za ďalší pozemok?',
      addDescription:
        'V prípade, že podávate priznanie aj za ďalší pozemok, ktorý je na inom liste vlastníctva, pridajte ďalšie priznanie.',
      addButtonLabel: 'Pridať ďalšie priznanie',
      itemTitle: 'Priznanie k dani z pozemkov č. {index}',
    },
    [
      ...pravnyVztahSpoluvlastnictvo(StepEnum.DanZPozemkov),
      arrayField(
        'pozemky',
        { title: 'Pozemky', required: true },
        {
          variant: 'nested',
          addButtonLabel: 'Pridať ďalší pozemok (na tom istom LV)',
          itemTitle: 'Pozemok č. {index}',
          description: markdownText(
            'Pozemky pod stavbami, v ktorej máte nehnuteľnosť, sa nezdaňujú.\n\n:form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/strapi-homepage/upload/oprava_cyklocesty_kacin_7b008b44d8.jpg"}',
          ),
        },
        [
          input(
            'cisloListuVlastnictva',
            { title: 'Číslo listu vlastníctva' },
            { size: 'medium', placeholder: 'Napr. 4567' },
          ),
          select(
            'kataster',
            {
              title: 'Názov katastrálneho územia',
              required: true,
              options: createStringOptions(
                [
                  'Čuňovo',
                  'Devín',
                  'Devínska Nová Ves',
                  'Dúbravka',
                  'Jarovce',
                  'Karlova Ves',
                  'Lamač',
                  'Nivy',
                  'Nové Mesto',
                  'Petržalka',
                  'Podunajské Biskupice',
                  'Rača',
                  'Rusovce',
                  'Ružinov',
                  'Staré mesto',
                  'Trnávka',
                  'Vajnory',
                  'Vinohrady',
                  'Vrakuňa',
                  'Záhorská Bystrica',
                ],
                false,
              ),
            },
            {
              dropdownDivider: true,
            },
          ),
          object(
            'parcelneCisloSposobVyuzitiaPozemku',
            { required: true },
            {
              objectDisplay: 'columns',
              objectColumnRatio: '1/1',
            },
            [
              input(
                'cisloParcely',
                { title: 'Číslo parcely', required: true },
                {
                  placeholder: 'Napr. 7986/1',
                  helptext: markdownText(
                    'Zadávajte číslo s lomítkom. Nachádza sa na LV ako parcelné číslo. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/strapi-homepage/upload/oprava_cyklocesty_kacin_7b008b44d8.jpg"}',
                  ),
                },
              ),
              input(
                'sposobVyuzitiaPozemku',
                { title: 'Spôsob využitia pozemku' },
                {
                  helptext:
                    'Vyplňte, ak na pozemok bolo vydané povolenie na dobývanie ložiska nevyhradeného nerastu alebo sa na pozemku nachádza zariadenie na výrobu elektriny zo slnečnej energie, transformačná stanica alebo predajný stánok slúžiaci k predaju tovaru a poskytovaniu služieb.',
                },
              ),
            ],
          ),
          select(
            'druhPozemku',
            {
              title: 'Druh pozemku',
              required: true,
              options: [
                {
                  value: 'A',
                  title: 'A - orná pôda, vinice, chmeľnice, ovocné sady',
                },
                {
                  value: 'B',
                  title: 'B - trvalé trávnaté porasty',
                },
                {
                  value: 'C',
                  title: 'C - záhrady',
                },
                {
                  value: 'D',
                  title: 'D - lesné pozemky, na ktorých sú hospodárske lesy',
                },
                {
                  value: 'E',
                  title: 'E - rybníky s chovom rýb a ostatné hospodársky využívané vodné plochy',
                },
                {
                  value: 'F',
                  title: 'F - zastavané plochy a nádvoria',
                },
                {
                  value: 'G',
                  title: 'G - stavebné pozemky',
                },
                {
                  value: 'H',
                  title: 'H - ostatné plochy',
                },
              ],
            },
            {
              helptext: markdownText(
                'V prípade, že máte vydané právoplatné stavebné povolenie na stavbu vyberte možnosť G - Stavebné pozemky. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/strapi-homepage/upload/oprava_cyklocesty_kacin_7b008b44d8.jpg"}',
              ),
              dropdownDivider: true,
            },
          ),
          conditionalFields(createCondition([[['druhPozemku'], { enum: ['D', 'G'] }]]), [
            radioGroup(
              'hodnotaUrcenaZnaleckymPosudkom',
              {
                type: 'boolean',
                title: 'Je hodnota pozemku určená znaleckým posudkom?',
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
          ]),
          conditionalFields(
            createCondition([
              [['druhPozemku'], { enum: ['D', 'G'] }],
              [['hodnotaUrcenaZnaleckymPosudkom'], { const: true }],
            ]),
            [
              fileUpload(
                'znaleckyPosudok',
                {
                  title: 'Nahrajte znalecký posudok',
                  required: true,
                  multiple: true,
                },
                {
                  type: 'dragAndDrop',
                  helptext: markdownText(
                    'V prvom kroku je potrebné nahratie skenu znaleckého posudku. Po odoslaní elektronického formulára doručte, prosím, znalecký posudok v listinnej podobe na [oddelenie miestnych daní, poplatkov a licencií](https://bratislava.sk/mesto-bratislava/dane-a-poplatky). Z posudku sa následne použije hodnota pri výpočte dane z pozemku/ov.',
                  ),
                },
              ),
            ],
          ),
          kalkulacka ? celkovaVymeraPozemku : skipSchema(celkovaVymeraPozemku),
          kalkulacka
            ? podielPriestoruNaSpolocnychCastiachAZariadeniachDomu
            : skipSchema(podielPriestoruNaSpolocnychCastiachAZariadeniachDomu),
          kalkulacka ? spoluvlastnickyPodiel : skipSchema(spoluvlastnickyPodiel),
          kalkulacka ? vymeraPozemkuKalkulacka : skipSchema(vymeraPozemkuKalkulacka),
          kalkulacka ? skipSchema(vymeraPozemku) : vymeraPozemku,
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
                    'Vypĺňate len v prípade, ak ste pozemok zdedili alebo vydražili (v tom prípade uvediete prvý deň mesiaca nasledujúceho po tom, v ktorom ste nehnuteľnosť nadobudli).',
                },
              ),
              datePicker(
                'datumZanikuDanovejPovinnosti',
                { title: 'Dátum zániku daňovej povinnosti' },
                {
                  helptext:
                    'Vypĺňate len v prípade, ak ste pozemok predali alebo darovali (uvediete dátum 31.12.rok predaja/darovania).',
                },
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
    ],
  )

export default step(
  'danZPozemkov',
  { title: 'Priznanie k dani z pozemkov', stepperTitle: 'Daň z pozemkov' },
  vyplnitKrokRadio({
    title: 'Chcete podať daňové priznanie k dani z pozemkom?',
    helptext: markdownText(
      `K úspešnému vyplneniu oddielov k pozemkom potrebujete list vlastníctva (LV) k pozemkom. Ide o tú časť LV, kde máte v časti A: MAJETKOVÁ PODSTATA uvedené parcely registra "C", resp. "E" registrované na katastrálnej mape.\n\nV prípade, že sa vás daň z pozemkov netýka, túto časť preskočte.\n\n:form-image-preview[Zobraziť ukážku LV k pozemkom]{src="https://cdn-api.bratislava.sk/strapi-homepage/upload/oprava_cyklocesty_kacin_7b008b44d8.jpg"}`,
    ),
    fields: kalkulackaFields({
      title: 'Kalkulačka výpočtu {name}',
      checkboxLabel: 'Chcem pomôcť s výpočtom a použiť kalkulačku výpočtu podlahovej plochy',
      helptextHeader: 'Vysvetlene k comu sluzi kalkulacka. Lorem ipsum dolor sit amet consectetur.',
      inner: innerArray,
    }),
  }),
)

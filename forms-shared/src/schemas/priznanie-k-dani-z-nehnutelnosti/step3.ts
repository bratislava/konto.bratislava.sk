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
} from '../../generator/functions'
import { createCondition, createStringItems } from '../../generator/helpers'
import { kalkulackaFields } from './kalkulacky'
import { pravnyVztahSpoluvlastnictvo } from './pravnyVztahSpoluvlastnictvo'
import { StepEnum } from './stepEnum'
import { vyplnitKrokRadio } from './vyplnitKrokRadio'

const celkovaVymeraPozemku = number(
  'celkovaVymeraPozemku',
  { title: 'Celková výmera pozemku', required: true, minimum: 0 },
  {
    helptext: markdownText(
      'Zadávajte číslo, nachádza sa ako 2. v poradí v tabuľke na LV. Pozemky pod stavbami sa nezdaňujú. Sčítate len tie, ktoré majú iný kód využitia ako “15”. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/3_pozemok_celkova_vymera_67d9f26e23.png"}',
    ),
  },
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
    helptext: markdownText(
      'Zadávajte celý zlomok. Nájdete ho vedľa údajov o vchode, poschodí a čísle bytu. Ak ho nemáte, zadajte 1/1. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/3_pozemok_podiel_priestoru_2446155a08.png"}',
    ),
  },
)

const spoluvlastnickyPodiel = input(
  'spoluvlastnickyPodiel',
  { type: 'ba-ratio', title: 'Spoluvlastnícky podiel', required: true },
  {
    placeholder: 'Napr. 1/1 alebo 1/105',
    helptext: markdownText(
      'Zadávajte celý zlomok. Nájdete ho vedľa údajov o mene vlastníkov. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/3_pozemok_spoluvlastnicky_podiel_a8753d1b69.png"}',
    ),
  },
)

const vymeraPozemkuKalkulacka = customComponentsField(
  {
    type: 'calculator',
    props: {
      variant: 'black',
      calculators: [
        {
          label: 'Vaša výmera pozemku',
          formula:
            'roundTo(evalRatio(podielPriestoruNaSpolocnychCastiachAZariadeniachDomu) * evalRatio(spoluvlastnickyPodiel) * celkovaVymeraPozemku, 2)',
          missingFieldsMessage:
            '**Pre výpočet výmery pozemku vyplňte správne všetky polia:**\n' +
            '- Celková výmera pozemku\n' +
            '- Podiel priestoru na spoločných častiach a zariadeniach domu\n' +
            '- Spoluvlastnícky podiel',
          unit: markdownText('m^2^'),
        },
      ],
    },
  },
  {},
)

const vymeraPozemku = number(
  'vymeraPozemku',
  { title: 'Vaša výmera pozemku', required: true, minimum: 0 },
  {
    helptext:
      'Zadajte výsledok výpočtu vašej časti/podielu na výmere pozemku ako číslo na dve desatinné čísla - bez zaokrúhlenia (napr. 0,65)',
  },
)

const innerArray = (kalkulacka: boolean) =>
  arrayField(
    'priznania',
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
        { title: 'Pozemky', required: true, maxItems: 17 },
        {
          variant: 'nested',
          addButtonLabel: 'Pridať ďalší pozemok (na tom istom LV)',
          itemTitle: 'Pozemok č. {index}',
          description: markdownText(
            'Pozemky pod stavbami, v ktorej máte nehnuteľnosť, sa nezdaňujú.\n\n:form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/3_pozemky_c16049c4bd.png"}',
          ),
          cannotAddItemMessage:
            'Dosiahli ste maximálny počet pozemkov (17) na jedno priznanie. Pridajte ďalšie priznanie.',
        },
        [
          input(
            'cisloListuVlastnictva',
            { type: 'text', title: 'Číslo listu vlastníctva' },
            { size: 'medium', placeholder: 'Napr. 4567' },
          ),
          select(
            'kataster',
            {
              title: 'Názov katastrálneho územia',
              required: true,
              items: createStringItems(
                [
                  'Čunovo',
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
                  'Staré Mesto',
                  'Trnávka',
                  'Vajnory',
                  'Vinohrady',
                  'Vrakuňa',
                  'Záhorská Bystrica',
                ],
                false,
              ),
            },
            {},
          ),
          object(
            'parcelneCisloSposobVyuzitiaPozemku',
            { required: true },
            {
              columns: true,
              columnsRatio: '1/1',
            },
            [
              input(
                'cisloParcely',
                { type: 'text', title: 'Číslo parcely', required: true },
                {
                  placeholder: 'Napr. 7986/1',
                  helptext: markdownText(
                    'Zadávajte číslo s lomítkom. Nachádza sa na LV ako parcelné číslo. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/3_pozemok_cislo_parcely_d88349308a.png"}',
                  ),
                },
              ),
              input(
                'sposobVyuzitiaPozemku',
                { type: 'text', title: 'Spôsob využitia pozemku' },
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
              items: [
                {
                  value: 'A',
                  label: 'A – orná pôda, vinice, chmeľnice, ovocné sady',
                },
                {
                  value: 'B',
                  label: 'B – trvalé trávnaté porasty',
                },
                {
                  value: 'C',
                  label: 'C – záhrady',
                },
                {
                  value: 'D',
                  label: 'D – lesné pozemky, na ktorých sú hospodárske lesy',
                },
                {
                  value: 'E',
                  label: 'E – rybníky s chovom rýb a ostatné hospodársky využívané vodné plochy',
                },
                {
                  value: 'F',
                  label: 'F – zastavané plochy a nádvoria',
                },
                {
                  value: 'G',
                  label: 'G – stavebné pozemky',
                },
                {
                  value: 'H',
                  label: 'H – ostatné plochy',
                },
              ],
            },
            {
              helptext: markdownText(
                'V prípade, že máte vydané právoplatné stavebné povolenie na stavbu vyberte možnosť G - Stavebné pozemky. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/3_pozemky_druh_pozemku_dea5055c20.png"}',
              ),
            },
          ),
          conditionalFields(createCondition([[['druhPozemku'], { enum: ['D', 'G'] }]]), [
            radioGroup(
              'hodnotaUrcenaZnaleckymPosudkom',
              {
                type: 'boolean',
                title: 'Je hodnota pozemku určená znaleckým posudkom?',
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
          ]),
          conditionalFields(
            createCondition([
              [['druhPozemku'], { enum: ['D', 'G'] }],
              [['hodnotaUrcenaZnaleckymPosudkom'], { const: true }],
            ]),
            [
              fileUpload(
                'znaleckyPosudok',
                // TODO: Reconsider required when tax form will be sent online.
                {
                  title: 'Nahrajte znalecký posudok',
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
              columns: true,
              columnsRatio: '1/1',
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
      input(
        'poznamka',
        { type: 'text', title: 'Poznámka' },
        { placeholder: 'Tu môžete napísať doplnkové informácie' },
      ),
    ],
  )

export default step(
  'danZPozemkov',
  { title: 'Priznanie k dani z pozemkov', stepperTitle: 'Daň z pozemkov' },
  vyplnitKrokRadio({
    title: 'Chcete podať daňové priznanie k dani z pozemkov?',
    helptext: markdownText(
      `K úspešnému vyplneniu oddielov k pozemkom potrebujete list vlastníctva (LV) k pozemkom. Ide o tú časť LV, kde máte nadpis “Parcely registra "C", resp. "E" evidované na katastrálnej mape” v časti “A: MAJETKOVÁ PODSTATA”.\n\nV prípade, že sa vás daň z pozemkov netýka, túto časť preskočte.\n\n:form-image-preview[Zobraziť ukážku LV k pozemkom]{src="https://cdn-api.bratislava.sk/general-strapi/upload/3_priznanie_376b4c7a44.png"}`,
    ),
    fields: kalkulackaFields({
      title: 'Kalkulačka výpočtu výmery pozemkov',
      helptext:
        'Zjednodušili sme pre vás výpočet. Stačí ak zadáte tri údaje z LV a celkovú výmeru zastavanej plochy vypočítame pri každom pozemku za vás.',
      checkboxLabel: 'Chcem pomôcť s výpočtom a použiť kalkulačku výpočtu výmery pozemkov',
      inner: innerArray,
    }),
  }),
)

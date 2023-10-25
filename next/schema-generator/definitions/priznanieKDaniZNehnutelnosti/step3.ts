import {
  arrayField,
  conditionalFields,
  datePicker,
  inputField,
  markdownText,
  numberField,
  object,
  radioButton,
  selectField,
  step,
  textArea,
  upload,
} from '../../generator/functions'
import { createCondition, createStringOptions } from '../../generator/helpers'
import { kalkulackaTest } from './kalkulacky'
import { pravnyVztahSpoluvlastnictvo } from './pravnyVztahSpoluvlastnictvo'
import { StepEnum } from './stepEnum'
import { vyplnitKrokRadio } from './vyplnitKrokRadio'

export default step(
  'danZPozemkov',
  { title: 'Priznanie k dani z pozemkov', stepperTitle: 'Daň z pozemkov' },
  vyplnitKrokRadio([
    arrayField(
      'danZPozemkov',
      { title: 'asdad', required: true },
      {
        variant: 'topLevel',
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
              'Pozemky pod stavbami, v ktorej máte nehnuteľnosť, sa nezdaňujú. Sčítate len tie, ktoré majú iný kód využitia ako”15”. Ak máte len parcely s kódom “15”, zadajte do pola číslo 0.\n\n::form-image-preview[Zobraziť ukážku]{#https://cdn-api.bratislava.sk/strapi-homepage/upload/oprava_cyklocesty_kacin_7b008b44d8.jpg}',
            ),
          },
          [
            inputField(
              'cisloListuVlastnictva',
              { title: 'Číslo listu vlastníctva' },
              { size: 'small', placeholder: 'Napr. 4567' },
            ),
            selectField(
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
                inputField(
                  'parcelneCislo',
                  { title: 'Parcelné číslo', required: true },
                  {
                    size: 'large',
                    placeholder: 'Napr. 7986/1',
                    helptext:
                      'Zadávajte číslo s lomítkom. Nachádza sa 1. v poradí v tabuľke na LV. Zobraziť ukážku',
                  },
                ),
                inputField(
                  'sposobVyuzitiaPozemku',
                  { title: 'Spôsob využitia pozemku', required: true },
                  { size: 'large' },
                ),
              ],
            ),
            selectField(
              'druhPozemku',
              {
                title: 'Druh pozemku',
                required: true,
                options: createStringOptions(['TODO 1', 'TODO 2'], false),
              },
              {
                helptext:
                  'V prípade, že máte vydané právoplatné stavebné povolenie na stavbu vyberte možnosť G - Stavebné pozemky. Zobraziť ukážku',
                dropdownDivider: true,
              },
            ),
            radioButton(
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
            conditionalFields(
              createCondition([[['hodnotaUrcenaZnaleckymPosudkom'], { const: true }]]),
              [
                upload(
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
            numberField(
              'vymeraPozemku',
              { title: 'Vaša výmera pozemku' },
              {
                helptext:
                  'Zadajte výsledok výpočtu vašej časti/podielu na výmere pozemku ako číslo na dve desatinné čísla - bez zaokrúhlenia (napr. 0,65)',
                rightComponents: [{ type: 'propertyTaxCalculator', props: kalkulackaTest }],
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
                      'Vypĺňate len v prípade, ak ste pozemok zdedili alebo vydražili (v tom prípade uvediete prvý deň mesiaca nasledujúceho po tom, v ktorom ste nehnuteľnosť nadobudli)',
                  },
                ),
                datePicker(
                  'datumZanikuDanovejPovinnosti',
                  { title: 'Dátum zániku daňovej povinnosti' },
                  {
                    helptext:
                      'Vypĺňate len v prípade, ak ste pozemok predali alebo darovali (uvediete dátum 31.12.rok predaja/darovania)',
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
    ),
  ]),
)

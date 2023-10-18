import {
  arrayField,
  conditionalFields,
  datePicker,
  inputField,
  numberField,
  object,
  radioButton,
  selectMultipleField,
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
  { title: 'Priznanie k dani z pozemkov' },
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
          { title: 'asdad', required: true },
          { variant: 'nested', addButtonLabel: 'asdads', itemTitle: 'Pozemok č. {index}' },
          [
            inputField(
              'cisloListuVlastnictva',
              { title: 'Číslo listu vlastníctva' },
              { size: 'small' },
            ),
            selectMultipleField(
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
                helptext:
                  'Vyberte jedno alebo viacero katastrálnych území, v ktorých sa pozemok nachádza',
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
            selectMultipleField(
              'druhPozemku',
              {
                title: 'Druh pozemku',
                required: true,
                // TODO no default
                options: createStringOptions(['TODO 1', 'TODO 2']),
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
                    helptext:
                      'V prvom kroku je potrebné nahratie skenu znaleckého posudku. Po odoslaní elektronického formulára doručte, prosím, znalecký posudok v listinnej podobe na oddelenie miestnych daní, poplatkov a licencií. Z posudku sa následne použije hodnota pri výpočte dane z pozemku/ov.',
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

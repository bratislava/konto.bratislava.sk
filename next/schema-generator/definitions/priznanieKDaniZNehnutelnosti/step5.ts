import {
  arrayField,
  datePicker,
  inputField,
  markdownText,
  numberField,
  object,
  radioButton,
  selectField,
  step,
} from '../../generator/functions'
import { createStringOptions } from '../../generator/helpers'
import { stavbyBase } from './stavbyBase'
import { StepEnum } from './stepEnum'
import { vyplnitKrokRadio } from './vyplnitKrokRadio'

export default step(
  'danZoStaviebViacereUcely',
  { title: 'Daň zo stavieb - stavba slúžiaca na viaceré účely' },
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
        ...stavbyBase(StepEnum.DanZoStaviebViacereUcely),
        inputField(
          'popisStavby',
          { title: 'Popis stavby', required: true },
          {
            size: 'large',
            placeholder: 'Napr. polyfunkčná budova',
            helptext:
              'Uveďte stručný popis stavby, napr. administratívna budova, polyfunkčná stavba a pod. (vychádzajte z LV)',
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
        numberField(
          'celkovaVymera',
          { title: 'Celková výmera zastavanej plochy viacúčelovej stavby' },
          {
            helptext:
              'Výmera zastavanej plochy, na ktorej je postavená nebytová budova (pozrite LV s “Parcely registra “C” a parcelu s spôsobom využívania “16” alebo “15”). Ak je stavba na viacerých parceliach, sčítajte plochu. Zobraziť ukážku',
          },
        ),
        radioButton(
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
        object(
          'nehnutelnosti',
          { required: true },
          { objectDisplay: 'boxed', spaceTop: 'default' },
          [
            arrayField(
              'nehnutelnosti',
              { title: 'asdad', required: true },
              {
                variant: 'nested',
                addButtonLabel: 'Pridať ďalšiu časť stavby podľa účelu',
                itemTitle: 'Časť stavby č. {index}',
              },
              [
                selectField(
                  'ucelVyuzitiaStavby',
                  {
                    title: 'Účel využitia stavby',
                    required: true,
                    options: createStringOptions(['Stavby hromadných garáži'], false),
                  },
                  {
                    dropdownDivider: true,
                  },
                ),
                numberField(
                  'vymeraPodlahovejPlochy',
                  { type: 'integer', title: 'Výmera podlahovej plochy', required: true },
                  {
                    helptext: markdownText(
                      'Zadávajte číslo zaokrúhlené nahor (napr. ak 12.3 m^2^, tak zadajte 13).',
                    ),
                  },
                ),
              ],
            ),
            object(
              'sumar',
              { required: true },
              { objectDisplay: 'boxed', spaceTop: 'default', title: 'Sumár' },
              [
                numberField(
                  'vymeraPodlahovejPlochy',
                  {
                    type: 'integer',
                    title: 'Celková výmera podlahových plôch všetkých podlaží stavby',
                    required: true,
                  },
                  {
                    helptext: markdownText(
                      'Celková výmera je zaokrúhlená na celé m^2^ nahor (vrátane tých, na ktoré si uplatňujete nárok na oslobodenie), u spoluvlastníkov vo výške ich spoluvlastníckeho podielu.',
                    ),
                    size: 'large',
                  },
                ),
                numberField(
                  'zakladDane',
                  {
                    type: 'integer',
                    title:
                      'Základ dane - výmera zastavanej plochy stavby vo výške spoluvlastníckych podielov',
                    required: true,
                  },
                  {
                    helptext: markdownText(
                      'Celková výmera pozostáva zo súčtu podielov výmer častí stavby využívaných na jednotlivé účely na zastavanej ploche. Číslo sa zaokrúhľuje na celé m^2^ nahor.',
                    ),
                    size: 'large',
                  },
                ),
              ],
            ),
          ],
        ),
        numberField(
          'pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia',
          {
            type: 'integer',
            minimum: 0,
            title: 'Počet nadzemných a podzemných podlaží stavby okrem prvého nadzemného podlažia',
            required: true,
          },
          {
            helptext:
              'Napríklad, ak máte dom s dvomi podlažiami a s pivničným priestorom, zadáte 2.',
            size: 'large',
          },
        ),
      ],
    ),
  ]),
)

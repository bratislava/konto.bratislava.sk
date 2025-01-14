import { createStringItems } from '../../generator/helpers'
import { pravnyVztahSpoluvlastnictvo } from './pravnyVztahSpoluvlastnictvo'
import { StepEnum } from './stepEnum'
import { select } from '../../generator/functions/select'
import { input } from '../../generator/functions/input'
import { number } from '../../generator/functions/number'
import { object } from '../../generator/object'

export const stavbyBase = (step: StepEnum) => [
  input(
    'cisloListuVlastnictva',
    { type: 'text', title: 'Číslo listu vlastníctva' },
    { size: 'medium', placeholder: 'Napr. 4567' },
  ),
  object('riadok1', { required: true }, {}, [
    input(
      'ulicaACisloDomu',
      { type: 'text', title: 'Ulica a číslo domu', required: true },
      { selfColumn: '3/4' },
    ),
    number(
      'supisneCislo',
      { title: 'Súpisné číslo', required: true, type: 'integer', minimum: 1 },
      { selfColumn: '1/4' },
    ),
  ]),
  object('riadok2', { required: true }, {}, [
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
      { selfColumn: '2/4' },
    ),
    input(
      'cisloParcely',
      { type: 'text', title: 'Číslo parcely', required: true },
      {
        selfColumn: '2/4',
        placeholder: 'Napr. 7986/1',
        helptextFooter: {
          [StepEnum.DanZPozemkov]:
            'Zadávajte číslo s lomítkom. Nachádza sa na LV ako parcelné číslo. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/3_pozemok_cislo_parcely_d88349308a.png"}',
          [StepEnum.DanZoStaviebJedencel]:
            'Zadávajte číslo s lomítkom. Nachádza sa na LV ako parcelné číslo. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/4_stavba_cislo_parcely_ec11c9dbb0.png"}',
          [StepEnum.DanZoStaviebViacereUcely]:
            'Zadávajte číslo s lomítkom. Nachádza sa na LV ako parcelné číslo. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/5_stavba_cislo_parcely_f37ad2e4f7.png"}',
          [StepEnum.DanZBytovANebytovychPriestorov]:
            'Zadávajte číslo s lomítkom. Nachádza sa na LV ako parcelné číslo. Ak dom stojí na viacerých parcelách, uveďte prvú z nich. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/6_byt_cislo_parcely_a7124f13a3.png"}',
        }[step],
        helptextFooterMarkdown: true,
      },
    ),
  ]),
  ...pravnyVztahSpoluvlastnictvo(step),
]

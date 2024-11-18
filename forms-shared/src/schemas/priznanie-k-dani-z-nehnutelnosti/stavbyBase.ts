import { input, markdownText, number, object, select } from '../../generator/functions'
import { createStringItems } from '../../generator/helpers'
import { pravnyVztahSpoluvlastnictvo } from './pravnyVztahSpoluvlastnictvo'
import { StepEnum } from './stepEnum'

export const stavbyBase = (step: StepEnum) => [
  input(
    'cisloListuVlastnictva',
    { type: 'text', title: 'Číslo listu vlastníctva' },
    { size: 'medium', placeholder: 'Napr. 4567' },
  ),
  object(
    'riadok1',
    { required: true },
    {
      columns: true,
      columnsRatio: '3/1',
    },
    [
      input('ulicaACisloDomu', { type: 'text', title: 'Ulica a číslo domu', required: true }, {}),
      number(
        'supisneCislo',
        { title: 'Súpisné číslo', required: true, type: 'integer', minimum: 1 },
        {},
      ),
    ],
  ),
  object(
    'riadok2',
    { required: true },
    {
      columns: true,
      columnsRatio: '1/1',
    },
    [
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
      input(
        'cisloParcely',
        { type: 'text', title: 'Číslo parcely', required: true },
        {
          placeholder: 'Napr. 7986/1',
          helptext: markdownText(
            {
              [StepEnum.DanZPozemkov]:
                'Zadávajte číslo s lomítkom. Nachádza sa na LV ako parcelné číslo. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/3_pozemok_cislo_parcely_d88349308a.png"}',
              [StepEnum.DanZoStaviebJedencel]:
                'Zadávajte číslo s lomítkom. Nachádza sa na LV ako parcelné číslo. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/4_stavba_cislo_parcely_ec11c9dbb0.png"}',
              [StepEnum.DanZoStaviebViacereUcely]:
                'Zadávajte číslo s lomítkom. Nachádza sa na LV ako parcelné číslo. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/5_stavba_cislo_parcely_f37ad2e4f7.png"}',
              [StepEnum.DanZBytovANebytovychPriestorov]:
                'Zadávajte číslo s lomítkom. Nachádza sa na LV ako parcelné číslo. Ak dom stojí na viacerých parcelách, uveďte prvú z nich. :form-image-preview[Zobraziť ukážku]{src="https://cdn-api.bratislava.sk/general-strapi/upload/6_byt_cislo_parcely_a7124f13a3.png"}',
            }[step],
          ),
        },
      ),
    ],
  ),
  ...pravnyVztahSpoluvlastnictvo(step),
]

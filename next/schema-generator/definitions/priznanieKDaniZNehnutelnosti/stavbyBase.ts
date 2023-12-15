import { input, markdownText, object, select } from '../../generator/functions'
import { createStringOptions } from '../../generator/helpers'
import { pravnyVztahSpoluvlastnictvo } from './pravnyVztahSpoluvlastnictvo'
import { StepEnum } from './stepEnum'

export const stavbyBase = (step: StepEnum) => [
  input(
    'cisloListuVlastnictva',
    { title: 'Číslo listu vlastníctva' },
    { size: 'medium', placeholder: 'Napr. 4567' },
  ),
  object(
    'riadok1',
    { required: true },
    {
      objectDisplay: 'columns',
      objectColumnRatio: '3/1',
    },
    [
      input('ulicaACisloDomu', { title: 'Ulica a číslo domu', required: true }, {}),
      input('supisneCislo', { title: 'Súpisné číslo', required: true }, {}),
    ],
  ),
  object(
    'riadok2',
    { required: true },
    {
      objectDisplay: 'columns',
      objectColumnRatio: '1/1',
    },
    [
      select(
        'kataster',
        {
          title: 'Názov katastrálneho územia',
          required: true,
          options: createStringOptions(
            [
              'Čunovo',
              'Devín',
              'Devínska Nová Ves',
              'Dúbravka',
              'Jarovce',
              'Karlova Ves',
              'Lamač',
              'Nové Mesto',
              'Petržalka',
              'Podunajské Biskupice',
              'Rača',
              'Rusovce',
              'Ružinov',
              'Staré Mesto',
              'Vajnory',
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
        { title: 'Číslo parcely', required: true },
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
  ...(step === StepEnum.DanZBytovANebytovychPriestorov
    ? [
        input('cisloBytu', { title: 'Číslo bytu', required: true }, {}),
        input(
          'popisBytu',
          { title: 'Popis bytu' },
          { helptext: 'Stručný popis bytu.', placeholder: 'Napr. dvojizbový byt' },
        ),
      ]
    : []),
  ...pravnyVztahSpoluvlastnictvo(step),
]

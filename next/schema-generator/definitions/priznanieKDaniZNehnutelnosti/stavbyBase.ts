import { input, object, select } from '../../generator/functions'
import { createStringOptions } from '../../generator/helpers'
import { pravnyVztahSpoluvlastnictvo } from './pravnyVztahSpoluvlastnictvo'
import { StepEnum } from './stepEnum'

export const stavbyBase = (step: StepEnum) => [
  input(
    'cisloListuVlastnictva',
    { title: 'Číslo listu vlastníctva' },
    { size: 'small', placeholder: 'Napr. 4567' },
  ),
  object(
    'todoRename2',
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
    'todoRename1',
    { required: true },
    {
      objectDisplay: 'columns',
      objectColumnRatio: '3/1',
    },
    [
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
      input(
        'cisloParcely',
        { title: 'Číslo parcely', required: true },
        {
          helptext: 'Uveďte len prvé parcelné číslo',
        },
      ),
    ],
  ),
  ...(step === StepEnum.DanZBytovANebytovychPriestorov
    ? [
        input('cisloBytu', { title: 'Číslo bytu', required: true }, {}),
        input('popisBytu', { title: 'Popis bytu' }, {}),
      ]
    : []),
  ...pravnyVztahSpoluvlastnictvo(step),
]

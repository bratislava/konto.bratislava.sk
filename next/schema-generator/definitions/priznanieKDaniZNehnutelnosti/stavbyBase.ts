import { inputField, object, selectMultipleField } from '../../generator/functions'
import { createStringOptions } from '../../generator/helpers'
import { pravnyVztahSpoluvlastnictvo } from './pravnyVztahSpoluvlastnictvo'
import { StepEnum } from './stepEnum'

export const stavbyBase = (step: StepEnum) => [
  inputField(
    'cisloListuVlastnictva',
    { title: 'Číslo listu vlastníctva', required: true },
    { size: 'small', helptext: 'Napr. 4567' },
  ),
  object(
    'todoRename2',
    { required: true },
    {
      objectDisplay: 'columns',
      objectColumnRatio: '3/1',
    },
    [
      inputField(
        'ulicaACisloDomu',
        { title: 'Ulica a číslo domu', required: true },
        { size: 'large' },
      ),
      inputField('supisneCislo', { title: 'Súpisné číslo', required: true }, { size: 'large' }),
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
          // todo size full
          className: 'w-full',
        },
      ),
      inputField(
        'cisloParcely',
        { title: 'Číslo parcely', required: true },
        {
          size: 'large',
          helptext: 'Uveďte len prvé parcelné číslo',
        },
      ),
    ],
  ),
  ...(step === StepEnum.DanZBytovANebytovychPriestorov
    ? [
        inputField(
          'cisloBytu',
          { title: 'Číslo bytu', required: true },
          {
            size: 'large',
          },
        ),
        inputField(
          'popisBytu',
          { title: 'Popis bytu' },
          {
            size: 'large',
          },
        ),
      ]
    : []),
  ...pravnyVztahSpoluvlastnictvo(step),
]

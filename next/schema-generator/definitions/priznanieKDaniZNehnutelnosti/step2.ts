import {
  conditionalFields,
  fileUpload,
  markdownText,
  object,
  radioGroup,
  step,
} from '../../generator/functions'
import { createCamelCaseOptionsV2, createCondition } from '../../generator/helpers'
import { danovnik, splnomocnenec } from './osoby'

export default step('udajeODanovnikovi', { title: 'Údaje o daňovníkovi' }, [
  radioGroup(
    'voSvojomMene',
    {
      type: 'boolean',
      title: 'Podávate priznanie k dani z nehnuteľností vo svojom mene?',
      required: true,
      options: [
        { value: true, title: 'Áno', isDefault: true },
        {
          value: false,
          title: 'Nie',
          description:
            'Označte v prípade, že podávate priznanie k dani z nehnuteľností ako oprávnená osoba na základe napr. plnej moci alebo ako zákonný zástupca.',
        },
      ],
    },
    { variant: 'boxed', orientations: 'column' },
  ),
  conditionalFields(createCondition([[['voSvojomMene'], { const: false }]]), [
    object(
      'opravnenaOsoba',
      { required: true },
      {
        objectDisplay: 'boxed',
        title: 'Údaje o oprávnenej osobe na podanie priznania',
      },
      [
        fileUpload(
          'splnomocnenie',
          // TODO: Reconsider required when tax form will be sent online.
          { title: 'Nahrajte splnomocnenie', multiple: true },
          {
            type: 'dragAndDrop',
            helptext: markdownText(
              'Keďže ste v predošlom kroku zvolili, že priznanie nepodávate vo svojom mene, je nutné nahratie skenu plnej moci. Následne, po odoslaní formulára je potrebné doručiť originál plnej moci v listinnej podobe na [oddelenie miestnych daní, poplatkov a licencií](https://bratislava.sk/mesto-bratislava/dane-a-poplatky). Splnomocnenie sa neprikladá v prípade zákonného zástupcu neplnoletej osoby.',
            ),
          },
        ),
        radioGroup(
          'splnomocnenecTyp',
          {
            type: 'string',
            title: 'Podávate ako oprávnená osoba (splnomocnenec)',
            required: true,
            options: createCamelCaseOptionsV2([
              { title: 'Fyzická osoba', description: 'Občan SR alebo cudzinec.' },
              {
                title: 'Právnicka osoba',
                description:
                  'Organizácia osôb alebo majetku vytvorená na určitý účel (napr. podnikanie).',
              },
            ]),
          },
          { variant: 'boxed' },
        ),
        ...splnomocnenec,
      ],
    ),
  ]),
  radioGroup(
    'priznanieAko',
    {
      type: 'string',
      title: 'Podávate priznanie ako',
      required: true,
      options: createCamelCaseOptionsV2([
        { title: 'Fyzická osoba', description: 'Občan SR alebo cudzinec.' },
        { title: 'Fyzická osoba podnikateľ', description: 'SZČO alebo živnostník.' },
        {
          title: 'Právnicka osoba',
          description:
            'Organizácia osôb alebo majetku vytvorená na určitý účel (napr. podnikanie).',
        },
      ]),
    },
    { variant: 'boxed' },
  ),
  ...danovnik,
])

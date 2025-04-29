import { createCondition } from '../../../generator/helpers'
import { input } from '../../../generator/functions/input'
import { radioGroup } from '../../../generator/functions/radioGroup'
import { object } from '../../../generator/object'
import { conditionalFields } from '../../../generator/functions/conditionalFields'
import { match } from 'ts-pattern'
import { step } from '../../../generator/functions/step'

export const getObjednavatelZiadatelStep = (type: 'objednavatel' | 'ziadatel') => {
  const fieldProperty = match(type)
    .with('objednavatel', () => 'objednavatelTyp')
    .with('ziadatel', () => 'ziadatelTyp')
    .exhaustive()

  return step(
    type,
    {
      title: match(type)
        .with('objednavatel', () => 'Objednávateľ')
        .with('ziadatel', () => 'Žiadateľ')
        .exhaustive(),
    },
    [
      radioGroup(
        fieldProperty,
        {
          type: 'string',
          title: match(type)
            .with('objednavatel', () => 'Objednávate ako')
            .with('ziadatel', () => 'Žiadate ako')
            .exhaustive(),
          required: true,
          items: [
            { value: 'fyzickaOsoba', label: 'Fyzická osoba', isDefault: true },
            { value: 'fyzickaOsobaPodnikatel', label: 'Fyzická osoba – podnikateľ' },
            { value: 'pravnickaOsoba', label: 'Právnická osoba' },
          ],
        },
        { variant: 'boxed', orientations: 'column' },
      ),
      conditionalFields(
        createCondition([
          [
            [fieldProperty],
            {
              enum: ['fyzickaOsoba', 'fyzickaOsobaPodnikatel'],
            },
          ],
        ]),
        [
          input('meno', { title: 'Meno', required: true, type: 'text' }, { selfColumn: '2/4' }),
          input(
            'priezvisko',
            { title: 'Priezvisko', required: true, type: 'text' },
            { selfColumn: '2/4' },
          ),
        ],
      ),
      conditionalFields(
        createCondition([
          [
            [fieldProperty],
            {
              enum: ['fyzickaOsobaPodnikatel', 'pravnickaOsoba'],
            },
          ],
        ]),
        [
          input('obchodneMeno', { title: 'Obchodné meno', required: true, type: 'text' }, {}),
          input('ico', { title: 'IČO', required: true, type: 'text' }, {}),
          input('dic', { title: 'DIČ', required: true, type: 'text' }, {}),
          input('icDph', { title: 'IČ DPH', required: true, type: 'text' }, {}),
        ],
      ),
      ...(['fyzickaOsoba', 'fyzickaOsobaPodnikatel', 'pravnickaOsoba'] as const).map(
        (objednavatelZiadatelTyp) =>
          conditionalFields(
            createCondition([[[fieldProperty], { const: objednavatelZiadatelTyp }]]),
            [
              input(
                'adresa',
                {
                  title: match(objednavatelZiadatelTyp)
                    .with('fyzickaOsoba', () => 'Adresa trvalého pobytu')
                    .with('fyzickaOsobaPodnikatel', () => 'Miesto podnikania')
                    .with('pravnickaOsoba', () => 'Adresa sídla')
                    .exhaustive(),
                  required: true,
                  type: 'text',
                },
                { helptext: 'Vyplňte vo formáte ulica a číslo' },
              ),
            ],
          ),
      ),
      input('mesto', { type: 'text', title: 'Mesto', required: true }, { selfColumn: '3/4' }),
      input('psc', { type: 'ba-slovak-zip', title: 'PSČ', required: true }, { selfColumn: '1/4' }),
      input('email', { title: 'E-mail', required: true, type: 'email' }, {}),
      input(
        'telefonneCislo',
        { title: 'Telefónne číslo', required: true, type: 'ba-phone-number' },
        { helptext: 'Vyplňte vo formáte +421' },
      ),
      conditionalFields(createCondition([[[fieldProperty], { const: 'pravnickaOsoba' }]]), [
        object('kontaktnaOsoba', { objectDisplay: 'boxed', title: 'Kontaktná osoba' }, [
          input('meno', { title: 'Meno', required: true, type: 'text' }, {}),
          input('priezvisko', { title: 'Priezvisko', required: true, type: 'text' }, {}),
          input('email', { title: 'E-mail', required: true, type: 'email' }, {}),
          input(
            'telefonneCislo',
            { title: 'Telefónne číslo', required: true, type: 'ba-phone-number' },
            { helptext: 'Vyplňte vo formáte +421' },
          ),
        ]),
      ]),
    ],
  )
}

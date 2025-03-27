import { createCondition } from '../generator/helpers'
import { select } from '../generator/functions/select'
import { input } from '../generator/functions/input'
import { radioGroup } from '../generator/functions/radioGroup'
import { textArea } from '../generator/functions/textArea'
import { step } from '../generator/functions/step'
import { conditionalFields } from '../generator/functions/conditionalFields'
import { schema } from '../generator/functions/schema'
import { fileUploadMultiple } from '../generator/functions/fileUploadMultiple'
import { object } from '../generator/object'
import { match, P } from 'ts-pattern'

const addressFields = (title: string) => [
  input(
    'ulicaCislo',
    { title, type: 'text', required: true },
    { helptext: 'Vyplňte vo formáte ulica a číslo' },
  ),
  input('mesto', { type: 'text', title: 'Mesto', required: true }, { selfColumn: '3/4' }),
  input('psc', { type: 'ba-slovak-zip', title: 'PSČ', required: true }, { selfColumn: '1/4' }),
]

export default schema(
  {
    title: 'Žiadosť o sprístupnenie informácií podľa zákona č. 211/2000 Z.z.',
  },
  {},
  [
    step('ziadatel', { title: 'Žiadateľ' }, [
      radioGroup(
        'typZiadatela',
        {
          type: 'string',
          title: 'Žiadate ako',
          required: true,
          items: [
            { value: 'fyzickaOsoba', label: 'Fyzická osoba', isDefault: true },
            { value: 'fyzickaOsobaPodnikatel', label: 'Fyzická osoba – podnikateľ' },
            { value: 'pravnickaOsoba', label: 'Právnická osoba' },
          ],
        },
        { variant: 'boxed' },
      ),
      conditionalFields(createCondition([[['typZiadatela'], { const: 'fyzickaOsoba' }]]), [
        input('meno', { title: 'Meno', required: true, type: 'text' }, { selfColumn: '2/4' }),
        input(
          'priezvisko',
          { title: 'Priezvisko', required: true, type: 'text' },
          { selfColumn: '2/4' },
        ),
        ...addressFields('Adresa pobytu'),
      ]),
      conditionalFields(
        createCondition([
          [['typZiadatela'], { enum: ['fyzickaOsobaPodnikatel', 'pravnickaOsoba'] }],
        ]),
        [
          input('obchodneMeno', { type: 'text', title: 'Obchodné meno', required: true }, {}),
          input('ico', { type: 'ba-ico', title: 'IČO', required: true }, {}),
        ],
      ),
      conditionalFields(
        createCondition([[['typZiadatela'], { const: 'fyzickaOsobaPodnikatel' }]]),
        [...addressFields('Miesto podnikania')],
      ),
      conditionalFields(createCondition([[['typZiadatela'], { const: 'pravnickaOsoba' }]]), [
        ...addressFields('Adresa sídla'),
      ]),
      ...[['fyzickaOsoba', 'fyzickaOsobaPodnikatel'] as const, 'pravnickaOsoba' as const].map(
        (ziadatelTypy) =>
          conditionalFields(
            createCondition([
              [
                ['typZiadatela'],
                match(ziadatelTypy)
                  .with(P.string, (matchedValue) => ({
                    const: matchedValue,
                  }))
                  .with(P.array(P.string), (matchedValue) => ({
                    enum: [...matchedValue],
                  }))
                  .exhaustive(),
              ],
            ]),
            [
              object(
                'kontaktneUdaje',
                {},
                {
                  title: 'Kontaktné údaje',
                  description:
                    'Uvedenie telefónneho čísla a emailu je nepovinné. Ak ich poskytnete, môžeme vás v prípade potreby kontaktovať na doplnenie informácií. Žiadosť je možné odoslať aj bez vyplnenia týchto údajov.',
                  objectDisplay: 'boxed',
                },
                [
                  ...match(ziadatelTypy)
                    .with('pravnickaOsoba', () => [
                      input(
                        'meno',
                        { title: 'Meno', required: true, type: 'text' },
                        { selfColumn: '2/4' },
                      ),
                      input(
                        'priezvisko',
                        { title: 'Priezvisko', required: true, type: 'text' },
                        { selfColumn: '2/4' },
                      ),
                    ])
                    .otherwise(() => []),
                  input('email', { title: 'Email', required: false, type: 'email' }, {}),
                  input(
                    'telefon',
                    { type: 'ba-phone-number', title: 'Telefónne číslo', required: false },
                    { size: 'medium', helptext: 'Vyplňte vo formáte +421' },
                  ),
                ],
              ),
            ],
          ),
      ),
    ]),

    step('pozadovaneInformacie', { title: 'Požadované informácie' }, [
      input('predmetZiadosti', { title: 'Predmet žiadosti', type: 'text', required: true }, {}),
      textArea(
        'obsahZiadosti',
        { title: 'Obsah žiadosti', required: true },
        { helptext: 'Uveďte požadované informácie' },
      ),
      fileUploadMultiple(
        'prilohyZiadosti',
        { title: 'Prílohy k žiadosti', required: false },
        {
          type: 'dragAndDrop',
        },
      ),
    ]),

    step('sposobSpristupnenia', { title: 'Spôsob sprístupnenia informácií' }, [
      select(
        'sposobSpristupnenia',
        {
          title: 'Akým spôsobom chcete sprístupniť požadované informácie',
          required: true,
          items: [
            { value: 'elektronickaSchranka', label: 'do elektronickej schránky' },
            { value: 'email', label: 'na emailovú adresu' },
            { value: 'postou', label: 'listinne poštou' },
            { value: 'telefon', label: 'telefonicky' },
            { value: 'fax', label: 'faxom' },
            { value: 'nahliadnutieDoSpisu', label: 'nahliadnutie do spisu (osobne)' },
          ],
        },
        {},
      ),
      conditionalFields(createCondition([[['sposobSpristupnenia'], { const: 'email' }]]), [
        input('emailSpristupnenia', { title: 'Email', type: 'email', required: true }, {}),
      ]),
      conditionalFields(createCondition([[['sposobSpristupnenia'], { const: 'telefon' }]]), [
        input(
          'telefon',
          { type: 'ba-phone-number', title: 'Telefónne číslo', required: true },
          { size: 'medium', helptext: 'Vyplňte vo formáte +421' },
        ),
      ]),
      conditionalFields(createCondition([[['sposobSpristupnenia'], { const: 'fax' }]]), [
        input(
          'faxCislo',
          { title: 'Fax číslo', type: 'ba-phone-number', required: true },
          { helptext: 'Vyplňte vo formáte +421' },
        ),
      ]),
    ]),
  ],
)

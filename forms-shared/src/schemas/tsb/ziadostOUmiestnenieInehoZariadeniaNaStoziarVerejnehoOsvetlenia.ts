import { createCondition, createStringItems } from '../../generator/helpers'
import { input } from '../../generator/functions/input'
import { radioGroup } from '../../generator/functions/radioGroup'
import { datePicker } from '../../generator/functions/datePicker'
import { object } from '../../generator/object'
import { step } from '../../generator/functions/step'
import { conditionalFields } from '../../generator/functions/conditionalFields'
import { schema } from '../../generator/functions/schema'
import { fileUploadMultiple } from '../../generator/functions/fileUploadMultiple'
import { getObjednavatelZiadatelStep } from './shared/getObjednavatelZiadatelStep'
import { SchemalessFormDataExtractor } from 'src/form-utils/evaluateFormDataExtractor'

export default schema(
  { title: 'Žiadosť o umiestnenie iného zariadenia na stožiar verejného osvetlenia' },
  {},
  [
    getObjednavatelZiadatelStep('ziadatel'),
    step('informacieOZariadeni', { title: 'Informácie o zariadení' }, [
      fileUploadMultiple(
        'umiestnenieStoziare',
        {
          title:
            'Nahrajte vyplnený súbor Umiestnenie zariadení na stožiare verejného osvetlenia.xlsx',
          required: true,
        },
        {
          type: 'dragAndDrop',
          helptext:
            'V prípade, že požadovaný súbor na vyplnenie ešte nemáte, stiahnuť si ho viete [na tomto odkaze](https://bratislava.sk/mesto-bratislava/technicke-siete-bratislava/ziadosti). Dbajte na to, aby ste v súbore spomenuli všetky zariadenia, ktoré si želáte umiestniť. Bez vyplnenia a nahratia tohto súboru nebude možné vašu žiadosť spracovať.',
          helptextMarkdown: true,
          accept: '.xlsx',
        },
      ),
      object(
        'zodpovednost',
        { required: true },
        {
          objectDisplay: 'boxed',
          title: 'Zodpovednosť za montáž, prevádzku a demontáž zariadenia',
        },
        [
          radioGroup(
            'zodpovednostZaMontaz',
            {
              type: 'string',
              title: 'Za montáž, prevádzku a demontáž zodpovedá',
              required: true,
              items: createStringItems(['Organizácia', 'Fyzická osoba']),
            },
            { variant: 'boxed', orientations: 'column' },
          ),
          conditionalFields(
            createCondition([[['zodpovednostZaMontaz'], { const: 'Organizácia' }]]),
            [
              input(
                'nazovOrganizacie',
                { type: 'text', title: 'Názov organizácie', required: true },
                {},
              ),
              object(
                'kontaktnaOsoba',
                { required: true },
                { objectDisplay: 'boxed', title: 'Kontaktná osoba' },
                [
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
                ],
              ),
            ],
          ),
          conditionalFields(
            createCondition([[['zodpovednostZaMontaz'], { const: 'Fyzická osoba' }]]),
            [
              input('meno', { title: 'Meno', required: true, type: 'text' }, { selfColumn: '2/4' }),
              input(
                'priezvisko',
                { title: 'Priezvisko', required: true, type: 'text' },
                { selfColumn: '2/4' },
              ),
            ],
          ),
          input('email', { title: 'E-mail', required: true, type: 'email' }, {}),
          input(
            'telefonneCislo',
            { title: 'Telefónne číslo', required: true, type: 'ba-phone-number' },
            { helptext: 'Vyplňte vo formáte +421' },
          ),
          datePicker(
            'planovanyDatumMontaze',
            {
              title: 'Plánovaný dátum montáže zariadenia',
              required: true,
            },
            {
              helptext:
                'O zahájení prác je potrebné písomne informovať **minimálne 1 pracovný deň** vopred prostredníctvom e-mailu na [info@tsb.sk](mailto:info@tsb.sk).',
              helptextMarkdown: true,
            },
          ),
          datePicker(
            'planovanyDatumDemontaze',
            {
              title: 'Plánovaný dátum demontáže zariadenia',
              required: true,
            },
            {
              helptext:
                'Žiadateľ je povinný na základe písomnej výzvy zabezpečiť demontáž svojho zariadenia na vlastné náklady, a to v lehote najneskôr do **15 kalendárnych dní** od doručenia takejto výzvy prostredníctvom kontaktného e-mailu.',
              helptextMarkdown: true,
            },
          ),
        ],
      ),
    ]),
    step('prilohy', { title: 'Prílohy' }, [
      fileUploadMultiple(
        'fotografiaVizualizacia',
        {
          title: 'Fotografia alebo vizualizácia zariadenia/zariadení',
          required: true,
        },
        {
          type: 'dragAndDrop',
          helptext:
            'Nahrajte jednu prílohu obsahujúcu fotografie alebo vizualizácie všetkých zariadení.',
        },
      ),
    ]),
  ],
)

type ExtractFormData = {
  ziadatel: { email: string } & (
    | {
        ziadatelTyp: 'fyzickaOsoba' | 'fyzickaOsobaPodnikatel'
        meno: string
      }
    | {
        ziadatelTyp: 'pravnickaOsoba'
        obchodneMeno: string
      }
  )
}

export const ziadostOUmiestnenieInehoZariadeniaNaStoziarVerejnehoOsvetleniaExtractEmail: SchemalessFormDataExtractor<ExtractFormData> =
  {
    type: 'schemaless',
    extractFn: (formData) => formData.ziadatel.email,
  }

export const ziadostOUmiestnenieInehoZariadeniaNaStoziarVerejnehoOsvetleniaExtractName: SchemalessFormDataExtractor<ExtractFormData> =
  {
    type: 'schemaless',
    extractFn: (formData) => {
      if (
        formData.ziadatel.ziadatelTyp === 'fyzickaOsoba' ||
        formData.ziadatel.ziadatelTyp === 'fyzickaOsobaPodnikatel'
      ) {
        return formData.ziadatel.meno
      } else if (formData.ziadatel.ziadatelTyp === 'pravnickaOsoba') {
        return formData.ziadatel.obchodneMeno
      }

      // Unreachable code, provided for type-safety to return `string` as required.
      throw new Error('Failed to extract the name.')
    },
  }

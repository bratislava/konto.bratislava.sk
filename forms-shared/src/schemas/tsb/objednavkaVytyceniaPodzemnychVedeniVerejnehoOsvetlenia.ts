import { selectMultiple } from '../../generator/functions/selectMultiple'
import { input } from '../../generator/functions/input'
import { datePicker } from '../../generator/functions/datePicker'
import { object } from '../../generator/object'
import { step } from '../../generator/functions/step'
import { schema } from '../../generator/functions/schema'
import { fileUploadMultiple } from '../../generator/functions/fileUploadMultiple'
import { getObjednavatelZiadatelStep } from './shared/getObjednavatelZiadatelStep'
import { esbsKatastralneUzemiaCiselnik } from '../../tax-form/mapping/shared/esbsCiselniky'
import { SchemalessFormDataExtractor } from '../../form-utils/evaluateFormDataExtractor'

export default schema(
  {
    title: 'Objednávka vytýčenia podzemných vedení verejného osvetlenia',
  },
  {},
  [
    getObjednavatelZiadatelStep('objednavatel'),
    step('udaje', { title: 'Údaje' }, [
      object(
        'fakturacneUdaje',
        { required: true },
        { objectDisplay: 'boxed', title: 'Fakturačné údaje' },
        [
          input(
            'adresaSidla',
            { title: 'Adresa sídla', required: true, type: 'text' },
            { helptext: 'Vyplňte vo formáte ulica a číslo' },
          ),
          input('mesto', { type: 'text', title: 'Mesto', required: true }, { selfColumn: '3/4' }),
          input(
            'psc',
            { type: 'ba-slovak-zip', title: 'PSČ', required: true },
            { selfColumn: '1/4' },
          ),
          input(
            'email',
            { title: 'E-mail', required: true, type: 'email' },
            {
              helptext: 'Faktúra vám bude zaslaná prostredníctvom tohto emailu',
            },
          ),
        ],
      ),
      object(
        'udajeObjednavky',
        { required: true },
        { objectDisplay: 'boxed', title: 'Údaje objednávky' },
        [
          input(
            'dovodVytycenia',
            { title: 'Dôvod vytýčenia', required: true, type: 'text' },
            {
              helptext:
                'Napríklad: vytýčenie káblovej poruchy, za účelom rozkopávky, vybudovanie inžinierskych sietí...',
            },
          ),
          input(
            'pozadovaneMiestoPlnenia',
            { title: 'Požadované miesto plnenia', required: true, type: 'text' },
            { helptext: 'Vyplňte vo formáte ulica a číslo' },
          ),
          selectMultiple(
            'katastralneUzemie',
            {
              title: 'Katastrálne územie',
              required: true,
              items: esbsKatastralneUzemiaCiselnik.map(({ Name, Code }) => ({
                value: Code,
                label: Name,
              })),
            },
            {
              helptext: 'Vyberte jedno alebo viacero katastrálnych území zo zoznamu.',
            },
          ),
          input(
            'druhStavby',
            { title: 'Druh stavby', required: false, type: 'text' },
            { helptext: 'Napríklad: telekomunikačná líniová stavba' },
          ),
          datePicker(
            'pozadovanyTerminPlnenia',
            { title: 'Požadovaný termín plnenia', required: true },
            { helptext: 'Štandardný termín na vybavenie objednávky je 30 dní' },
          ),
        ],
      ),
    ]),
    step('prilohy', { title: 'Prílohy' }, [
      fileUploadMultiple(
        'informativnyZakresSieti',
        {
          title: 'Informatívny zákres sietí vydaný Technickými sieťami Bratislava, a.s.',
          required: true,
        },
        {
          type: 'dragAndDrop',
          helptext:
            'Požiadať o informatívny zákres vydaný Technickými sieťami Bratislava, a.s. môžete formou spoplatnenej služby [Objednávka informatívneho zákresu sietí](https://konto.bratislava.sk/mestske-sluzby/tsb-objednavka-informativneho-zakresu-sieti)',
          helptextMarkdown: true,
          accept: '.pdf,.jpg,.jpeg,.png',
        },
      ),
    ]),
  ],
)

type ExtractFormData = {
  objednavatel: { email: string } & (
    | {
        objednavatelTyp: 'fyzickaOsoba' | 'fyzickaOsobaPodnikatel'
        meno: string
      }
    | {
        objednavatelTyp: 'pravnickaOsoba'
        obchodneMeno: string
      }
  )
}

export const objednavkaVytyceniaPodzemnychVedeniVerejnehoOsvetleniaExtractEmail: SchemalessFormDataExtractor<ExtractFormData> =
  {
    type: 'schemaless',
    extractFn: (formData) => formData.objednavatel.email,
  }

export const objednavkaVytyceniaPodzemnychVedeniVerejnehoOsvetleniaExtractName: SchemalessFormDataExtractor<ExtractFormData> =
  {
    type: 'schemaless',
    extractFn: (formData) => {
      if (
        formData.objednavatel.objednavatelTyp === 'fyzickaOsoba' ||
        formData.objednavatel.objednavatelTyp === 'fyzickaOsobaPodnikatel'
      ) {
        return formData.objednavatel.meno
      } else if (formData.objednavatel.objednavatelTyp === 'pravnickaOsoba') {
        return formData.objednavatel.obchodneMeno
      }

      // Unreachable code, provided for type-safety to return `string` as required.
      throw new Error('Failed to extract the name.')
    },
  }

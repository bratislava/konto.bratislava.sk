import { createCondition } from '../../generator/helpers'
import { select } from '../../generator/functions/select'
import { input } from '../../generator/functions/input'
import { textArea } from '../../generator/functions/textArea'
import { step } from '../../generator/functions/step'
import { conditionalFields } from '../../generator/functions/conditionalFields'
import { schema } from '../../generator/functions/schema'
import { fileUploadMultiple } from '../../generator/functions/fileUploadMultiple'
import { object } from '../../generator/object'
import { SchemalessFormDataExtractor } from '../../form-utils/evaluateFormDataExtractor'

const kategorieItems = [
  {
    value: 'pravidlaPaasAVseobecneInformacie',
    label: 'Pravidlá PAAS a všeobecné informácie',
  },
  { value: 'ziadostOParkovaciuKartu', label: 'Informácie k žiadosti o parkovaciu kartu' },
  {
    value: 'zmenaZrusenieParkovacejKarty',
    label: 'Informácie o zmene/zrušení parkovacej karty',
  },
  {
    value: 'upozornenieONespravnomParkovani',
    label: 'Dostal/a som upozornenie o nesprávnom parkovaní',
  },
  {
    value: 'rozkazOUlozeniSankcie',
    label: 'Dostal/a som Rozkaz o uložení sankcie (pokutu)',
  },
  {
    value: 'parkovacieListky',
    label: 'Parkovacie lístky - aplikácie, parkomaty, SMS',
  },
  { value: 'podnetyNaZlepsenieReklamacie', label: 'Podnety na zlepšenie/reklamácie' },
  { value: 'ine', label: 'Iné' },
] as const

type KategoriaValue = (typeof kategorieItems)[number]['value']

export default schema({ title: 'Kontaktný formulár PAAS' }, [
  step('udaje', { title: 'Údaje' }, [
    select(
      'kategoria',
      {
        title: 'Kategória',
        required: true,
        items: [...kategorieItems],
      },
      {},
    ),
    conditionalFields(
      createCondition([
        [
          ['kategoria'],
          {
            enum: [
              'ziadostOParkovaciuKartu',
              'zmenaZrusenieParkovacejKarty',
              'upozornenieONespravnomParkovani',
              'rozkazOUlozeniSankcie',
              'parkovacieListky',
            ] satisfies KategoriaValue[],
          },
        ],
      ]),
      [
        input(
          'cisloZiadostiEcv',
          { type: 'text', title: 'Číslo žiadosti / EČV', required: true },
          {},
        ),
      ],
    ),
    textArea(
      'sprava',
      { title: 'Správa', required: true },
      {
        helptext:
          'Pre rýchle vybavenie uveďte čo najviac informácií k podnetu. Prípadné dokumenty priložte tak, aby neobsahovali viditeľné osobné údaje.',
      },
    ),
    fileUploadMultiple<typeof kontaktnyFormularPaasFiles>(
      'prilohy',
      { title: 'Prílohy', slotId: 'prilohy' },
      { type: 'dragAndDrop' },
    ),
    object('kontaktneUdaje', { title: 'Kontaktné údaje' }, [
      input(
        'menoPriezviskoObchodneMeno',
        { type: 'text', title: 'Meno a priezvisko / Obchodné meno', required: true },
        { helptext: 'Ak ste právnická osoba alebo podnikateľ, uveďte obchodné meno.' },
      ),
      input('email', { title: 'E-mail', required: true, type: 'email' }, {}),
    ]),
  ]),
])

export const kontaktnyFormularPaasFiles = {
  slots: [{ slotId: 'prilohy' }],
} as const

type ExtractTechnicalSubjectFormData = {
  udaje: {
    kategoria: KategoriaValue
  }
}

const kategorieLabelByValue = Object.fromEntries(
  kategorieItems.map(({ value, label }) => [value, label]),
) as Record<KategoriaValue, string>

export const kontaktnyFormularPaasExtractTechnicalSubject: SchemalessFormDataExtractor<ExtractTechnicalSubjectFormData> =
  {
    type: 'schemaless',
    extractFn: (formData) =>
      `Kontaktný formulár PAAS: ${kategorieLabelByValue[formData.udaje.kategoria]}`,
  }

type ExtractEmailFormData = {
  udaje: {
    kontaktneUdaje: {
      email: string
    }
  }
}

export const kontaktnyFormularPaasExtractEmail: SchemalessFormDataExtractor<ExtractEmailFormData> =
  {
    type: 'schemaless',
    extractFn: (formData) => formData.udaje.kontaktneUdaje.email,
  }

type ExtractNameFormData = {
  udaje: {
    kontaktneUdaje: {
      menoPriezviskoObchodneMeno: string
    }
  }
}

export const kontaktnyFormularPaasExtractName: SchemalessFormDataExtractor<ExtractNameFormData> = {
  type: 'schemaless',
  extractFn: (formData) => formData.udaje.kontaktneUdaje.menoPriezviskoObchodneMeno,
}

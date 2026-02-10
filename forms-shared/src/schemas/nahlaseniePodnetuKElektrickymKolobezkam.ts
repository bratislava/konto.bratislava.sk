import { createCondition } from '../generator/helpers'
import { input } from '../generator/functions/input'
import { radioGroup } from '../generator/functions/radioGroup'
import { textArea } from '../generator/functions/textArea'
import { step } from '../generator/functions/step'
import { conditionalFields } from '../generator/functions/conditionalFields'
import { schema } from '../generator/functions/schema'
import { fileUploadMultiple } from '../generator/functions/fileUploadMultiple'
import { SchemalessFormDataExtractor } from '../form-utils/evaluateFormDataExtractor'

export default schema({ title: 'Nahlásenie podnetu k elektrickým kolobežkám' }, [
  step('podnet', { title: 'Podnet' }, [
    radioGroup(
      'typPodnetu',
      {
        type: 'string',
        title: 'Typ podnetu',
        required: true,
        items: [
          { value: 'nespravneZaparkovana', label: 'Nesprávne zaparkovaná kolobežka' },
          { value: 'neschopnaPrevadzky', label: 'Kolobežka neschopná prevádzky' },
          { value: 'ine', label: 'Iné' },
        ],
      },
      {
        variant: 'boxed',
        orientations: 'column',
        size: 'medium',
      },
    ),
    conditionalFields(createCondition([[['typPodnetu'], { const: 'ine' }]]), [
      textArea(
        'specifikaciaPodnetu',
        {
          title: 'Špecifikujte o aký podnet ide',
          required: true,
        },
        {
          helptext: 'Napr. navrhujem úpravu miesta parkovania',
          size: 'medium',
        },
      ),
    ]),
    radioGroup(
      'poskytovatel',
      {
        type: 'string',
        title: 'Poskytovateľ kolobežky',
        required: true,
        items: [
          { value: 'bolt', label: 'Bolt' },
          { value: 'dott', label: 'Dott' },
          { value: 'svist', label: 'Svišť' },
        ],
      },
      {
        variant: 'boxed',
        orientations: 'column',
        size: 'medium',
      },
    ),
    input(
      'adresaPodnetu',
      {
        title: 'Adresa podnetu',
        type: 'text',
        required: true,
      },
      {
        helptext: 'Vyplňte ulicu a číslo',
        size: 'medium',
      },
    ),
    input(
      'identifikacnyKod',
      {
        title: 'Identifikačný kód kolobežky',
        type: 'text',
        required: false,
      },
      {
        helptext: 'Cca 4-miestne číslo. Nachádza sa [doplniť kde sa nachádza]',
        helptextMarkdown: true,
        size: 'medium',
      },
    ),
    fileUploadMultiple(
      'fotografia',
      {
        title: 'Fotografia podnetu',
        required: false,
      },
      {
        type: 'dragAndDrop',
        helptext: 'Nahrajte fotografiu kolobežky alebo lokality, ktorej sa podnet týka',
        size: 'medium',
      },
    ),
  ]),
])

type ExtractProviderFormData = {
  podnet: {
    poskytovatel: 'bolt' | 'dott' | 'svist'
  }
}

export const nahlaseniePodnetuKElektrickymKolobezkamExtractProviderAddress: SchemalessFormDataExtractor<ExtractProviderFormData> =
  {
    type: 'schemaless',
    extractFn: (formData) => {
      switch (formData.podnet.poskytovatel) {
        case 'bolt':
          return 'boltskba@bolt.eu'
        case 'dott':
          return 'bratislava@ridedott.com'
        case 'svist':
          return 'bratislava@svist.sk'
      }
    },
  }

type ExtractMunicipalityFormData = {
  podnet: {
    adresaPodnetu: string
  }
}

export const nahlaseniePodnetuKElektrickymKolobezkamExtractMunicipalityAddress: SchemalessFormDataExtractor<ExtractMunicipalityFormData> =
  {
    type: 'schemaless',
    extractFn: (formData) => {
      return 'inovacie.bratislava@gmail.com' // TODO implement municipality email extraction by address field
    },
  }

type ExtractTypeFormData = {
  podnet: {
    typPodnetu: 'nespravneZaparkovana' | 'neschopnaPrevadzky' | 'ine'
  }
}

const extractTechnicalSubjectFn = (formData: ExtractTypeFormData) => {
  if (formData.podnet.typPodnetu === 'nespravneZaparkovana') {
    return 'Kolobežky: nesprávne zaparkovaná'
  }
  if (formData.podnet.typPodnetu === 'neschopnaPrevadzky') {
    return 'Kolobežky: neschopná prevádzky'
  }
  if (formData.podnet.typPodnetu === 'ine') {
    return 'Kolobežky: iné'
  }

  return 'Kolobežky: podnet'
}

export const nahlaseniePodnetuKElektrickymKolobezkamExtractTechnicalSubject: SchemalessFormDataExtractor<ExtractTypeFormData> =
  {
    type: 'schemaless',
    extractFn: extractTechnicalSubjectFn,
  }

import { createCondition } from '../../generator/helpers'
import { select } from '../../generator/functions/select'
import { input } from '../../generator/functions/input'
import { radioGroup } from '../../generator/functions/radioGroup'
import { textArea } from '../../generator/functions/textArea'
import { step } from '../../generator/functions/step'
import { conditionalFields } from '../../generator/functions/conditionalFields'
import { schema } from '../../generator/functions/schema'
import { fileUploadMultiple } from '../../generator/functions/fileUploadMultiple'
import { SchemalessFormDataExtractor } from '../../form-utils/evaluateFormDataExtractor'
import type { GenericObjectType } from '@rjsf/utils' with {
  'resolution-mode': 'import',
}

const kategorieVyzadujuceCisloZiadosti = [
  'ziadostOParkovaciuKartu',
  'zmenaZrusenieParkovacejKarty',
  'upozornenieONespravnomParkovani',
  'rozkazOUlozeniSankcie',
  'parkovacieListky',
]

export default schema({ title: 'Kontaktný formulár PAAS' }, [
  step('udaje', { title: 'Údaje' }, [
    select(
      'kategoria',
      {
        title: 'Kategória',
        required: true,
        items: [
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
        ],
      },
      { placeholder: 'Vyberte zo zoznamu' },
    ),
    conditionalFields(
      createCondition([[['kategoria'], { enum: kategorieVyzadujuceCisloZiadosti }]]),
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
    fileUploadMultiple('prilohy', { title: 'Prílohy' }, { type: 'dragAndDrop' }),
    input(
      'menoPriezviskoObchodneMeno',
      { type: 'text', title: 'Meno a priezvisko / Obchodné meno', required: true },
      { helptext: 'Ak ste právnická osoba alebo podnikateľ, uveďte obchodné meno.' },
    ),
    radioGroup(
      'sposobKontaktovania',
      {
        type: 'string',
        title: 'Ako vás máme kontaktovať?',
        required: true,
        items: [
          { value: 'email', label: 'E-mailom', isDefault: true },
          { value: 'telefon', label: 'Telefonicky' },
        ],
      },
      { variant: 'boxed', orientations: 'column' },
    ),
    conditionalFields(createCondition([[['sposobKontaktovania'], { const: 'email' }]]), [
      input('email', { title: 'E-mail', required: true, type: 'email' }, {}),
    ]),
    conditionalFields(createCondition([[['sposobKontaktovania'], { const: 'telefon' }]]), [
      input(
        'telefon',
        { type: 'ba-slovak-phone-number', title: 'Telefónne číslo', required: true },
        {
          size: 'medium',
          placeholder: '+421',
          helptext:
            'Zadajte platné slovenské telefónne číslo v tvare +421 alebo si zvoľte kontaktovanie e-mailom.',
        },
      ),
    ]),
  ]),
])

export const kontaktnyFormularPaasExtractTechnicalSubject: SchemalessFormDataExtractor<GenericObjectType> =
  {
    type: 'schemaless',
    extractFn: () => 'paas-kontaktny-formular-paas',
  }

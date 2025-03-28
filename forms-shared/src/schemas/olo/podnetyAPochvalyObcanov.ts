import { createCondition } from '../../generator/helpers'
import { GenericObjectType } from '@rjsf/utils'
import { safeString } from '../../form-utils/safeData'
import { input } from '../../generator/functions/input'
import { radioGroup } from '../../generator/functions/radioGroup'
import { textArea } from '../../generator/functions/textArea'
import { checkboxGroup } from '../../generator/functions/checkboxGroup'
import { datePicker } from '../../generator/functions/datePicker'
import { step } from '../../generator/functions/step'
import { conditionalFields } from '../../generator/functions/conditionalFields'
import { schema } from '../../generator/functions/schema'
import { fileUploadMultiple } from '../../generator/functions/fileUploadMultiple'
import { match } from 'ts-pattern'

export default schema({ title: 'Podnety a pochvaly občanov' }, {}, [
  step('podnet', { title: 'Podať podnet' }, [
    radioGroup(
      'kategoriaPodnetu',
      {
        type: 'string',
        title: 'Kategória podnetu',
        required: true,
        items: [
          { value: 'nevykonanyOdvoz', label: 'Nevykonaný odvoz' },
          { value: 'pracovniciOLO', label: 'Pracovníci OLO' },
          { value: 'poskodenaNadoba', label: 'Poškodená nádoba' },
          { value: 'pochvala', label: 'Pochvala' },
          { value: 'ine', label: 'Iné' },
        ],
      },
      {
        variant: 'boxed',
        orientations: 'column',
      },
    ),
    conditionalFields(createCondition([[['kategoriaPodnetu'], { const: 'nevykonanyOdvoz' }]]), [
      datePicker(
        'terminNevykonaniaOdvozuOdpadu',
        {
          title: 'Presný termín nevykonania odvozu odpadu',
          required: true,
        },
        {},
      ),
      checkboxGroup(
        'druhOdpadu',
        {
          title: 'Vyberte druh odpadu',
          required: true,
          items: [
            { value: 'zmesovyKomunalnyOdpad', label: 'Zmesový komunálny odpad' },
            {
              value: 'kuchynskyBiologickyRozlozitelnyOdpad',
              label: 'Kuchynský biologicky rozložiteľný odpad',
            },
            { value: 'biologickyRozlozitelnyOdpad', label: 'Biologicky rozložiteľný odpad' },
            { value: 'jedleOlejeATuky', label: 'Jedlé oleje a tuky' },
            { value: 'papier', label: 'Papier' },
            {
              value: 'plastyKovoveObalyANapojoveKartony',
              label: 'Plasty/Kovové obaly a nápojové kartóny',
            },
            { value: 'sklo', label: 'Sklo' },
          ],
        },
        {
          variant: 'boxed',
          helptext: 'Vyberte aspoň jednu možnosť',
        },
      ),
    ]),
    conditionalFields(createCondition([[['kategoriaPodnetu'], { const: 'pracovniciOLO' }]]), [
      datePicker(
        'datumCasUdalosti',
        {
          title: 'Dátum a orientačný čas vzniknutej udalosti',
          required: true,
        },
        {},
      ),
    ]),
    ...(['pracovniciOLO', 'poskodenaNadoba', 'pochvala', 'nevykonanyOdvoz'] as const).map(
      (kategoriaPodnetu) =>
        conditionalFields(createCondition([[['kategoriaPodnetu'], { const: kategoriaPodnetu }]]), [
          input(
            'adresa',
            {
              type: 'text',
              title: match(kategoriaPodnetu)
                .with('pracovniciOLO', () => 'Adresa, kde sa pracovníci nachádzali')
                .with('poskodenaNadoba', () => 'Presná adresa miesta poškodenej nádoby')
                .with('pochvala', () => 'Adresa')
                .with('nevykonanyOdvoz', () => 'Presná adresa miesta odvozu')
                .exhaustive(),
              required: true,
            },
            {
              helptext: 'Vyplňte vo formáte ulica a číslo',
            },
          ),
        ]),
    ),
    input('meno', { type: 'text', title: 'Meno', required: true }, { selfColumn: '2/4' }),
    input(
      'priezvisko',
      { type: 'text', title: 'Priezvisko', required: true },
      { selfColumn: '2/4' },
    ),
    input(
      'telefon',
      { type: 'ba-phone-number', title: 'Telefónne číslo', required: true },
      { size: 'medium', helptext: 'Vyplňte vo formáte +421' },
    ),
    input('email', { title: 'Email', required: true, type: 'email' }, {}),
    textArea('sprava', { title: 'Správa', required: true }, { helptext: 'Napíšte svoje podnety' }),
    fileUploadMultiple(
      'prilohy',
      {
        title: 'Prílohy',
        required: false,
      },
      {
        type: 'dragAndDrop',
      },
    ),
  ]),
])

export const podnetyAPochvalyObcanovExtractEmail = (formData: GenericObjectType) =>
  safeString(formData.podnet?.email)

export const podnetyAPochvalyObcanovExtractName = (formData: GenericObjectType) =>
  safeString(formData.podnet?.meno)

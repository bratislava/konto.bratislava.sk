import { createCondition, createStringItems } from '../../generator/helpers'
import { sharedPhoneNumberField } from '../shared/fields'
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

export default schema({ title: 'Podnety a pochvaly občanov' }, {}, [
  step('podnet', { title: 'Podať podnet' }, [
    radioGroup(
      'kategoriaPodnetu',
      {
        type: 'string',
        title: 'Kategória podnetu',
        required: true,
        items: createStringItems(
          ['Nevykonaný odvoz', 'Pracovníci OLO', 'Poškodená nádoba', 'Pochvala', 'Iné'],
          false,
        ),
      },
      {
        variant: 'boxed',
        orientations: 'column',
      },
    ),
    conditionalFields(createCondition([[['kategoriaPodnetu'], { const: 'Nevykonaný odvoz' }]]), [
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
          items: createStringItems(
            [
              'Zmesový komunálny odpad',
              'Kuchynský biologicky rozložiteľný odpad',
              'Biologicky rozložiteľný odpad',
              'Jedlé oleje a tuky',
              'Papier',
              'Plasty/Kovové obaly a nápojové kartóny',
              'Sklo',
            ],
            false,
          ),
        },
        {
          variant: 'boxed',
          helptext: 'Vyberte aspoň jednu možnosť',
        },
      ),
      input(
        'adresaMiestaOdvozu',
        {
          type: 'text',
          title: 'Presná adresa miesta odvozu',
          required: true,
        },
        {
          helptext: 'Vyplňte vo formáte ulica a číslo',
        },
      ),
    ]),
    conditionalFields(createCondition([[['kategoriaPodnetu'], { const: 'Pracovníci OLO' }]]), [
      datePicker(
        'datumCasUdalosti',
        {
          title: 'Dátum a orientačný čas vzniknutej udalosti',
          required: true,
        },
        {},
      ),
    ]),
    input('meno', { type: 'text', title: 'Meno', required: true }, {}),
    input('priezvisko', { type: 'text', title: 'Priezvisko', required: true }, {}),
    sharedPhoneNumberField('telefon', true),
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

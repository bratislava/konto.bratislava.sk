import {
  checkbox,
  checkboxGroup,
  conditionalFields,
  datePicker,
  fileUpload,
  input,
  schema,
  step,
  textArea,
} from '../../generator/functions'
import { createCondition, createStringOptions } from '../../generator/helpers'
import { sharedPhoneNumberField } from '../shared/fields'

export default schema({ title: 'Podnety a pochvaly občanov' }, {}, [
  step('podnet', { title: 'Podať podnet' }, [
    checkboxGroup(
      'kategoriaPodnetu',
      {
        title: 'Kategória podnetu',
        required: true,
        options: createStringOptions(
          ['Nevykonaný odvoz', 'Pracovníci OLO', 'Poškodená nádoba', 'Iné', 'Pochvala'],
          false,
        ),
      },
      {
        variant: 'boxed',
        helptextHeader: 'Vyberte aspoň jednu možnosť',
      },
    ),
    conditionalFields(
      createCondition([[['kategoriaPodnetu'], { contains: { const: 'Nevykonaný odvoz' } }]]),
      [
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
            options: createStringOptions(
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
            helptextHeader: 'Vyberte aspoň jednu možnosť',
          },
        ),
        input(
          'adresaMiestaOdvozu',
          {
            type: 'text',
            title: 'Presná adresa miesta odvozu',
            required: true,
          },
          {},
        ),
      ],
    ),
    conditionalFields(
      createCondition([[['kategoriaPodnetu'], { contains: { const: 'Pracovníci OLO' } }]]),
      [
        datePicker(
          'datumCasUdalosti',
          {
            title: 'Dátum a orientačný čas vzniknutej udalosti',
            required: true,
          },
          {},
        ),
      ],
    ),
    input('meno', { type: 'text', title: 'Meno', required: true }, {}),
    input('priezvisko', { type: 'text', title: 'Priezvisko', required: true }, {}),
    sharedPhoneNumberField('telefon', true),
    input('email', { title: 'Email', required: true, type: 'email' }, {}),
    textArea('sprava', { title: 'Správa', required: true }, {}),
    fileUpload(
      'prilohy',
      {
        title: 'Prílohy',
        required: false,
        multiple: true,
      },
      {
        type: 'dragAndDrop',
      },
    ),
    checkbox(
      'suhlasSOchranouOsobnychUdajov',
      {
        title: 'Súhlas s ochranou osobných údajov',
        required: true,
        constValue: true,
      },
      {
        checkboxLabel:
          'Prečítal/a som si a oboznámil/a som sa s informáciami o spracúvaní osobných údajov.',
        variant: 'boxed',
        helptextHeader: 'Vaše osobné údaje používame na vybavenie vašej požiadavky.',
      },
    ),
  ]),
])

import {
  checkbox,
  customComponentsField,
  datePicker,
  input,
  object,
  radioGroup,
  schema,
  step,
  textArea,
  timePicker,
} from '../../generator/functions'
import { sharedAddressField, sharedPhoneNumberField } from '../shared/fields'
import { createStringOptions } from '../../generator/helpers'

export default schema(
  {
    title: 'OLO Taxi',
  },
  {},
  [
    step('ziadatel', { title: 'Žiadateľ' }, [
      radioGroup(
        'ziadatelTyp',
        {
          type: 'string',
          title: 'Žiadam ako',
          required: true,
          options: createStringOptions(['Fyzická osoba']),
        },
        { variant: 'boxed', orientations: 'column' },
      ),
      object(
        'menoPriezvisko',
        { required: true },
        {
          columns: true,
          columnsRatio: '1/1',
        },
        [
          input('meno', { title: 'Meno', required: true, type: 'text' }, {}),
          input('priezvisko', { title: 'Priezvisko', required: true, type: 'text' }, {}),
        ],
      ),
      sharedAddressField('adresaTrvalehoPobytu', 'Adresa trvalého pobytu', true),
      sharedPhoneNumberField('telefon', true),
      input('email', { title: 'E-mail', required: true, type: 'email' }, {}),
    ]),
    step('sluzba', { title: 'Služba' }, [
      input(
        'miestoDodania',
        {
          type: 'text',
          title: 'Miesto dodania / výkonu služby',
          required: true,
        },
        {
          placeholder: 'Zadajte presnú adresu',
          helptextHeader: 'Vyplňte vo formáte ulica a číslo',
        },
      ),
      datePicker(
        'preferovanyDatumOdvozu',
        {
          title: 'Preferovaný dátum odvozu',
          required: true,
        },
        {
          helptextHeader:
            'Vami zvolený dátum má iba informačný charakter. Objednávku je potrebné podať minimálne 2 pracovné dni pred zvoleným termínom. V prípade, ak vami zvolený termín nebude voľný, budeme vás kontaktovať.',
        },
      ),
      timePicker(
        'preferovanyCasOdvozu',
        {
          title: 'Preferovaný čas odvozu',
          required: true,
        },
        {
          helptextHeader:
            '7:00  (Pon - Sob); 9:00 (Pon - Sob); 11:00 (Pon - Sob); 13:00 (Pon - Pia)',
        },
      ),
      textArea(
        'mnozstvoADruhOdpadu',
        {
          title: 'Množstvo a druh odpadu',
          required: true,
        },
        {
          helptextHeader: 'Špecifikujte druh odpadu, uveďte počet kusov alebo množstvo v m³.',
        },
      ),
      checkbox(
        'suhlasSDarom',
        {
          title: 'Vyjadrenie súhlasu s platbou',
          required: true,
          constValue: true,
        },
        {
          checkboxLabel: 'Súhlasím s platbou za službu OLO Taxi',
          variant: 'boxed',
        },
      ),
    ]),
    step('suhlasy', { title: 'Súhlasy' }, [
      checkbox(
        'suhlas',
        {
          title: 'Súhlas s TODO',
          required: true,
          constValue: true,
        },
        {
          checkboxLabel: 'Súhlasím s TODO',
          variant: 'boxed',
        },
      ),
      customComponentsField(
        {
          type: 'additionalLinks',
          props: {
            links: [
              {
                title: 'TODO',
                href: 'https://olo.sk',
              },
            ],
          },
        },
        {},
      ),
    ]),
  ],
)

import { input, object } from '../../generator/functions'

/**
 * Create phone number input field consitent with all forms.
 */
export const sharedPhoneNumberField = (property: string, required: boolean, helptext?: string) =>
  input(
    property,
    { title: 'Telefónne číslo', required, type: 'tel' },
    { size: 'medium', placeholder: '+421', helptext },
  )

/**
 * Create address input fields.
 */
export const sharedAddressField = (property: string, title: string, required: boolean) =>
  object(property, { required }, { objectDisplay: 'boxed', title }, [
    input('ulicaACislo', { title: 'Ulica a číslo', required, type: 'text' }, {}),
    object(
      'mestoPsc',
      { required: true },
      {
        columns: true,
        columnsRatio: '3/1',
      },
      [
        input('mesto', { title: 'Mesto', required: true }, {}),
        input('psc', { title: 'PSČ', required: true, format: 'zip' }, {}),
      ],
    ),
  ])

import { input } from '../../generator/functions/input'
import { object } from '../../generator/object'

/**
 * Create phone number input field consistent with all forms.
 */
export const sharedPhoneNumberField = (property: string, required: boolean, helptext?: string) =>
  input(
    property,
    { type: 'ba-phone-number', title: 'Telefónne číslo', required },
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
        input('mesto', { type: 'text', title: 'Mesto', required: true }, {}),
        input('psc', { type: 'ba-slovak-zip', title: 'PSČ', required: true }, {}),
      ],
    ),
  ])

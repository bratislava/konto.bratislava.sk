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
  object(property, { objectDisplay: 'boxed', title }, [
    input('ulicaACislo', { title: 'Ulica a číslo', required, type: 'text' }, {}),
    object('mestoPsc', {}, [
      input('mesto', { type: 'text', title: 'Mesto', required: true }, { selfColumn: '3/4' }),
      input('psc', { type: 'ba-slovak-zip', title: 'PSČ', required: true }, { selfColumn: '1/4' }),
    ]),
  ])

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator'
import { isValidBirthNumber } from '../birthNumbers'

export function IsBirthNumber(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isBirthNumber',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments): boolean {
          return <boolean>(
            typeof value === 'string' &&
            value.match('^[0-9]*$') &&
            isValidBirthNumber(value)
          )
        },
      },
    })
  }
}

export function IsIdentityCard(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isIdentityCard',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (value.length < 8 || value.length > 9) {
            return false
          }
          const text = value.substring(0, 2)
          const numbers = value.substring(2, 8)
          return typeof value === 'string' && numbers.match(/^[0-9]*$/) && text.match(/^[a-zA-Z]+$/)
        },
      },
    })
  }
}

export function IsIco(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isIco',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments): boolean {
          return <boolean>(
            typeof value === 'string' &&
            value.match('^[0-9]*$') &&
            value.length >= 6 &&
            value.length <= 8
          )
        },
      },
    })
  }
}
/* eslint-enable @typescript-eslint/no-unused-vars */
/* eslint-enable @typescript-eslint/no-explicit-any */

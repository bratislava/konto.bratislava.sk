import { registerDecorator, ValidationOptions } from 'class-validator'

import { isValidBirthNumber } from '../birthNumbers'

const DIGITS_ONLY_REGEX = /^\d*$/

export function IsBirthNumber(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isBirthNumber',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          return (
            typeof value === 'string' && DIGITS_ONLY_REGEX.test(value) && isValidBirthNumber(value)
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
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string' || value.length < 8 || value.length > 9) {
            return false
          }
          const text = value.substring(0, 2)
          const numbers = value.substring(2, 8)
          return DIGITS_ONLY_REGEX.test(numbers) && /^[a-zA-Z]+$/.test(text)
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
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          return (
            typeof value === 'string' &&
            DIGITS_ONLY_REGEX.test(value) &&
            value.length >= 6 &&
            value.length <= 8
          )
        },
      },
    })
  }
}

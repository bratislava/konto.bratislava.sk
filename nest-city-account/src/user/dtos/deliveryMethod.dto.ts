import { ApiProperty } from '@nestjs/swagger'
import {
  IsDate,
  IsEnum,
  IsObject,
  IsOptional,
  registerDecorator,
  ValidateNested,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator'
import { Type } from 'class-transformer'
import { DeliveryMethodEnum } from '@prisma/client'

/**
 * Decorator that enforces a property to be required when the delivery method is set to CITY_ACCOUNT.
 *
 * @param {ValidationOptions} [validationOptions] - Additional validation options to customize the behavior of the decorator.
 * @return {PropertyDecorator} A decorator function that validates the specified property based on the given conditions.
 */
function IsRequiredForCityAccount(validationOptions?: ValidationOptions): PropertyDecorator {
  return function (target: object, propertyName: string | symbol) {
    registerDecorator({
      name: 'isRequiredForCityAccount',
      target: target.constructor,
      propertyName: propertyName as string,
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments): boolean {
          const obj = args.object as DeliveryMethodDto
          if (obj.deliveryMethod === DeliveryMethodEnum.CITY_ACCOUNT) {
            return value !== null && value !== undefined && value !== ''
          }
          return true
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} is required when delivery method is CITY_ACCOUNT`
        },
      },
    })
  }
}

// Single unified delivery method class with validation
export class DeliveryMethodDto {
  @ApiProperty({
    description: 'Delivery method',
    enum: DeliveryMethodEnum,
  })
  @IsEnum(DeliveryMethodEnum)
  deliveryMethod!: DeliveryMethodEnum

  @ApiProperty({
    description: 'Date (required for CITY_ACCOUNT method)',
    type: Date,
    required: false,
    example: '2025-12-01T00:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsRequiredForCityAccount()
  date?: Date
}

export class DeliveryMethodActiveAndLockedDto {
  @ApiProperty({
    description: 'Active delivery method',
    type: DeliveryMethodDto,
    required: false,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DeliveryMethodDto)
  active?: DeliveryMethodDto

  @ApiProperty({
    description: 'Delivery method at lock date this year.',
    type: DeliveryMethodDto,
    required: false,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DeliveryMethodDto)
  locked?: DeliveryMethodDto
}

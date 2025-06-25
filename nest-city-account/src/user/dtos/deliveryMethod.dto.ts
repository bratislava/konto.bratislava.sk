import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import {
  IsDate,
  IsEnum,
  IsObject,
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
 * @return {Function} A decorator function that validates the specified property based on the given conditions.
 */
function IsRequiredForCityAccount(validationOptions?: ValidationOptions): Function {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isRequiredForCityAccount',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj = args.object as DeliveryMethodDto;
          return obj.deliveryMethod !== DeliveryMethodEnum.CITY_ACCOUNT || (value !== null && value !== undefined);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} is required when delivery method is CITY_ACCOUNT`;
        }
      }
    });
  };
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
  })
  @IsDate()
  @IsRequiredForCityAccount()
  date?: Date
}

export class DeliveryMethodActiveAndLocked {
  @ApiProperty({
    description: 'Active delivery method',
    type: DeliveryMethodDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => DeliveryMethodDto)
  active: DeliveryMethodDto

  @ApiProperty({
    description: 'Delivery method at lock date this year.',
    type: DeliveryMethodDto,
    required: false,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => DeliveryMethodDto)
  locked?: DeliveryMethodDto
}

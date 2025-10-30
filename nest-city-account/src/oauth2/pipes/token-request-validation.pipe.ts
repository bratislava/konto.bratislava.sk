import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
  Type,
} from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { TokenRequestDto, RefreshTokenRequestDto } from '../dtos/requests.oauth2.dto'

/**
 * Custom validation pipe for OAuth2 token endpoint
 * Validates request body based on grant_type field
 */
@Injectable()
export class TokenRequestValidationPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async transform(value: unknown, _metadata: ArgumentMetadata) {
    // Determine which DTO to validate against based on grant_type
    const grantType =
      typeof value === 'object' && value !== null && 'grant_type' in value
        ? (value as { grant_type?: string }).grant_type
        : undefined

    let DtoClass: Type<TokenRequestDto | RefreshTokenRequestDto>
    if (grantType === 'authorization_code') {
      DtoClass = TokenRequestDto
    } else if (grantType === 'refresh_token') {
      DtoClass = RefreshTokenRequestDto
    } else {
      throw new BadRequestException(
        `Invalid or missing grant_type. Must be 'authorization_code' or 'refresh_token'`
      )
    }

    // Transform plain object to class instance
    const object = plainToInstance(DtoClass, value)

    // Validate the object
    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: false,
    })

    if (errors.length > 0) {
      const errorMessages = errors.map((error) => {
        return Object.values(error.constraints || {}).join(', ')
      })
      throw new BadRequestException(`Validation failed: ${errorMessages.join('; ')}`)
    }

    return object
  }
}

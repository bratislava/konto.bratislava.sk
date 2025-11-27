import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { CognitoUserAccountTypesEnum } from '../../utils/global-dtos/cognito.dto'

export class DpbUserDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  email!: string

  @ApiPropertyOptional({
    description: 'Is email verified in cognito?',
    example: 'true',
  })
  email_verified?: string

  @ApiProperty({
    description: 'Account type',
    enum: CognitoUserAccountTypesEnum,
    example: CognitoUserAccountTypesEnum.PHYSICAL_ENTITY,
  })
  account_type!: CognitoUserAccountTypesEnum

  @ApiPropertyOptional({
    description: 'Name (usually company name for legal entities)',
    example: 'Company s.r.o.',
  })
  name?: string

  @ApiPropertyOptional({
    description: 'Given name (first name)',
    example: 'Jožko',
  })
  given_name?: string

  @ApiPropertyOptional({
    description: 'Family name (last name)',
    example: 'Bratislavský',
  })
  family_name?: string
}

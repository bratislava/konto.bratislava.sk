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
    enumName: 'CognitoUserAccountTypesEnum',
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

export class DPBUserLoginStatistics {
  @ApiProperty({
    description: 'Number of times the user has logged in',
    example: 5,
  })
  loginCount!: number

  @ApiProperty({
    description: 'Date of first login',
    example: '2024-01-15T10:30:00.000Z',
  })
  firstLogin!: Date

  @ApiProperty({
    description: 'Date of latest login',
    example: '2024-02-20T14:45:00.000Z',
  })
  latestLogin!: Date

  @ApiProperty({
    name: 'id',
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  id: string
}

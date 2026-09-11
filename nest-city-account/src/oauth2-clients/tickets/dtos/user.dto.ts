import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { CognitoUserAttributesTierEnum } from '../../../generated/prisma/client'
import { CognitoUserAccountTypesEnum } from '../../../utils/global-dtos/cognito.dto'

export class TicketsUserDto {
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
  emailVerified?: string

  @ApiProperty({
    description: 'Account type',
    enum: CognitoUserAccountTypesEnum,
    enumName: 'CognitoUserAccountTypesEnum',
    example: CognitoUserAccountTypesEnum.PHYSICAL_ENTITY,
  })
  accountType!: CognitoUserAccountTypesEnum

  @ApiPropertyOptional({
    description: 'Name (usually company name for legal entities)',
    example: 'Company s.r.o.',
  })
  name?: string

  @ApiPropertyOptional({
    description: 'First name (given name)',
    example: 'Jožko',
  })
  firstName?: string

  @ApiPropertyOptional({
    description: 'Last name (family name)',
    example: 'Bratislavský',
  })
  lastName?: string

  @ApiPropertyOptional({
    description: 'Current verification tier of the authenticated user',
    enum: CognitoUserAttributesTierEnum,
    enumName: 'CognitoUserAttributesTierEnum',
    example: CognitoUserAttributesTierEnum.IDENTITY_CARD,
  })
  verificationState?: CognitoUserAttributesTierEnum
}

import { ApiProperty } from '@nestjs/swagger'
import { CognitoUserAccountTypesEnum } from '../../utils/global-dtos/cognito.dto'

export class UserContactAndIdInfoDto {
  @ApiProperty({
    description: 'External ID from Cognito',
    example: '9e7791b2-787b-4b93-8473-94a70a516025',
  })
  externalId!: string

  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com',
    required: false,
  })
  email?: string

  @ApiProperty({
    description: 'First name',
    example: 'John',
    required: false,
  })
  firstName?: string

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
    required: false,
  })
  lastName?: string

  @ApiProperty({
    description: 'Birth number',
    example: '0011223344',
    required: false,
  })
  birthNumber?: string

  @ApiProperty({
    description: 'Account type from Cognito',
    enum: CognitoUserAccountTypesEnum,
    example: CognitoUserAccountTypesEnum.PHYSICAL_ENTITY,
  })
  accountType!: CognitoUserAccountTypesEnum
}

export class LegalPersonContactAndIdInfoDto {
  @ApiProperty({
    description: 'External ID from Cognito',
    example: '9e7791b2-787b-4b93-8473-94a70a516025',
  })
  externalId!: string

  @ApiProperty({
    description: 'Email address',
    example: 'company@example.com',
    required: false,
  })
  email?: string

  @ApiProperty({
    description: 'Company name',
    example: 'Company Name, s. r. o.',
    required: false,
  })
  name?: string

  @ApiProperty({
    description: 'ICO (Company identification number)',
    example: '12345678',
    required: false,
  })
  ico?: string

  @ApiProperty({
    description: 'Account type from Cognito',
    enum: CognitoUserAccountTypesEnum,
    example: CognitoUserAccountTypesEnum.LEGAL_ENTITY,
  })
  accountType!: CognitoUserAccountTypesEnum
}

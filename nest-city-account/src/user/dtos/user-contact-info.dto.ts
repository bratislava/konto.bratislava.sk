import { ApiProperty } from '@nestjs/swagger'
import { CognitoUserAccountTypesEnum } from '../../utils/global-dtos/cognito.dto'
abstract class BaseContactAndIdInfoResponseDto {
  @ApiProperty({
    description: 'External ID from Cognito',
    example: '9e7791b2-787b-4b93-8473-94a70a516025',
  })
  externalId!: string

  @ApiProperty({
    description: 'Account type from Cognito',
    enum: CognitoUserAccountTypesEnum,
    enumName: 'ContactAndIdInfoTypeEnum',
  })
  accountType!: CognitoUserAccountTypesEnum

  @ApiProperty({
    description: 'Email address',
    required: false,
    example: 'user@example.com',
  })
  email?: string
}

export class UserContactAndIdInfoResponseDto extends BaseContactAndIdInfoResponseDto {
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
}

export class LegalPersonContactAndIdInfoResponseDto extends BaseContactAndIdInfoResponseDto {
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
}

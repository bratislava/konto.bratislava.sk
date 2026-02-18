import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator'
import { IsBirthNumber } from '../../utils/decorators/validation.decorators'

export class VerificationDataForUser {
  @ApiProperty({
    description: 'Id of the user in cognito.',
    example: 'a86bdfb7-7134-4dc2-b49b-1bc051d3825b',
  })
  @IsString()
  @IsUUID()
  userId!: string

  @ApiProperty({
    description: 'userBirthNumber',
    default: '8808080000',
  })
  @IsNotEmpty()
  @IsBirthNumber({
    message: 'Text must be birthnumber without slash (9 or 10 characters) and Only numbers ',
  })
  birthNumber!: string

  @ApiProperty({
    description: 'Id card used for verification.',
    example: 'AA123123',
  })
  @IsString()
  idCard!: string

  @ApiPropertyOptional({
    description: 'Ico used for verification.',
    example: '65451354',
  })
  @IsString()
  ico?: string

  @ApiProperty({
    description: 'Created timestamp',
    default: '2023-02-10T10:31:49.247Z',
  })
  verifyStart!: Date
}

export class VerificationDataForUserResponseDto {
  @ApiProperty({
    description: 'Id of the user in cognito.',
    example: 'a86bdfb7-7134-4dc2-b49b-1bc051d3825b',
  })
  @IsString()
  @IsNotEmpty()
  externalId!: string | null

  @ApiProperty({
    description: 'Email of the user.',
    example: 'test@bratislava.sk',
  })
  @IsEmail()
  email!: string | null

  @ApiProperty({
    type: [VerificationDataForUser],
    description:
      'Verification data for the user in the last month. Ordered by start date descending.',
  })
  verificationDataLastMonth!: VerificationDataForUser[]
}

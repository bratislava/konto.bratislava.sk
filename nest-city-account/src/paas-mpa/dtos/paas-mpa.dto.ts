import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { CognitoUserAttributesTierEnum } from '@prisma/client'
import { IsNotEmpty, IsString } from 'class-validator'

export class PaasMpaRegisterRequestDto {
  @ApiProperty({
    description: 'Phone number received from MPA',
    example: '+421900000000',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber!: string
}

export enum PaasMpaRegisterStatusEnum {
  SUCCESS = 'SUCCESS',
  NOT_VERIFIED = 'NOT_VERIFIED',
  IDENTIFIERS_NOT_FOUND = 'IDENTIFIERS_NOT_FOUND',
  BLOOMREACH_CONTACT_ID_UNAVAILABLE = 'BLOOMREACH_CONTACT_ID_UNAVAILABLE',
  BLOOMREACH_SYNC_FAILED = 'BLOOMREACH_SYNC_FAILED',
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
}

export class PaasMpaRegisterResponseDto {
  @ApiProperty({
    description: 'Result of PAAS-MPA Bloomreach registration attempt',
    enum: PaasMpaRegisterStatusEnum,
    enumName: 'PaasMpaRegisterStatusEnum',
    example: PaasMpaRegisterStatusEnum.SUCCESS,
  })
  status!: PaasMpaRegisterStatusEnum

  @ApiPropertyOptional({
    description: 'Current verification tier of the authenticated user',
    enum: CognitoUserAttributesTierEnum,
    enumName: 'CognitoUserAttributesTierEnum',
    example: CognitoUserAttributesTierEnum.IDENTITY_CARD,
  })
  verificationState?: CognitoUserAttributesTierEnum

  @ApiPropertyOptional({
    description: 'Bloomreach hard ID (`contact_id`) for the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  bloomreachContactId?: string
}

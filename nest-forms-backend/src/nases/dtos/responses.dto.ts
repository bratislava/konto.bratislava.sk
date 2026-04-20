import { HttpStatus } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsString, ValidateNested } from 'class-validator'

export interface NasesSendResponse {
  status: HttpStatus
  data: unknown
}

class ValidateFormRegistrationDto {
  @ApiProperty({ description: 'Form slug' })
  @IsString()
  slug: string

  @ApiProperty({ description: 'POSP ID' })
  @IsString()
  pospID: string

  @ApiProperty({ description: 'POSP Version' })
  @IsString()
  pospVersion: string
}

export class ValidateFormRegistrationsResultDto {
  @ApiProperty({
    type: [ValidateFormRegistrationDto],
    description: 'Forms not found',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValidateFormRegistrationDto)
  'not-found': ValidateFormRegistrationDto[]

  @ApiProperty({
    type: [ValidateFormRegistrationDto],
    description: 'Forms not published',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValidateFormRegistrationDto)
  'not-published': ValidateFormRegistrationDto[]

  @ApiProperty({
    type: [ValidateFormRegistrationDto],
    description: 'Forms with errors',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValidateFormRegistrationDto)
  error: ValidateFormRegistrationDto[]

  @ApiProperty({
    type: [ValidateFormRegistrationDto],
    description: 'Valid forms',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValidateFormRegistrationDto)
  valid: ValidateFormRegistrationDto[]
}

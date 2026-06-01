import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDate, IsDefined, IsOptional, IsString } from 'class-validator'

export class TowingSearchQueryDto {
  @ApiProperty({
    description: 'Token returned by Cloudflare Turnstile captcha. Required to prevent abuse.',
    example: '',
  })
  @IsString()
  turnstileToken!: string
}

/**
 * Public towing activity report returned by this API.
 *
 * The structure mirrors `TowPublicSearchDto` from `nest-enforcement-backend`
 * (`loadingDate`, `loadingLocation`, `towReason`, ...). Keep this DTO aligned
 * with the upstream contract to avoid response-shape drift.
 */
export class TowingSearchResponseDto {
  @ApiProperty({ description: 'Date when the vehicle was towed' })
  @IsDefined()
  @IsDate()
  @Type(() => Date)
  loadingDate!: Date

  @ApiProperty({ description: 'Pickup location - where the vehicle was towed from' })
  @IsDefined()
  @IsString()
  loadingLocation!: string

  @ApiPropertyOptional({ description: 'Reason for towing' })
  @IsOptional()
  @IsString()
  towReason?: string

  @ApiPropertyOptional({ description: 'Dropoff location - where the vehicle was relocated to' })
  @IsOptional()
  @IsString()
  unloadingLocation?: string

  @ApiPropertyOptional({ description: 'Reason for vehicle relocation' })
  @IsOptional()
  @IsString()
  relocationReason?: string
}

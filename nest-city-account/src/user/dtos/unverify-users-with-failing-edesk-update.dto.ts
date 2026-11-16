import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'

export const UNVERIFY_USERS_WITH_FAILING_EDESK_UPDATE_DEFAULT_LIMIT = 100
export const UNVERIFY_USERS_WITH_FAILING_EDESK_UPDATE_MAX_LIMIT = 1000
/** Same threshold as the daily `alertFailingEdeskUpdate` alert. */
export const UNVERIFY_USERS_WITH_FAILING_EDESK_UPDATE_DEFAULT_MIN_FAIL_COUNT = 7

export class UnverifyUsersWithFailingEdeskUpdateRequestDto {
  @ApiPropertyOptional({
    description:
      'When true, only reports which users would be un-verified, without changing anything.',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  dryRun?: boolean

  @ApiPropertyOptional({
    description: 'Maximum number of candidate users to check in this call.',
    default: UNVERIFY_USERS_WITH_FAILING_EDESK_UPDATE_DEFAULT_LIMIT,
    maximum: UNVERIFY_USERS_WITH_FAILING_EDESK_UPDATE_MAX_LIMIT,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(UNVERIFY_USERS_WITH_FAILING_EDESK_UPDATE_MAX_LIMIT)
  limit?: number

  @ApiPropertyOptional({
    description:
      'Only check candidates with a database id greater than this one. Pass `nextAfterUserId` from the previous response to continue.',
    example: 'a86bdfb7-7134-4dc2-b49b-1bc051d3825b',
  })
  @IsOptional()
  @IsUUID()
  afterUserId?: string

  @ApiPropertyOptional({
    description:
      'Only users whose linked PhysicalEntity failed the eDesk update at least this many times in a row.',
    default: UNVERIFY_USERS_WITH_FAILING_EDESK_UPDATE_DEFAULT_MIN_FAIL_COUNT,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  minFailCount?: number
}

export enum UnverifySkipReasonEnum {
  COGNITO_TIER_NOT_IDENTITY_CARD = 'COGNITO_TIER_NOT_IDENTITY_CARD',
  NOT_PHYSICAL_ENTITY = 'NOT_PHYSICAL_ENTITY',
}

export class UnverifySkippedUserDto {
  @ApiProperty({ description: 'Cognito id of the user' })
  @IsString()
  externalId!: string

  @ApiProperty({
    enum: UnverifySkipReasonEnum,
    enumName: 'UnverifySkipReasonEnum',
  })
  @IsEnum(UnverifySkipReasonEnum)
  reason!: UnverifySkipReasonEnum
}

export class UnverifyFailedUserDto {
  @ApiProperty({ description: 'Cognito id of the user' })
  @IsString()
  externalId!: string

  @ApiProperty({ description: 'Error message, see logs for details' })
  @IsString()
  error!: string
}

export class UnverifyUsersStatsDto {
  @ApiProperty({ description: 'Users whose PhysicalEntity has a URI' })
  @IsInt()
  withUri!: number

  @ApiProperty({ description: 'Users whose PhysicalEntity has no URI' })
  @IsInt()
  withoutUri!: number

  @ApiProperty({ description: 'Users whose current delivery preference is CITY_ACCOUNT' })
  @IsInt()
  cityAccountPreference!: number

  @ApiProperty({ description: 'Users whose delivery method locked on 1.2. is CITY_ACCOUNT' })
  @IsInt()
  cityAccountLocked!: number
}

export class UnverifyUsersWithFailingEdeskUpdateResponseDto {
  @ApiProperty()
  @IsBoolean()
  dryRun!: boolean

  @ApiProperty({
    description:
      'Cognito ids of un-verified users. In a dry run, the users that would be un-verified.',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  unverified!: string[]

  @ApiProperty({
    description: 'Counts over `unverified`',
    type: UnverifyUsersStatsDto,
  })
  @ValidateNested()
  @Type(() => UnverifyUsersStatsDto)
  stats!: UnverifyUsersStatsDto

  @ApiProperty({ type: [UnverifySkippedUserDto] })
  @ValidateNested({ each: true })
  @Type(() => UnverifySkippedUserDto)
  skipped!: UnverifySkippedUserDto[]

  @ApiProperty({ type: [UnverifyFailedUserDto] })
  @ValidateNested({ each: true })
  @Type(() => UnverifyFailedUserDto)
  failed!: UnverifyFailedUserDto[]

  @ApiPropertyOptional({
    description:
      'Database id of the last checked candidate. Pass it as `afterUserId` to continue, missing when there are no more candidates.',
  })
  @IsOptional()
  @IsUUID()
  nextAfterUserId?: string
}

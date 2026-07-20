import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class TowingSearchRequestDto {
  @ApiProperty({
    description: 'Token returned by Cloudflare Turnstile captcha. Required to prevent abuse.',
    example: '',
  })
  @IsString()
  turnstileToken!: string
}

/**
 * Reason a vehicle was towed.
 *
 * Mirrors the `TowReason` enum from `nest-enforcement-backend`. The raw enum
 * value is forwarded to clients, which are responsible for rendering a
 * human-readable (localized) label.
 */
export enum TowReason {
  RESERVED_PARKING = 'RESERVED_PARKING',
  PRIVATE_ACCESS_OBSTACLE = 'PRIVATE_ACCESS_OBSTACLE',
  PARKING_NEAR_PUBLIC_TRANSPORT_STOP = 'PARKING_NEAR_PUBLIC_TRANSPORT_STOP',
  PARKING_NEAR_PEDESTRIAN_CROSSING = 'PARKING_NEAR_PEDESTRIAN_CROSSING',
  PARKING_ON_SIDEWALK = 'PARKING_ON_SIDEWALK',
  PARKING_IN_TRAFFIC_LANE = 'PARKING_IN_TRAFFIC_LANE',
  PARKING_AT_STREET_CROSSING = 'PARKING_AT_STREET_CROSSING',
  OTHER = 'OTHER',
  TRAFFIC_FLOW_OBSTACLE = 'TRAFFIC_FLOW_OBSTACLE',
  NO_STOPPING_ZONE = 'NO_STOPPING_ZONE',
  STOPPED_AT_CROSSWALK = 'STOPPED_AT_CROSSWALK',
  NO_PARKING_ZONE = 'NO_PARKING_ZONE',
}

/**
 * Public towing activity report returned by this API.
 *
 * The structure mirrors `TowPublicSearchDto` from `nest-enforcement-backend`
 * (`loadingDate`, `loadingLocation`, `towReason`, ...). Keep this DTO aligned
 * with the upstream contract to avoid response-shape drift.
 */
export class TowingSearchResponseDto {
  @ApiProperty({
    description: 'Date when the vehicle was towed',
    type: String,
    format: 'date-time',
  })
  loadingDate!: string

  @ApiProperty({ description: 'Pickup location - where the vehicle was towed from' })
  loadingLocation!: string

  @ApiPropertyOptional({
    description: 'Reason for towing. Raw enum value - clients render the localized label.',
    enum: TowReason,
    enumName: 'TowReason',
  })
  towReason?: TowReason

  @ApiPropertyOptional({ description: 'Dropoff location - where the vehicle was relocated to' })
  unloadingLocation?: string

  @ApiPropertyOptional({ description: 'Reason for vehicle relocation' })
  relocationReason?: string
}

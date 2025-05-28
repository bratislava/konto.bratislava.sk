import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'

export class ClaimMigrationOutput {
  @ApiProperty()
  @IsBoolean()
  success!: boolean
}

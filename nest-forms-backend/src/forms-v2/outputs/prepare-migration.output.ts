import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'

export class PrepareMigrationOutput {
  @ApiProperty()
  @IsBoolean()
  success!: boolean
}

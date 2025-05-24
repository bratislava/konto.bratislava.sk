import { IsBoolean } from 'class-validator'

export class ClaimMigrationOutput {
  @IsBoolean()
  success: boolean
}

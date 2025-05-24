import { IsBoolean } from 'class-validator'

export class PrepareMigrationOutput {
  @IsBoolean()
  success: boolean
}

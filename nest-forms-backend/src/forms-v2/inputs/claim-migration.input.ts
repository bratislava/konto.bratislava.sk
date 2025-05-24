import { IsNotEmpty, IsUUID } from 'class-validator'

export class ClaimMigrationInput {
  @IsUUID()
  @IsNotEmpty()
  formId: string
}

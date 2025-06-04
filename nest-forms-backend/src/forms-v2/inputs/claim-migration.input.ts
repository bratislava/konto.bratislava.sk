import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsUUID } from 'class-validator'

export class ClaimMigrationInput {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  formId!: string
}

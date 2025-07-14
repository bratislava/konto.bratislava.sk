import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class PrepareMigrationInput {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  guestIdentityId!: string
}

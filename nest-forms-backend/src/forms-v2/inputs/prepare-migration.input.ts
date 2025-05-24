import { IsNotEmpty, IsString } from 'class-validator'

export class PrepareMigrationInput {
  @IsString()
  @IsNotEmpty()
  guestIdentityId: string
}

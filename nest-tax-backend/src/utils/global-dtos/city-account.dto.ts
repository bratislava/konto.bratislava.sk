import { ResponseUserDataDto } from 'openapi-clients/city-account'

export interface BratislavaUserDto extends ResponseUserDataDto {
  // We know that birthNumber is not null, see @BratislavaUser() decorator.
  birthNumber: string
}

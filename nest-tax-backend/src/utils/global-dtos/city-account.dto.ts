import { ResponseUserDataDto } from '../../generated-clients/nest-city-account'

export interface BratislavaUserDto extends ResponseUserDataDto {
  birthNumber: string
}

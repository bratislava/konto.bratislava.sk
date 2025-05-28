import { RfoIdentityList } from '../../../../rfo-by-birthnumber/dtos/rfoSchema'
import { ResponseErrorInternalDto } from '../../../../utils/guards/dtos/error.dto'

export type RfoDataDto = {
  statusCode: number
  data: RfoIdentityList | null
  errorData: ResponseErrorInternalDto | null
}

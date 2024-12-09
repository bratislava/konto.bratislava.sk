import { RfoIdentityList } from '../../../../rfo-by-birthnumber/dtos/rfoSchema'
import { ResponseErrorDto } from '../../../../utils/guards/dtos/error.dto'

export type RfoDataDto = {
  statusCode: number
  data: RfoIdentityList | null
  errorData: ResponseErrorDto | null
}

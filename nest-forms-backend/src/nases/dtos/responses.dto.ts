import { HttpStatus } from '@nestjs/common'

export interface NasesSendResponse {
  status: HttpStatus
  data: unknown
}

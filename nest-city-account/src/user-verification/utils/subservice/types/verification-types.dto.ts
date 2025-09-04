import { RfoIdentityList } from '../../../../rfo-by-birthnumber/dtos/rfoSchema'
import { ResponseErrorInternalDto } from '../../../../utils/guards/dtos/error.dto'
import {VerificationErrorsEnum} from "../../../verification.errors.enum";

export type RfoDataDto = {
  statusCode: number
  data: RfoIdentityList | null
  errorData: ResponseErrorInternalDto | null
}

export type VerificationResult = { success: true } | { success: false; error: VerificationErrorsEnum }
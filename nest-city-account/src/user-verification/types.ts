import { CustomErrorEnums } from '../utils/guards/dtos/error.dto'

export type VerificationSuccess = { success: true }
export type VerificationFailure = { success: false; reason: CustomErrorEnums }
export type VerificationReturnType = VerificationSuccess | VerificationFailure
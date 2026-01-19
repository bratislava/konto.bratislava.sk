import { CustomErrorEnums } from '../utils/guards/dtos/error.dto'

export type VerificationReturnType<T = void> =
  | (T extends void
      ? { success: true }
      : {
          success: true
          data: T
        })
  | { success: false; reason: CustomErrorEnums }

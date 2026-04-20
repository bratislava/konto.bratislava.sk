import { CustomErrorEnums } from '../utils/guards/dtos/error.dto'

export type VerificationReturnType<T = undefined> =
  | (T extends undefined
      ? { success: true }
      : {
          success: true
          data: T
        })
  | { success: false; reason: CustomErrorEnums }

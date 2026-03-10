import { Injectable } from '@nestjs/common'
import z from 'zod'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { CustomErrorNorisTypesEnum } from '../noris.errors'

@Injectable()
export class NorisValidatorSubservice {
  private readonly logger = new LineLoggerSubservice(NorisValidatorSubservice.name)

  constructor(private readonly throwerErrorGuard: ThrowerErrorGuard) {}

  validateNorisData<T extends z.ZodSchema>(schema: T, data: unknown[]): z.infer<T>[]
  validateNorisData<T extends z.ZodSchema>(schema: T, data: unknown): z.infer<T>
  validateNorisData<T extends z.ZodSchema>(
    schema: T,
    data: unknown | unknown[]
  ): z.infer<T> | z.infer<T>[] {
    if (Array.isArray(data)) {
      return data
        .map((item) => {
          try {
            return this.validateNorisData(schema, item)
          } catch (error) {
            this.logger.error(error)
            return undefined
          }
        })
        .filter((item): item is z.infer<T> => item !== undefined)
    }

    const result = schema.safeParse(data)
    if (!result.success) {
      throw this.throwerErrorGuard.BadRequestException(
        CustomErrorNorisTypesEnum.VALIDATE_NORIS_DATA_ERROR,
        result.error.message,
        undefined,
        result.error
      )
    }
    return result.data
  }
}

import { Injectable } from '@nestjs/common'
import z from 'zod'

import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import { CustomErrorNorisTypesEnum } from '../noris.errors'

@Injectable()
export class NorisValidatorSubservice {
  private readonly logger = new LineLoggerSubservice(
    NorisValidatorSubservice.name,
  )

  constructor(private readonly throwerErrorGuard: ThrowerErrorGuard) {}

  validateNorisData<T extends z.ZodSchema>(
    schema: T,
    data: unknown,
  ): z.infer<T> {
    const result = schema.safeParse(data)
    if (!result.success) {
      throw this.throwerErrorGuard.BadRequestException(
        CustomErrorNorisTypesEnum.VALIDATE_NORIS_DATA_ERROR,
        result.error.message,
        undefined,
        undefined,
        result.error,
      )
    }
    return result.data
  }

  validateNorisDataArray<T extends z.ZodSchema>(
    schema: T,
    data: unknown[],
  ): z.infer<T>[] {
    return data
      .map((item) => {
        try {
          return this.validateNorisData(schema, item)
        } catch (error) {
          this.logger.error(error)
          // eslint-disable-next-line unicorn/no-useless-undefined
          return undefined
        }
      })
      .filter((item): item is z.infer<T> => item !== undefined)
  }
}

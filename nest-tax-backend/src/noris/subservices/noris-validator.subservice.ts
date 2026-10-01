import { ErrorFactoryService, LineLoggerSubservice } from '@bratislava/log-nest'
import { Injectable } from '@nestjs/common'
import z from 'zod'

import { CustomErrorNorisTypesEnum } from '../noris.errors'

@Injectable()
export class NorisValidatorSubservice {
  constructor(
    private readonly errorFactoryService: ErrorFactoryService,
    private readonly logger: LineLoggerSubservice,
  ) {}

  /**
   * Validates an array of Noris records against the given schema.
   * Invalid items are logged and silently dropped — the returned array may be shorter than the input.
   * If any invalid record should fail the whole batch, use {@link validateSingleNorisData} instead.
   */
  validateNorisData<T extends z.ZodType>(
    schema: T,
    data: unknown[],
  ): z.infer<T>[] {
    return data
      .map((item) => {
        try {
          return this.validateSingleNorisData(schema, item)
        } catch (error) {
          this.logger.error(error)
          return undefined
        }
      })
      .filter((item): item is z.infer<T> => item !== undefined)
  }

  /**
   * Validates a single Noris record against the given schema.
   * Throws a `BadRequestException` if validation fails.
   */
  validateSingleNorisData<T extends z.ZodType>(
    schema: T,
    data: unknown,
  ): z.infer<T> {
    const result = schema.safeParse(data)
    if (!result.success) {
      throw this.errorFactoryService.BadRequestException({
        errorEnum: CustomErrorNorisTypesEnum.VALIDATE_NORIS_DATA_ERROR,
        message: result.error.message,
        error: result.error,
      })
    }
    return result.data
  }
}

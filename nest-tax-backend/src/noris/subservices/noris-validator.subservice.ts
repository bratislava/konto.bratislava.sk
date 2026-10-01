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
   *
   * @param logContext - logged with each failure, e.g. the year / tax type of the import.
   */
  validateNorisData<T extends z.ZodType>(
    schema: T,
    data: unknown[],
    logContext?: Record<string, unknown>,
  ): z.infer<T>[] {
    return data
      .map((item, index) => {
        try {
          return this.validateSingleNorisData(schema, item, {
            ...logContext,
            index,
            count: data.length,
          })
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
   *
   * @param logContext - logged on failure, e.g. the position in a batch.
   */
  validateSingleNorisData<T extends z.ZodType>(
    schema: T,
    data: unknown,
    logContext?: Record<string, unknown>,
  ): z.infer<T> {
    const result = schema.safeParse(data)
    if (!result.success) {
      throw this.errorFactoryService.BadRequestException({
        errorEnum: CustomErrorNorisTypesEnum.VALIDATE_NORIS_DATA_ERROR,
        message: result.error.message,
        console: {
          ...logContext,
          issues: result.error.issues.map(({ path, code }) => ({
            path: path.map(String).join('.'),
            code,
          })),
          norisSubjectId:
            typeof data === 'object' &&
            data !== null &&
            'cislo_subjektu' in data
              ? data.cislo_subjektu
              : undefined,
        },
        error: result.error,
      })
    }
    return result.data
  }
}

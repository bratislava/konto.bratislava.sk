import { ErrorFactoryService, LineLoggerSubservice } from '@bratislava/log-nest'
import { Injectable } from '@nestjs/common'
import z from 'zod'

import { CustomErrorNorisTypesEnum } from '../noris.errors'

@Injectable()
export class NorisValidatorService {
  constructor(
    private readonly errorFactoryService: ErrorFactoryService,
    private readonly logger: LineLoggerSubservice
  ) {}

  validateNorisData<T extends z.ZodType>(schema: T, data: unknown[]): z.infer<T>[]
  validateNorisData<T extends z.ZodType>(schema: T, data: unknown): z.infer<T>
  // eslint-disable-next-line sonarjs/function-return-type -- TODO consider fixing
  validateNorisData<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> | z.infer<T>[] {
    if (Array.isArray(data)) {
      return data
        .map((item, index) => {
          try {
            return this.validateNorisData(schema, item)
          } catch (error) {
            this.logger.error(error, { index, itemCount: data.length })
            return undefined
          }
        })
        .filter((item): item is z.infer<T> => item !== undefined)
    }

    const result = schema.safeParse(data)
    if (!result.success) {
      throw this.errorFactoryService.BadRequestException({
        errorEnum: CustomErrorNorisTypesEnum.VALIDATE_NORIS_DATA_ERROR,
        message: result.error.message,
        console: {
          issues: result.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            code: issue.code,
          })),
        },
        error: result.error,
      })
    }
    return result.data
  }
}

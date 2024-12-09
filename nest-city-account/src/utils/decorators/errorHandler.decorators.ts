import { LineLoggerSubservice } from '../subservices/line-logger.subservice'
import { errorToLogfmt } from '../logging'

export function HandleErrors(loggerName = 'Error Handler Decorator'): MethodDecorator {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value
    const logger = new LineLoggerSubservice(loggerName)

    descriptor.value = async function (...args: undefined[]) {
      try {
        const result = await originalMethod.apply(this, args)
        return result
      } catch (error) {
        logger.error(errorToLogfmt(error, propertyKey))
      }
      return null
    }
    return descriptor
  }
}

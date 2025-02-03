import { errorToLogfmt } from '../logging'
import { LineLoggerSubservice } from '../subservices/line-logger.subservice'

export function HandleErrors(
  loggerName = 'Error Handler Decorator',
): MethodDecorator {
  // eslint-disable-next-line func-names
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value
    const logger = new LineLoggerSubservice(loggerName)

    // eslint-disable-next-line no-param-reassign,func-names
    descriptor.value = async function (...args: undefined[]) {
      try {
        const result = await originalMethod.apply(this, args)
        return result
      } catch (error) {
        logger.error(error)
      }
      return null
    }
    return descriptor
  }
}

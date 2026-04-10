import { LineLoggerSubservice } from '../subservices/line-logger.subservice'

export default function HandleErrors(
  loggerName = 'Error Handler Decorator',
): MethodDecorator {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const value: unknown = descriptor.value
    if (typeof value !== 'function') {
      throw new TypeError(
        `@HandleErrors can only be applied to methods, got ${typeof value}`,
      )
    }
    const logger = new LineLoggerSubservice(loggerName)

    const modifiedDescriptor = descriptor
    modifiedDescriptor.value = async function errorHandlerWrapper(
      this: unknown,
      ...args: unknown[]
    ) {
      try {
        const result: unknown = await value.apply(this, args)
        return result
      } catch (error) {
        logger.error(error)
      }
      return null
    }
    return modifiedDescriptor
  }
}

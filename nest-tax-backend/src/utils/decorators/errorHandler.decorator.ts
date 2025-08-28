import { LineLoggerSubservice } from '../subservices/line-logger.subservice'

export default function HandleErrors(
  loggerName = 'Error Handler Decorator',
): MethodDecorator {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value as (
      ...args: unknown[]
    ) => Promise<unknown>
    const logger = new LineLoggerSubservice(loggerName)

    const modifiedDescriptor = descriptor
    modifiedDescriptor.value = async function (...args: undefined[]) {
      try {
        const result = await originalMethod.apply(this, args)
        return result
      } catch (error) {
        logger.error(error)
      }
      return null
    }
    return modifiedDescriptor
  }
}

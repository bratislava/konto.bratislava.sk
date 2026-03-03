/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { LineLoggerSubservice } from '../subservices/line-logger.subservice'

export default function HandleErrors(
  loggerName = 'Error Handler Decorator',
): MethodDecorator {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value
    const logger = new LineLoggerSubservice(loggerName)

    const modifiedDescriptor = descriptor
    modifiedDescriptor.value = async function errorHandlerWrapper(
      ...args: undefined[]
    ) {
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

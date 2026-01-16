import ThrowerErrorGuard from '../guards/errors.guard'
import { ErrorsEnum, ErrorsResponseEnum } from '../guards/dtos/error.dto'

export interface IHasThrowerErrorGuard {
  throwerErrorGuard: ThrowerErrorGuard
}

export function CatchDatabaseError() {
  return function (
    target: IHasThrowerErrorGuard,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (this: IHasThrowerErrorGuard, ...args: unknown[]) {
      try {
        return originalMethod.apply(this, args)
      } catch (error) {
        if (!this.throwerErrorGuard) {
          throw new Error(
            `CatchDatabaseError decorator requires the class to have a 'throwerErrorGuard' property. ` +
              `Please ensure ${target.constructor.name} implements IHasThrowerErrorGuard.`
          )
        }
        throw this.throwerErrorGuard.UnprocessableEntityException(
          ErrorsEnum.DATABASE_ERROR,
          ErrorsResponseEnum.DATABASE_ERROR,
          undefined,
          error
        )
      }
    }
    return descriptor
  }
}

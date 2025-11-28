import ThrowerErrorGuard from '../guards/errors.guard'
import { ErrorsEnum, ErrorsResponseEnum } from '../guards/dtos/error.dto'

export interface IHasThrowerErrorGuard {
  throwerErrorGuard: ThrowerErrorGuard
}

export function CatchDatabaseError() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (this: IHasThrowerErrorGuard, ...args: any[]) {
      try {
        return await originalMethod.apply(this, args)
      } catch (error) {
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

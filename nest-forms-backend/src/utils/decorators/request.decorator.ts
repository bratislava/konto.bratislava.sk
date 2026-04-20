import { Transform, TransformFnParams } from 'class-transformer'

export function ToBoolean(): PropertyDecorator {
  return Transform(({ value }: TransformFnParams) =>
    value === undefined
      ? undefined
      : value === 'true' || value === true || value === 1 || value === '1',
  )
}

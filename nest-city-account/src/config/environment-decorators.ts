import { applyDecorators } from '@nestjs/common'
import { Expose, Transform } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator'

function BooleanTransform() {
  return Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      const lower = value.toLowerCase()
      if (lower === 'true') {
        return true
      }
      if (lower === 'false') {
        return false
      }
    }
    return value
  })
}

function NumberTransform() {
  return Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string' && value.trim() !== '') {
      const num = Number(value)
      return Number.isNaN(num) ? value : num
    }
    return value
  })
}

function StringListTransform() {
  return Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      if (value.trim() === '') {
        return undefined
      }
      return value
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    }
    return value
  })
}

export function EnvBoolean() {
  return applyDecorators(Expose(), BooleanTransform(), IsBoolean(), IsNotEmpty())
}

export function EnvInt(min?: number, max?: number) {
  return applyDecorators(
    Expose(),
    NumberTransform(),
    IsInt(),
    IsNotEmpty(),
    ...(min === undefined ? [] : [Min(min)]),
    ...(max === undefined ? [] : [Max(max)])
  )
}

export function EnvPort() {
  return EnvInt(0, 65_535)
}

export function EnvString() {
  return applyDecorators(Expose(), IsString(), IsNotEmpty())
}

export function EnvUrl() {
  return applyDecorators(Expose(), IsUrl(), IsNotEmpty())
}

export function EnvStringList() {
  return applyDecorators(
    Expose(),
    StringListTransform(),
    IsArray(),
    IsString({ each: true }),
    ArrayMinSize(1)
  )
}

export function EnvEnum(enumType: object) {
  return applyDecorators(Expose(), IsEnum(enumType), IsNotEmpty())
}

/**
 * For a field whose value is computed from - and must be validated against - the entire
 * raw environment object, not just its own key. Use for derived/cross-field config (e.g. a
 * per-name family of related variables, such as OAUTH2_{PREFIX}_*) where a single-property
 * decorator can't express the dependency. parseFn should throw on invalid input, failing
 * config validation the same way any other required environment variable would.
 */
export function EnvValidateDependent(parseFn: (env: Record<string, unknown>) => unknown) {
  return applyDecorators(
    Expose(),
    Transform(({ obj }: { obj: Record<string, unknown> }) => parseFn(obj))
  )
}

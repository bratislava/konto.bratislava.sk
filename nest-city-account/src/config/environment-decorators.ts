import { applyDecorators } from '@nestjs/common'
import { Expose, Transform } from 'class-transformer'
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator'

function BooleanTransform() {
  return Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      // An empty/whitespace-only string means "not set" - treat it as absent so
      // IsOptional() skips validation instead of IsBoolean() rejecting it and
      // failing the whole (atomically-validated) config.
      if (value.trim() === '') {
        return undefined
      }
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
    if (typeof value === 'string') {
      // Same "empty means absent" rule as BooleanTransform above.
      if (value.trim() === '') {
        return undefined
      }
      const num = Number(value)
      return Number.isNaN(num) ? value : num
    }
    return value
  })
}

export function EnvBoolean(required = true) {
  return applyDecorators(
    Expose(),
    BooleanTransform(),
    IsBoolean(),
    ...(required ? [IsNotEmpty()] : [IsOptional()])
  )
}

export function EnvInt(min?: number, max?: number, required = true) {
  return applyDecorators(
    Expose(),
    NumberTransform(),
    IsInt(),
    ...(required ? [IsNotEmpty()] : [IsOptional()]),
    ...(min === undefined ? [] : [Min(min)]),
    ...(max === undefined ? [] : [Max(max)])
  )
}

export function EnvPort(required = true) {
  return EnvInt(0, 65_535, required)
}

export function EnvString(required = true) {
  return applyDecorators(Expose(), IsString(), ...(required ? [IsNotEmpty()] : [IsOptional()]))
}

export function EnvUrl(required = true) {
  return applyDecorators(Expose(), IsUrl(), ...(required ? [IsNotEmpty()] : [IsOptional()]))
}

export function EnvEnum(enumType: object, required = true) {
  return applyDecorators(
    Expose(),
    IsEnum(enumType),
    ...(required ? [IsNotEmpty()] : [IsOptional()])
  )
}

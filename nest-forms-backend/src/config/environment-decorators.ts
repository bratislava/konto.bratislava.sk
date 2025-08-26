import { applyDecorators } from '@nestjs/common'
import { Expose, Transform } from 'class-transformer'
import {
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
  return Transform(({ value }) => {
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
  return Transform(({ value }) => {
    if (typeof value === 'string' && value.trim() !== '') {
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
    ...(required ? [IsNotEmpty()] : []),
  )
}

export function EnvInt(min?: number, max?: number, required = true) {
  return applyDecorators(
    Expose(),
    NumberTransform(),
    IsInt(),
    ...(required ? [IsNotEmpty()] : []),
    ...(min === undefined ? [] : [Min(min)]),
    ...(max === undefined ? [] : [Max(max)]),
  )
}

export function EnvPort(required = true) {
  return EnvInt(0, 65_535, required)
}

export function EnvString(required = true) {
  return applyDecorators(
    Expose(),
    IsString(),
    ...(required ? [IsNotEmpty()] : []),
  )
}

export function EnvUrl(required = true) {
  return applyDecorators(Expose(), IsUrl(), ...(required ? [IsNotEmpty()] : []))
}

export function EnvEnum(enumType: object, required = true) {
  return applyDecorators(
    Expose(),
    IsEnum(enumType),
    ...(required ? [IsNotEmpty()] : []),
  )
}

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

export function EnvBoolean(required = true) {
  return applyDecorators(
    Expose(),
    Transform(
      ({ obj, key }) => {
        const raw = obj[key]
        if (typeof raw === 'boolean') {
          return raw
        }
        const value = String(raw).toLowerCase()
        switch (value) {
          case 'true':
            return true

          case 'false':
            return false

          default:
            // this should fail the boolean validation later
            return raw
        }
      },
      { toClassOnly: true },
    ),
    IsBoolean(),
    ...(required ? [IsNotEmpty()] : []),
  )
}

export function EnvInt(min?: number, max?: number, required = true) {
  return applyDecorators(
    Expose(),
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

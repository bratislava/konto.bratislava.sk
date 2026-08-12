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

export function EnvBoolean({ required = true }: { required?: boolean } = {}) {
  return applyDecorators(
    Expose(),
    BooleanTransform(),
    IsBoolean(),
    ...(required ? [IsNotEmpty()] : [])
  )
}

export function EnvInt({
  min,
  max,
  required = true,
}: {
  min?: number
  max?: number
  required?: boolean
} = {}) {
  return applyDecorators(
    Expose(),
    NumberTransform(),
    IsInt(),
    ...(required ? [IsNotEmpty()] : []),
    ...(min === undefined ? [] : [Min(min)]),
    ...(max === undefined ? [] : [Max(max)])
  )
}

export function EnvPort({ required = true }: { required?: boolean } = {}) {
  return EnvInt({ min: 0, max: 65_535, required })
}

export function EnvString({ required = true }: { required?: boolean } = {}) {
  return applyDecorators(Expose(), IsString(), ...(required ? [IsNotEmpty()] : []))
}

export function EnvUrl({
  requireTld = true,
  required = true,
}: {
  requireTld?: boolean
  required?: boolean
} = {}) {
  return applyDecorators(
    Expose(),
    // requireTld toggles whether the URL must have a top-level domain (TLD)
    // Disable it for Kubernetes service URLs (e.g. http://nest-forms-backend-app).
    IsUrl({ require_tld: requireTld }),
    ...(required ? [IsNotEmpty()] : [])
  )
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

export function EnvEnum(enumType: object, { required = true }: { required?: boolean } = {}) {
  return applyDecorators(Expose(), IsEnum(enumType), ...(required ? [IsNotEmpty()] : []))
}

/**
 * For a field whose value is computed by a custom transform - and validated against - the
 * entire raw environment object, not just its own key. Use for derived/cross-field config
 * (e.g. a per-name family of related variables, such as OAUTH2_{PREFIX}_*) where a
 * single-property decorator can't express the dependency. parseFn should throw on invalid
 * input, failing config validation the same way any other required environment variable
 * would.
 *
 * `required` only guards against the transformed value being undefined/null/empty-string -
 * an empty array or object still passes, since IsNotEmpty does not consider those "empty".
 */
export function EnvCustom(
  parseFn: (env: Record<string, unknown>) => unknown,
  { required = true }: { required?: boolean } = {}
) {
  return applyDecorators(
    Expose(),
    Transform(({ obj }: { obj: Record<string, unknown> }) => parseFn(obj)),
    ...(required ? [IsNotEmpty()] : [])
  )
}

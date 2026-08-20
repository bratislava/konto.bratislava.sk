import { ajvResolver } from '@hookform/resolvers/ajv'
import { JSONSchemaType } from 'ajv'
import { useTranslation } from 'next-i18next/pages'
import { DefaultValues, FieldValues, Resolver, useForm } from 'react-hook-form'

type Errors = Record<string, string | undefined>

interface Props<T> {
  // used any as strictNullChecks must be true in tsconfig to use JSONSchemaType<T>
  schema: any
  defaultValues: DefaultValues<T>
  /**
   * Field names excluded from trimming on submit. Defaults to password-like fields and tokens,
   * where leading/trailing whitespace may be intentional.
   */
  noTrimFields?: string[]
}

const defaultNoTrimFields = ['password', 'oldPassword', 'turnstileToken']

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== 'object') {
    return false
  }
  const prototype: unknown = Object.getPrototypeOf(value)

  return prototype === Object.prototype || prototype === null
}

/**
 * Returns a deep copy with all string values trimmed, except for keys listed in `noTrimFields`.
 * Only applied on submit (inside the resolver), so the displayed input value is not changed.
 * Recurses only into plain objects and arrays, so values like `File`, `Date` or `CalendarDate`
 * are passed through untouched instead of being flattened into plain objects.
 */
const trimValues = (value: unknown, noTrimFields: string[]): unknown => {
  if (typeof value === 'string') {
    return value.trim()
  }
  if (Array.isArray(value)) {
    return (value as unknown[]).map((item) => trimValues(item, noTrimFields))
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        noTrimFields.includes(key) ? nestedValue : trimValues(nestedValue, noTrimFields),
      ]),
    )
  }

  return value
}

export default function useHookForm<T extends FieldValues>({
  schema,
  defaultValues,
  noTrimFields = defaultNoTrimFields,
}: Props<T>) {
  const { t } = useTranslation()

  // if we want password to contain special symbol add (?=.*?[ !"#$%&'()*+,./:;<=>?@[\\\]^_`{|}~-])
  const resolver = ajvResolver(schema as JSONSchemaType<T>, {
    formats: {
      file: () => true,
      phone: '^\\+\\d{6,18}$',
      email:
        "^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$",
      password: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?\d).{8,}$/,
      postalCode: '^\\s*(\\d\\s*\\d\\s*\\d\\s*\\d\\s*\\d)?\\s*$',
      // postalCode: '^([0-9]{5}|)$',
      idCard: '^([a-zA-Z]{2})([0-9]{6})([0-9]?)$',
      ico: '^[0-9]{8}$',
      rc: (value: string) => {
        const formattedValue = value.replace('/', '')

        const rc = Number(formattedValue)
        if (Number.isNaN(rc)) {
          return false
        }
        if (formattedValue.length === 9) {
          return true
        }
        if (formattedValue.length === 10) {
          return rc % 11 === 0 || (rc % 10 === 0 && (rc / 10) % 11 === 10)
        }

        return false
      },
      verificationCode: '^[0-9]{6}$',
    },
    $data: true,
  })

  // The resolver output is what `handleSubmit` passes to the submit callback, so trimming here
  // both validates the trimmed values and sends them trimmed, without touching the field values.
  const trimmingResolver: Resolver<T> = (values, context, options) =>
    resolver(trimValues(values, noTrimFields) as T, context, options)

  const form = useForm({
    resolver: trimmingResolver,
    defaultValues,
  })

  const errors: Errors = {}
  Object.keys(form.formState.errors).forEach((key: string) => {
    const errorMessage = form.formState.errors[key]?.message?.toString()
    errors[key] = t(errorMessage || 'error')
  })

  return { ...form, errors }
}

import { ajvResolver } from '@hookform/resolvers/ajv'
import { JSONSchemaType } from 'ajv'
import { useTranslation } from 'next-i18next/pages'
import { DefaultValues, FieldValues, useForm, UseFormHandleSubmit } from 'react-hook-form'

import trimStringValues from '@/src/frontend/utils/trimStringValues'

type Errors = Record<string, string | undefined>

// IMPORTANT: All password fields must be included in this array to prevent whitespace trimming on them.
const passwordKeys = ['password', 'oldPassword'] as const

interface Props<T> {
  // used any as strictNullChecks must be true in tsconfig to use JSONSchemaType<T>
  schema: any
  defaultValues: DefaultValues<T>
}

export default function useHookForm<T extends FieldValues>({ schema, defaultValues }: Props<T>) {
  const { t } = useTranslation('account')

  const form = useForm({
    resolver: ajvResolver(schema as JSONSchemaType<T>, {
      formats: {
        file: () => true,
        phone: '^\\+\\d{6,18}$',
        email:
          "^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$",
        password: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?\d).{8,}$/,
        postalCode: '^\\s*(\\d\\s*\\d\\s*\\d\\s*\\d\\s*\\d)?\\s*$',
        // postalCode: '^([0-9]{5}|)$',
        idCard: '^([a-zA-Z]{2})([0-9]{6})([0-9]?)$',
        // TODO: Child organizations can have ICO with 12 digits (it contains 4-digit SID at the end),
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
    }),
    defaultValues,
  })

  const errors: Errors = {}
  Object.keys(form.formState.errors).forEach((key: string) => {
    const errorMessage = form.formState.errors[key]?.message?.toString()
    errors[key] = t(errorMessage || 'error')
  })

  // Trim the whole payload once more here before submitting, since per-field blur may not fire
  // on every input (e.g. mobile autofill). Password fields are skipped.
  const handleSubmit: UseFormHandleSubmit<T> = (onValid, onInvalid) =>
    form.handleSubmit(
      (data, event) => onValid(trimStringValues(data, { skippedKeys: passwordKeys }), event),
      onInvalid,
    )

  return { ...form, handleSubmit, errors }
}

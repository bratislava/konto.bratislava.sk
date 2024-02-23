import { ajvResolver } from '@hookform/resolvers/ajv'
import { JSONSchemaType } from 'ajv'
import { useTranslation } from 'next-i18next'
import { DefaultValues, FieldValues, useForm } from 'react-hook-form'

interface Errors {
  [key: string]: string[]
}

interface Props<T> {
  // used any as strictNullChecks must be true in tsconfig to use JSONSchemaType<T>
  schema: any
  defaultValues: DefaultValues<T>
}

export default function useHookForm<T extends FieldValues>({ schema, defaultValues }: Props<T>) {
  const { t } = useTranslation()
  // if we want password to contain special symbol add (?=.*?[ !"#$%&'()*+,./:;<=>?@[\\\]^_`{|}~-])
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
    errors[key] = [t(errorMessage || 'error')]
  })

  return { ...form, errors }
}

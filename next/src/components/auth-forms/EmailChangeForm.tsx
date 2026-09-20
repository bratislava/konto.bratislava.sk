import { Button, Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { Controller } from 'react-hook-form'

import PasswordField from '@/src/components/fields/PasswordField'
import TextField from '@/src/components/fields/TextField'
import AccountErrorAlert from '@/src/components/segments/AccountErrorAlert/AccountErrorAlert'
import useHookForm from '@/src/frontend/hooks/useHookForm'

interface Data {
  newEmail: string
  password: string
}

interface Props {
  onSubmit: (email: string, password: string) => Promise<any>
  error?: Error | null
}

// must use `minLength: 1` to implement required field
const schema = {
  type: 'object',
  properties: {
    newEmail: {
      type: 'string',
      minLength: 1,
      format: 'email',
      errorMessage: {
        minLength: 'auth.fields.email.required',
        format: 'auth.fields.email.format',
      },
    },
    password: {
      type: 'string',
      minLength: 1,
      errorMessage: { minLength: 'auth.fields.password.required' },
    },
  },
  required: ['newEmail', 'password'],
}

/**
 * Figma: https://www.figma.com/design/0VrrvwWs7n3T8YFzoHe92X/BK--Dizajn--DEV-?node-id=822-65528&p=f&t=exwgWgm6FlZ6RJVr-0
 */

const EmailChangeForm = ({ onSubmit, error }: Props) => {
  const { t } = useTranslation()

  const {
    handleSubmit,
    control,
    errors,
    formState: { isSubmitting },
  } = useHookForm<Data>({
    schema,
    defaultValues: { newEmail: '', password: '' },
  })

  return (
    <form
      noValidate // We use AJV validation
      className="flex flex-col gap-4 lg:gap-6"
      onSubmit={handleSubmit((data: Data) => onSubmit(data.newEmail, data.password))}
      data-cy="change-email-form"
    >
      <Typography variant="h3" as="h1">
        {t('EmailChangeForm.title')}
      </Typography>
      <Typography variant="p-small">{t('EmailChangeForm.description')}</Typography>
      <AccountErrorAlert error={error} />
      <Controller
        name="newEmail"
        control={control}
        render={({ field }) => (
          <TextField
            isRequired
            label={t('auth.fields.newEmail.label')}
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            {...field}
            errorMessage={errors.email}
          />
        )}
      />
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <PasswordField
            isRequired
            label={t('auth.fields.newEmailPassword.label')}
            {...field}
            errorMessage={errors.password}
          />
        )}
      />
      <Button
        variant="solid"
        type="submit"
        fullWidth
        isDisabled={isSubmitting}
        data-cy="change-email-submit"
      >
        {t('EmailChangeForm.submit')}
      </Button>
    </form>
  )
}

export default EmailChangeForm

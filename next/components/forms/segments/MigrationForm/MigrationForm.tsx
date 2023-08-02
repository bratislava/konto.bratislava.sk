import AccountErrorAlert from 'components/forms/segments/AccountErrorAlert/AccountErrorAlert'
import AccountLink from 'components/forms/segments/AccountLink/AccountLink'
import LoginAccountLink from 'components/forms/segments/LoginAccountLink/LoginAccountLink'
import Button from 'components/forms/simple-components/Button'
import InputField from 'components/forms/widget-components/InputField/InputField'
import { ROUTES } from 'frontend/api/constants'
import useHookForm from 'frontend/hooks/useHookForm'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { Controller } from 'react-hook-form'

interface Data {
  email: string
}

interface Props {
  onSubmit: (email: string) => Promise<any>
  error?: Error | null
  lastEmail: string
  setLastEmail: (email: string) => void
}

const MigrationForm = ({ onSubmit, error, lastEmail, setLastEmail }: Props) => {
  const router = useRouter()
  const queryEmail =
    router.query.email && typeof router.query.email === 'string'
      ? decodeURIComponent(router.query.email)
      : ''

  const queryFullname =
    router.query.fullname && typeof router.query.fullname === 'string'
      ? decodeURIComponent(router.query.fullname)
      : ''

  const schema = {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        minLength: 1,
        // validate input, not query param
        format: queryEmail ? undefined : 'email',
        errorMessage: { minLength: 'account:email_required', format: 'account:email_format' },
      },
    },
    required: ['email'],
  }

  const { t } = useTranslation('account')
  const {
    handleSubmit,
    control,
    errors,
    formState: { isSubmitting },
  } = useHookForm<Data>({
    schema,
    defaultValues: { email: queryEmail },
  })

  return (
    <form
      className="flex flex-col space-y-4"
      onSubmit={handleSubmit((data: Data) => {
        setLastEmail(data.email)
        return onSubmit(data.email)
      })}
    >
      <h1 className="text-h3">
        {t(queryEmail ? 'migration_recognized_title' : 'migration_title', {
          fullname: queryFullname,
        })}
      </h1>
      <p className="text-p3 lg:text-p2">
        {t(queryEmail ? 'migration_recognized_description' : 'migration_description', {
          email: queryEmail,
        })}
      </p>
      <p className="text-p3 lg:text-p2">{t('migration_submit_description')}</p>
      <AccountErrorAlert error={error} args={{ email: lastEmail }} />
      {!queryEmail && (
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <InputField
              required
              label={t('email_label')}
              placeholder={t('email_placeholder')}
              {...field}
              errorMessage={errors.email}
            />
          )}
        />
      )}
      <Button
        className="min-w-full"
        type="submit"
        text={t('migration_submit')}
        variant="category"
        disabled={isSubmitting}
      />
      <LoginAccountLink />
      {!queryEmail && (
        <AccountLink
          label={t('register_link')}
          variant="category"
          description={t('migration_register_description')}
          href={ROUTES.REGISTER}
        />
      )}
    </form>
  )
}

export default MigrationForm

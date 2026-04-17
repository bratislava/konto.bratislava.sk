import { Button } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { Controller } from 'react-hook-form'

import TextField from '@/src/components/fields/TextField'
import { AccountType, UserAttributes } from '@/src/frontend/dtos/accountDto'
import useHookForm from '@/src/frontend/hooks/useHookForm'
import { ROUTES } from '@/src/utils/routes'

type UserProfileEditableData = {
  email?: string
  business_name?: string
  given_name?: string
  family_name?: string
}

// must use `minLength: 1` to implement required field
const foSchema = {
  type: 'object',
  properties: {
    given_name: {
      type: 'string',
      minLength: 1,
      errorMessage: { minLength: 'account:auth.fields.given_name_required' },
    },
    family_name: {
      type: 'string',
      minLength: 1,
      errorMessage: { minLength: 'account:auth.fields.family_name_required' },
    },
    email: {
      type: 'string',
      minLength: 1,
      format: 'email',
      errorMessage: {
        minLength: 'account:auth.fields.email_required',
        format: 'account:auth.fields.email_format',
      },
    },
  },
  required: ['email', 'given_name', 'family_name'],
}

const poSchema = {
  type: 'object',
  properties: {
    business_name: {
      type: 'string',
    },
    email: {
      type: 'string',
      minLength: 1,
      format: 'email',
      errorMessage: {
        minLength: 'account:auth.fields.email_required',
        format: 'account:auth.fields.email_format',
      },
    },
  },
  required: ['email'],
}

type Props = {
  formId: string
  userAttributes: UserAttributes
  onSubmit: (newUserData: UserAttributes) => void
}

const UserProfileDetailsEdit = ({ formId, userAttributes, onSubmit }: Props) => {
  const { t } = useTranslation('account')

  const {
    name,
    given_name,
    family_name,
    email,
    'custom:account_type': account_type,
  } = userAttributes

  const isLegalEntity = account_type !== AccountType.FyzickaOsoba

  const { handleSubmit, control, errors } = useHookForm<UserProfileEditableData>({
    schema: isLegalEntity ? poSchema : foSchema,
    defaultValues: {
      business_name: name,
      family_name,
      given_name,
      email,
    },
  })

  const handleSubmitCallback = (data: UserProfileEditableData) => {
    const newUserData: UserAttributes = {
      email: data.email,
      name: data.business_name,
      given_name: data.given_name,
      family_name: data.family_name,
    }

    return onSubmit(newUserData)
  }

  return (
    <form
      id={formId}
      className="flex grow flex-col gap-6"
      onSubmit={handleSubmit(handleSubmitCallback)}
      data-cy="edit-personal-information-form-container"
    >
      <div className="flex flex-row flex-wrap gap-6">
        {isLegalEntity ? (
          <div className="w-full grow lg:w-fit">
            <Controller
              name="business_name"
              control={control}
              render={({ field }) => (
                <TextField
                  autoCapitalize="on"
                  autoCorrect="off"
                  spellCheck="false"
                  label={t('my_profile.profile_detail.business_name')}
                  {...field}
                  errorMessage={errors.given_name}
                />
              )}
            />
          </div>
        ) : (
          <>
            <div className="w-full grow lg:w-fit">
              <Controller
                name="given_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    isRequired
                    autoCapitalize="on"
                    autoCorrect="off"
                    spellCheck="false"
                    label={t('my_profile.profile_detail.given_name')}
                    {...field}
                    errorMessage={errors.given_name}
                  />
                )}
              />
            </div>
            <div className="w-full grow lg:w-fit">
              <Controller
                name="family_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    isRequired
                    autoCapitalize="on"
                    autoCorrect="off"
                    spellCheck="false"
                    label={t('my_profile.profile_detail.family_name')}
                    {...field}
                    errorMessage={errors.family_name}
                  />
                )}
              />
            </div>
          </>
        )}
      </div>
      <div className="flex flex-row flex-wrap items-end gap-4">
        <div className="w-full grow lg:w-fit">
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                isDisabled
                isRequired
                label={t('my_profile.profile_detail.email')}
                autoComplete="username"
                {...field}
                errorMessage={errors.email}
              />
            )}
          />
        </div>
        <Button
          variant="outline"
          href={ROUTES.EMAIL_CHANGE}
          hasLinkIcon={false}
          data-cy="change-email-button"
        >
          {t('my_profile.profile_detail.email_button')}
        </Button>
      </div>
    </form>
  )
}

export default UserProfileDetailsEdit

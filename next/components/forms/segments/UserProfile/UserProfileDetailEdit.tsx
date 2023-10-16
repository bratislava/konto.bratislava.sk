import cx from 'classnames'
import Button from 'components/forms/simple-components/Button'
import InputField from 'components/forms/widget-components/InputField/InputField'
import { AccountType, Address, UserData } from 'frontend/dtos/accountDto'
import useHookForm from 'frontend/hooks/useHookForm'
import useJsonParseMemo from 'frontend/hooks/useJsonParseMemo'
import { ajvFormats } from 'frontend/utils/form'
import { useTranslation } from 'next-i18next'
import { Controller } from 'react-hook-form'

interface Data {
  email?: string
  business_name?: string
  given_name?: string
  family_name?: string
  phone_number?: string
  street_address?: string
  city?: string
  postal_code?: string
}

// must use `minLength: 1` to implement required field
const foSchema = {
  type: 'object',
  properties: {
    given_name: {
      type: 'string',
      minLength: 1,
      errorMessage: { minLength: 'account:given_name_required' },
    },
    family_name: {
      type: 'string',
      minLength: 1,
      errorMessage: { minLength: 'account:family_name_required' },
    },
    email: {
      type: 'string',
      minLength: 1,
      format: 'email',
      errorMessage: { minLength: 'account:email_required', format: 'account:email_format' },
    },
    phone_number: {
      type: 'string',
    },
    street_address: {
      type: 'string',
    },
    city: {
      type: 'string',
    },
    postal_code: {
      type: 'string',
      format: 'postalCode',
      errorMessage: { format: 'account:postal_code_format' },
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
      errorMessage: { minLength: 'account:email_required', format: 'account:email_format' },
    },
    phone_number: {
      type: 'string',
    },
    street_address: {
      type: 'string',
    },
    city: {
      type: 'string',
    },
    postal_code: {
      type: 'string',
      format: 'postalCode',
      errorMessage: { format: 'account:postal_code_format' },
    },
  },
  required: ['email'],
}

const isValidPhoneNumber = (phoneNumber: string) => {
  const regex = ajvFormats['phone-number']
  return regex.test(phoneNumber)
}
interface UserProfileDetailEditProps {
  formId: string
  userData: UserData
  onOpenEmailModal: () => void
  onSubmit: (newUserData: UserData) => void
}

const UserProfileDetailEdit = (props: UserProfileDetailEditProps) => {
  const { formId, userData, onOpenEmailModal, onSubmit } = props
  const { t } = useTranslation('account')
  const { address, name, family_name, given_name, email, phone_number } = userData
  const isLegalEntity = userData?.['custom:account_type'] !== AccountType.FyzickaOsoba
  const parsedAddress = useJsonParseMemo<Address>(address)
  const { handleSubmit, control, errors, setError } = useHookForm<Data>({
    schema: isLegalEntity ? poSchema : foSchema,
    defaultValues: {
      business_name: name,
      family_name,
      given_name,
      email,
      phone_number,
      street_address: parsedAddress?.street_address,
      city: parsedAddress?.locality,
      postal_code: parsedAddress?.postal_code,
    },
  })

  const handleSubmitCallback = (data: Data) => {
    if (!data.phone_number || isValidPhoneNumber(data.phone_number)) {
      const newUserData: UserData = {
        email: data.email,
        name: data.business_name,
        given_name: data.given_name,
        family_name: data.family_name,
        phone_number: data.phone_number || '',
        address: JSON.stringify({
          street_address: data.street_address,
          locality: data.city,
          postal_code: data.postal_code?.replaceAll(' ', ''),
        }),
      }
      return onSubmit(newUserData)
    }

    return setError('phone_number', { type: 'manual', message: 'account:phone_number_format' })
  }

  return (
    <form
      id={formId}
      className="flex grow flex-col gap-6 pb-20 md:pb-0"
      onSubmit={handleSubmit(handleSubmitCallback)}
    >
      <div className="gap flex flex-row flex-wrap gap-6">
        {isLegalEntity ? (
          <div className="w-full grow md:w-fit">
            <Controller
              name="business_name"
              control={control}
              render={({ field }) => (
                <InputField
                  capitalize
                  label={t('profile_detail.business_name')}
                  {...field}
                  errorMessage={errors.given_name}
                />
              )}
            />
          </div>
        ) : (
          <>
            <div className="w-full grow md:w-fit">
              <Controller
                name="given_name"
                control={control}
                render={({ field }) => (
                  <InputField
                    required
                    capitalize
                    label={t('profile_detail.given_name')}
                    {...field}
                    errorMessage={errors.given_name}
                  />
                )}
              />
            </div>
            <div className="w-full grow md:w-fit">
              <Controller
                name="family_name"
                control={control}
                render={({ field }) => (
                  <InputField
                    required
                    capitalize
                    label={t('profile_detail.family_name')}
                    {...field}
                    errorMessage={errors.family_name}
                  />
                )}
              />
            </div>
          </>
        )}
      </div>
      <div className="flex flex-row flex-wrap gap-4">
        <div className={cx('w-full grow', 'md:w-fit')}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <InputField
                disabled
                label={t('profile_detail.email')}
                tooltip={t('profile_detail.email_tooltip')}
                autoComplete="username"
                {...field}
                errorMessage={errors.email}
              />
            )}
          />
        </div>
        <div className="flex flex-col justify-end pt-1">
          <Button
            variant="black"
            size="lg"
            text={t('profile_detail.email_button')}
            className="hidden md:block"
            onPress={onOpenEmailModal}
          />
          <Button
            variant="black"
            size="sm"
            text={t('profile_detail.email_button')}
            className="block md:hidden"
            onPress={onOpenEmailModal}
          />
        </div>
      </div>
      <div className="gap flex flex-row flex-wrap gap-x-6">
        <div className="w-full grow md:w-fit">
          <Controller
            name="phone_number"
            control={control}
            render={({ field }) => (
              <InputField
                label={t('profile_detail.phone_number')}
                helptext={t('profile_detail.phone_number_pattern')}
                {...field}
                errorMessage={errors.phone_number}
              />
            )}
          />
        </div>
        <div className="invisible h-0 w-full grow md:w-fit">
          <InputField label={t('profile_detail.phone_number')} />
        </div>
      </div>
      <div className="h-0 w-full border-b-2 border-gray-200" />
      <h5 className="text-h5">{t('profile_detail.address')}</h5>
      <Controller
        name="street_address"
        control={control}
        render={({ field }) => (
          <InputField
            label={t('profile_detail.street')}
            capitalize
            {...field}
            errorMessage={errors.street_address}
          />
        )}
      />
      <div className="gap flex flex-row flex-wrap gap-6">
        <div className="grow">
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <InputField
                label={t('profile_detail.city')}
                capitalize
                {...field}
                errorMessage={errors.city}
              />
            )}
          />
        </div>
        <div className={cx('w-full', 'md:w-52')}>
          <Controller
            name="postal_code"
            control={control}
            render={({ field }) => (
              <InputField
                tooltip={t('profile_detail.postal_code_tooltip')}
                label={t('profile_detail.postal_code')}
                {...field}
                errorMessage={errors.postal_code}
              />
            )}
          />
        </div>
      </div>
      <div className={cx('py-2', 'md:hidden')}>
        <Button
          variant="black"
          size="sm"
          text={t('profile_detail.save_edit_button')}
          type="submit"
          form={formId}
          className="w-full"
        />
      </div>
    </form>
  )
}

export default UserProfileDetailEdit

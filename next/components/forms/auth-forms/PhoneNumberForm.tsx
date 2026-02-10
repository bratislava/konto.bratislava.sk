import { useTranslation } from 'next-i18next'
import { Controller } from 'react-hook-form'

import useHookForm from '@/frontend/hooks/useHookForm'

import AccountErrorAlert from '../segments/AccountErrorAlert/AccountErrorAlert'
import Button from '../simple-components/Button'
import InputField from '../widget-components/InputField/InputField'

export interface PhoneNumberData {
  phone_number?: string
}

const schema = {
  type: 'object',
  properties: {
    phone_number: {
      type: 'string',
      format: 'phone',
      errorMessage: { format: 'account:auth.fields.phone_number_format' },
    },
  },
  required: ['phone_number'],
}

interface Props {
  error?: Error | null
  onHideError?: () => void
  onSubmit: ({ data }: { data?: PhoneNumberData }) => void
  defaultValues?: PhoneNumberData
}

const PhoneNumberForm = ({ error, onHideError, onSubmit, defaultValues }: Props) => {
  const { t } = useTranslation('account')
  const {
    handleSubmit,
    control,
    errors,
    formState: { isSubmitting },
  } = useHookForm<PhoneNumberData>({
    schema,
    defaultValues: { ...defaultValues },
  })

  return (
    <form
      className="flex w-full flex-col space-y-4"
      onSubmit={handleSubmit((data: PhoneNumberData) => onSubmit({ data }))}
    >
      <div className="whitespace-pre-line">
        <div className="text-p2">{t('phone_number_modal.description')}</div>
      </div>
      <AccountErrorAlert error={error} close={onHideError} solid />
      <Controller
        name="phone_number"
        control={control}
        render={({ field }) => (
          <InputField
            label={t('my_profile.profile_detail.phone_number')}
            placeholder={t('my_profile.profile_detail.phone_number_placeholder')}
            {...field}
            errorMessage={errors.phone_number}
          />
        )}
      />
      <Button variant="solid" type="submit" fullWidth isDisabled={isSubmitting}>
        {t('phone_number_form.save_changes_button')}
      </Button>
    </form>
  )
}

export default PhoneNumberForm

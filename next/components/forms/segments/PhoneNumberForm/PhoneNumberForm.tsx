import AccountErrorAlert from 'components/forms/segments/AccountErrorAlert/AccountErrorAlert'
import Button from 'components/forms/simple-components/Button'
import InputField from 'components/forms/widget-components/InputField/InputField'
import useHookForm from 'frontend/hooks/useHookForm'
import { useTranslation } from 'next-i18next'
import { Controller } from 'react-hook-form'

export interface PhoneNumberData {
  phone_number?: string
}

const schema = {
  type: 'object',
  properties: {
    phone_number: {
      type: 'string',
      format: 'phone',
      errorMessage: { format: 'forms:phone_format' },
    },
  },
  required: [],
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
        <div className="text-p2">{t('adding_phone_number_modal.description')}</div>
      </div>
      <AccountErrorAlert error={error} close={onHideError} solid />
      <Controller
        name="phone_number"
        control={control}
        render={({ field }) => (
          <InputField
            label={t('profile_detail.phone_number')}
            helptext={t('profile_detail.phone_number_pattern')}
            placeholder=""
            {...field}
            errorMessage={errors.phone_number}
          />
        )}
      />
      <Button
        className="min-w-full"
        type="submit"
        text={t('profile_detail.save_button')}
        variant="black"
        disabled={isSubmitting}
      />
    </form>
  )
}

export default PhoneNumberForm
